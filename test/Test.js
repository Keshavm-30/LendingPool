const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LendingPool", function () {
  let owner,user1,user2,user3,user4,user5,user6,user7;
  let collateralToken,collateralTokenFactory, usdtFactory, usdt, pool, poolFactory

    beforeEach(async function () {
      [owner,user1,user2,user3,user4,user5,user6,user7] = await ethers.getSigners();

      collateralTokenFactory = await ethers.getContractFactory("collateralToken");
      collateralToken = await collateralTokenFactory.deploy();

      usdtFactory = await ethers.getContractFactory("mockUSDT");
      usdt = await usdtFactory.deploy();
  
      poolFactory = await ethers.getContractFactory("LendingPool");
    pool = await poolFactory.deploy(usdt.target);

    await pool.connect(owner).whiteListCollateral(collateralToken.target);

    // const latestTimestampeaFTER = await time.latest();
    // console.log("lATESTTIMESTAMP AFTER", latestTimestampeaFTER);

    });

     
    it("Provide Liquidity Different Scenerios", async function () {
       await usdt.mint(user1.address,ethers.parseEther("500"));
       await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

       await usdt.mint(user2.address,ethers.parseEther("370"));
       await usdt.connect(user2).approve(pool.target,ethers.parseEther("370"));

       await usdt.mint(user3.address,ethers.parseEther("280"));
       await usdt.connect(user3).approve(pool.target,ethers.parseEther("280"));

       await usdt.mint(user4.address,ethers.parseEther("900"));
       await usdt.connect(user4).approve(pool.target,ethers.parseEther("900"));


       await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));
       await pool.connect(user2).provideLiquidity(ethers.parseEther("370"));
       await pool.connect(user3).provideLiquidity(ethers.parseEther("280"));
       await pool.connect(user4).provideLiquidity(ethers.parseEther("900"));

       await usdt.mint(user4.address,ethers.parseEther("50"));
       await usdt.connect(user4).approve(pool.target,ethers.parseEther("50"));

       await time.increase(3600);
       await pool.connect(user4).provideLiquidity(ethers.parseEther("50"));

       const user1detail = await pool.depositor(user1.address);
       expect(user1detail.totalOwed).to.be.eq(user1detail.totalDeposit).to.be.eq(ethers.parseEther("500"));

       const user2detail = await pool.depositor(user2.address);
       expect(user2detail.totalOwed).to.be.eq(user2detail.totalDeposit).to.be.eq(ethers.parseEther("370"));

       const user3detail = await pool.depositor(user3.address);
       expect(user3detail.totalOwed).to.be.eq(user3detail.totalDeposit).to.be.eq(ethers.parseEther("280"));

       const user4detail = await pool.depositor(user4.address);
       expect(user4detail.totalOwed).to.be.greaterThan(user4detail.totalDeposit)
       
       const balanceAfter4deposits = await usdt.balanceOf(pool.target);
       expect(balanceAfter4deposits).to.be.eq(ethers.parseEther("2100"));


    });

    it("WithDrawLiquidity", async function () {

      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await usdt.mint(user2.address,ethers.parseEther("370"));
      await usdt.connect(user2).approve(pool.target,ethers.parseEther("370"));

      await usdt.mint(user3.address,ethers.parseEther("280"));
      await usdt.connect(user3).approve(pool.target,ethers.parseEther("280"));

      await usdt.mint(user4.address,ethers.parseEther("900"));
      await usdt.connect(user4).approve(pool.target,ethers.parseEther("900"));


      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));
      await pool.connect(user2).provideLiquidity(ethers.parseEther("370"));
      await pool.connect(user3).provideLiquidity(ethers.parseEther("280"));
      await pool.connect(user4).provideLiquidity(ethers.parseEther("900"));

      await usdt.mint(user4.address,ethers.parseEther("50"));
      await usdt.connect(user4).approve(pool.target,ethers.parseEther("50"));

      await time.increase(3600);
      await pool.connect(user4).provideLiquidity(ethers.parseEther("50"));
      

      await pool.connect(user4).withdrawLiquidity();

      const balanceAfter4deposits = await usdt.balanceOf(pool.target);
      expect(balanceAfter4deposits).to.be.lessThan(ethers.parseEther("1150"));

    });

    it.only("Borrow", async function () {
     
      
      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await usdt.mint(user2.address,ethers.parseEther("370"));
      await usdt.connect(user2).approve(pool.target,ethers.parseEther("370"));

      await usdt.mint(user3.address,ethers.parseEther("280"));
      await usdt.connect(user3).approve(pool.target,ethers.parseEther("280"));

      await usdt.mint(user4.address,ethers.parseEther("900"));
      await usdt.connect(user4).approve(pool.target,ethers.parseEther("900"));


      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));
      await pool.connect(user2).provideLiquidity(ethers.parseEther("370"));
      await pool.connect(user3).provideLiquidity(ethers.parseEther("280"));
      await pool.connect(user4).provideLiquidity(ethers.parseEther("900"));

      await usdt.mint(user4.address,ethers.parseEther("50"));
      await usdt.connect(user4).approve(pool.target,ethers.parseEther("50"));

      await time.increase(3600);
      await pool.connect(user4).provideLiquidity(ethers.parseEther("50"));


      await collateralToken.mint(user5.address,ethers.parseEther("100"))
      await collateralToken.connect(user5).approve(pool.target,ethers.parseEther("100"))
      await pool.connect(user5).borrow(ethers.parseEther("100"),collateralToken.target)

      const usdtBalanceOfPool  = await usdt.balanceOf(pool.target);
      expect(usdtBalanceOfPool).to.be.eq(ethers.parseEther("2000"));

      const collateralTokenBalanceOfPool = await collateralToken.balanceOf(pool.target);
      expect(collateralTokenBalanceOfPool).to.be.eq(ethers.parseEther("100"));


    });

    it("Checking the popMax", async function () {
     


    });

  });