// const {ethers} = require('hardhat');
const hre = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main(){

  const usdt = await hre.ethers.deployContract("mockUSDT");
  console.log("usdt Address",usdt.target);

  const pool = await hre.ethers.deployContract("LendingPool",[usdt.target]);

  console.log("Pool Address", pool.target);
  
  
  // usdt Address 0x5A9FCf47e9b318335DDA66781bdBCD6cA856141F
  // Pool Address 0xf1774626fFcB715A32Aed660147Cbb94Fc4A0D9d

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});