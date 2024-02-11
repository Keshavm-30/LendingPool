# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npm i
npx hardhat compile
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat coverage 
npx hardhat run --network sepolia scripts/deploy.js
npx hardhat verify --network sepolia --contract contracts/Mock/mockUSDT.sol:mockUSDT <deployed-mockUSDT Address>
npx hardhat verify --network sepolia <deployed-pool Address> <deployed-mockUSDT Address>
