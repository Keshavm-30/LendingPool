// const {ethers} = require('hardhat');
const hre = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main(){

  const usdt = await hre.ethers.deployContract("mockUSDT");
  console.log("usdt Address",usdt.target);

  const pool = await hre.ethers.deployContract("LendingPool",[usdt.target]);

  console.log("Pool Address", pool.target);
  // usdt Address 0xD22B7EB8986AA8B0416A576DFA06299BBCf5b13b
  // Pool Address 0xCf05E53272DE464cde5cA35D8D67E84975e840f9

  //npx hardhat verify --network sepolia --contract contracts/Mock/mockUSDT.sol:mockUSDT 0xD22B7EB8986AA8B0416A576DFA06299BBCf5b13b
  
  //npx hardhat verify --network sepolia 0xCf05E53272DE464cde5cA35D8D67E84975e840f9 0xD22B7EB8986AA8B0416A576DFA06299BBCf5b13b

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});