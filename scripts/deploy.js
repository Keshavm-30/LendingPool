// const {ethers} = require('hardhat');
const hre = require("hardhat");
// const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main(){

  // const usdtFactory = await ethers.getContractFactory("mockUSDT");
  // const usdt = await usdtFactory.deploy();
  // const usdt = await hre.ethers.deployContract("mockUSDT");
  // // await time.increase(3);

  // console.log("usdt Address",usdt.target);

  const pool = await hre.ethers.deployContract("LendingPool",["0xbcc2DA91DDC85cAd5704Ed8E6A7A6ADc9d9b617a"]);

  console.log("Pool Address", pool.target);
  
  // usdt Address 0xbcc2DA91DDC85cAd5704Ed8E6A7A6ADc9d9b617a
  // Pool Address 0xFBe4Dd94Ee15b6A182b69742c804FED4e62fc52d


}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});