import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState, useRef } from 'react'
import Web3Modal from 'web3modal'
import { BigNumber, utils } from 'ethers'



export default function Home() {
  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokenMinted, setTokenMinted] = useState(zero);
  const [userCryptoDevsMinted, setUserCryptoDevsMinted] = useState(zero);

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
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
