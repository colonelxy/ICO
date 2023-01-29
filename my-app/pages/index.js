import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import Web3Modal from 'web3modal'
import { BigNumber, Contract, utils } from 'ethers'



export default function Home() {
  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokenMinted, setTokenMinted] = useState(zero);
  const [userCryptoDevsMinted, setUserCryptoDevsMinted] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);



  const getProviderOrSigner = async(needSigner = false) => {

    const provider = await web3ModalRef.current.connect();
    const web3Provider= new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if(chainId!==5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }

    if(needSigner) {
      const signer=web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

    }catch(e) {
      console.error(e)
    }
  };

  const getTokensToBeClaimed = async ()=> {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADRRESS, NFT_CONTRACT_ABI, provider);

      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if(balance===zero) {
        setTokensToBeClaimed(zero)
      } else {
        var amount = 0;
        for (var i =o; i<balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          if(!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }

    } catch(e) {
      console.error(e);
    }
  }

  const getBalanceOfCryptoDevTokens = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

      const signer = getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setUserCryptoDevsMinted(balance);
    } catch(e) {
      console.error(e);
    }
  };

  const getTotalTokensMinted = async() => {
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
      const _tokenMinted = await tokenContract.totalSupply();
      setTokenMinted(_tokenMinted);
    } catch(e) {
      console.error(e);
    }
  };


  const mintCryptoDevToken = async(amount) => {
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

      const value = 0.001*amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You've successfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();

    } catch(e) {
      console.error(e);
    }
  };

  const claimCryptoDevTokens = async()=>{
    try {
      const signer = getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully claimed Crypto Dev tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();

    } catch(e) {
      console.error(e);
    }
  };

  const renderButton=()=>{
    if(loading) {
      return (
      <div>
        <button className={styles.button}>Loading...</button>
      </div>
      );
    }

    if(tokensToBeClaimed) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens to be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      )

    }
    try{

      return (
        <div style={{display:"flex-col"}}>
          <div>
            <input type="number" placeholder="Amount of Tokens" onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}/>
            <button className={styles.button} disabled={!(tokemAmount>0)} onClick={() => mintCryptoDevToken(tokenAmount)}>
              Mint Tokens
            </button>
          </div>
        </div>

      );

    }catch(e) {
      console.error(e)
    }
  };

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet()

    }

  }, [])
  return (
    <div>
      <Head>
      <title>Crypto Devs ICO</title>
      <meta name='description' content='ICO-dApp' />
      <link rel='icon' href='./favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO</h1>
          <div className={styles.description}>
            You can claim or mint Crypro Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(userCryptoDevsMinted)} Crypto Dev tokens
              </div>
              <div className={styles.description}>
                Overal {utils.formatEther(tokenMinted)}/10000 have been minted
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect Wallet
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
