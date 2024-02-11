const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LendingPool", function () {
  let owner,user1,user2,user3,user4,user5,user6,user7;
  let collateralToken,collateralTokenFactory, usdtFactory, usdt, pool, poolFactory
  let collateralToken2,collateralToken2Factory, collateralToken3, collateralToken3Factory

    beforeEach(async function () {
      [owner,user1,user2,user3,user4,user5,user6,user7] = await ethers.getSigners();

      collateralTokenFactory = await ethers.getContractFactory("collateralToken");
      collateralToken = await collateralTokenFactory.deploy();

      usdtFactory = await ethers.getContractFactory("mockUSDT");
      usdt = await usdtFactory.deploy();
  
      poolFactory = await ethers.getContractFactory("LendingPool");
    pool = await poolFactory.deploy(usdt.target);

    await pool.connect(owner).whiteListCollateral(collateralToken.target);

    });

     
    it("Provide Liquidity Different Scenerios", async function () {
       await usdt.mint(user1.address,ethers.parseEther("500"));
       await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

       try {
        await pool.connect(user1).provideLiquidity(ethers.parseEther("0"));
        expect.fail("Transaction should have reverted");
    } catch (error) {
        expect(error.message).to.contain("ZeroAmount");
    }


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

    it("Borrow", async function () {

      try {
        await pool.connect(user5).borrow(ethers.parseEther("0"),collateralToken.target)
        expect.fail("Transaction should have reverted");
    } catch (error) {
        expect(error.message).to.contain("ZeroAmount");
    }
     
      
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

    it("Repay", async function () {
     
      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));    


      await collateralToken.mint(user5.address,ethers.parseEther("100"))
      await collateralToken.connect(user5).approve(pool.target,ethers.parseEther("100"))
      await pool.connect(user5).borrow(ethers.parseEther("100"),collateralToken.target)

      await time.increase(31536000);

      await usdt.mint(user5.address,ethers.parseEther("12000"));
      await usdt.connect(user5).approve(pool.target,ethers.parseEther("1200"));

      await pool.connect(user5).repay(ethers.parseEther("100"),0);


      const usdtBalanceOfPool  = await usdt.balanceOf(pool.target);
      expect(usdtBalanceOfPool).to.be.greaterThan(ethers.parseEther("510"));
      await pool.connect(user1).withdrawInterest();

      const user1BalanceUsdt = await usdt.balanceOf(user1.address);
      expect(user1BalanceUsdt).to.be.greaterThan(ethers.parseEther("25"));
      expect(user1BalanceUsdt).to.be.lessThan(ethers.parseEther("25.1"));


      const usdtBalanceOfPoolAfter  = await usdt.balanceOf(pool.target);
      expect(usdtBalanceOfPoolAfter).to.be.greaterThan(ethers.parseEther("484"));
      expect(usdtBalanceOfPoolAfter).to.be.lessThan(ethers.parseEther("485"));



      const collateralTokenBalanceOfPool = await collateralToken.balanceOf(pool.target);
      expect(collateralTokenBalanceOfPool).to.be.eq(ethers.parseEther("0"));

      const collateralTokenBalanceOfUser5 = await  collateralToken.balanceOf(user5.address);
      expect(collateralTokenBalanceOfUser5).to.be.eq(ethers.parseEther("100"));
     

    });
    it("WhiteListing", async function(){
      collateralToken2Factory = await ethers.getContractFactory("collateralToken");
      collateralToken2 = await collateralToken2Factory.deploy();


      collateralToken3Factory = await ethers.getContractFactory("collateralToken");
      collateralToken3 = await collateralToken3Factory.deploy();

      try {
        await pool.connect(owner).whiteListCollateral("0x0000000000000000000000000000000000000000");
        expect.fail("Transaction should have reverted");
    } catch (error) {
        expect(error.message).to.contain("ZeroAddress");
    }

      try {
        await pool.connect(owner).whiteListCollateral(collateralToken.target);
        expect.fail("Transaction should have reverted");
    } catch (error) {
        expect(error.message).to.contain("AlreadyWhitelisted");
    }

      await pool.connect(owner).whiteListCollateral(collateralToken2.target);

      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));   

      

      await collateralToken2.mint(user5.address,ethers.parseEther("100"))
      await collateralToken2.connect(user5).approve(pool.target,ethers.parseEther("100"))
      await pool.connect(user5).borrow(ethers.parseEther("100"),collateralToken2.target)


      await collateralToken3.mint(user5.address,ethers.parseEther("100"))
      await collateralToken3.connect(user5).approve(pool.target,ethers.parseEther("100"))


      try {
      await pool.connect(user5).borrow(ethers.parseEther("100"),collateralToken3.target)
        expect.fail("Transaction should have reverted");
    } catch (error) {
        expect(error.message).to.contain("NotWhiteListed");
    }  
    })

    it("WhithDrawInterest", async function(){

      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));  

      await time.increase(31536000);
      
      await pool.connect(user1).withdrawInterest();

      const balanceAfterInterest = await usdt.balanceOf(user1.address);
      expect(balanceAfterInterest).to.be.greaterThan(ethers.parseEther("25"));
      expect(balanceAfterInterest).to.be.lessThan(ethers.parseEther("25.1"));

    })

    it ("Repay : Revert Checks", async function () {
     
      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));    


      await collateralToken.mint(user5.address,ethers.parseEther("100"))
      await collateralToken.connect(user5).approve(pool.target,ethers.parseEther("100"))
      await pool.connect(user5).borrow(ethers.parseEther("1"),collateralToken.target)

      await time.increase(315360000);
      try {
        await pool.connect(user1).repay(ethers.parseEther("100"),0);
          expect.fail("Transaction should have reverted");
      } catch (error) {
          expect(error.message).to.contain("NotTheCaller");
      } 

      try {
      await pool.connect(user5).repay(ethers.parseEther("1"),0);
        
          expect.fail("Transaction should have reverted");
      } catch (error) {
          expect(error.message).to.contain("AssetLiquidated");
      } 
    });

    it ("WithDrawLiquidity: Revert Checks", async function () {
     
      await usdt.mint(user1.address,ethers.parseEther("500"));
      await usdt.connect(user1).approve(pool.target,ethers.parseEther("500"));

      await pool.connect(user1).provideLiquidity(ethers.parseEther("500"));    

      await time.increase(315360000);
      try {
      await pool.connect(user1).withdrawLiquidity();
          expect.fail("Transaction should have reverted");
      } catch (error) {
          expect(error.message).to.contain("ThresholdLiquidity");
      } 


      try {
      await pool.connect(user2).withdrawInterest();
            expect.fail("Transaction should have reverted");
        } catch (error) {
            expect(error.message).to.contain("NotAdepositor");
        } 
    });

  });