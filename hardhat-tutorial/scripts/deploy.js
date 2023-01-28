const { ethers } = require("hardhat");
require("dotenv").config({path: ".env"});
const {NFT_CONTRACT_ADDRESS} = require("../constants");

async function main() {
  const cryptoDevsTokenContract = await ethers.getContractFactory("CryptoDevToken");

  const deployCryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(NFT_CONTRACT_ADDRESS);

  console.log("CryptoDev Token Contract Address is:", deployCryptoDevsTokenContract.address);

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});