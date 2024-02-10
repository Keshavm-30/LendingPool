// const {ethers} = require('hardhat');
const hre = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main(){

  const usdt = await hre.ethers.deployContract("mockUSDT");
  console.log("usdt Address",usdt.target);

  const pool = await hre.ethers.deployContract("LendingPool",[usdt.target]);

  console.log("Pool Address", pool.target);
  
  // usdt Address 0xBd8156e8D422319A293A24F96eEa8639920629c5
  // Pool Address 0x9C29EDfBD8075688d4d87E16EAdc3b179B951948

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});