// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "./interface/Icollateral.sol";
import "./Mock/interface/ImockUSDT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract LendingPool is Ownable{

    ImockUSDT public mockUSDT;
    Icollateral public collateralToken;
    uint public BORROWER_INTEREST_RATE = 1000;
    uint public DEPOSITOR_INTEREST_RATE = 500;
    uint public MIN_LIQUIDITY = 1000;
    uint totalLoanIDs;
    uint totalDepositedAmount;

    struct DepositorDetail{
        uint totalOwed;
        uint lastTimeOfDeposit;
        uint totalDeposit;
    }

    struct BorrowerDetails{
        uint borrowedAmount;
        uint timeOfBorrow;
        address borrower;
        address collateralToken;
    }

    mapping(address => DepositorDetail) public depositor;
    mapping(uint => BorrowerDetails) public loanID;
    mapping(address=> bool) isCollateralWhitelisted;

    event borrowEvent(address borrower, uint loanID, uint amountBorrowed);

    error ZeroAddress();
    error ZeroAmount();
    error AlreadyWhitelisted();
    error  NotWhiteListed();
    error AssetLiquidated();
    error NotAdepositor();
    error ThresholdLiquidity();
    error NotTheCaller();

    constructor(address _mockUSDT) Ownable(msg.sender){
        if(_mockUSDT == address(0)){
           revert ZeroAddress();
        }
       mockUSDT = ImockUSDT(_mockUSDT);
    }


    function withdrawInterest() public {
        DepositorDetail storage _depositordetail = depositor[msg.sender];
        if(_depositordetail.totalOwed==0){
            revert NotAdepositor();
        }
         uint epoctimeDiff = block.timestamp - _depositordetail.lastTimeOfDeposit;
        uint interestAmount = calculateInterestDepositor(_depositordetail.totalOwed,epoctimeDiff);
        _depositordetail.lastTimeOfDeposit = block.timestamp;
        mockUSDT.transfer(msg.sender,interestAmount);
    }


    function whiteListCollateral(address _collateralToken) external onlyOwner{
        if(isCollateralWhitelisted[_collateralToken]){
            revert AlreadyWhitelisted();
        }
        isCollateralWhitelisted[_collateralToken] = true;
    }

    function provideLiquidity(uint _amount) external{
        if(_amount == 0){
            revert ZeroAmount();

        }
        DepositorDetail storage _depositordetail = depositor[msg.sender];
        uint epoctimeDiff = block.timestamp - _depositordetail.lastTimeOfDeposit;
        uint interestAmount = calculateInterestDepositor(_depositordetail.totalOwed,epoctimeDiff);
        mockUSDT.transferFrom(msg.sender,address(this),_amount);
        _depositordetail.totalOwed += _amount+interestAmount;
        _depositordetail.lastTimeOfDeposit= block.timestamp;
        _depositordetail.totalDeposit += _amount;
        totalDepositedAmount += _amount;
    }

    function borrow(uint _amount, address _collateralToken) external{
        if(_amount==0){
            revert ZeroAmount();
        }
        if(!isCollateralWhitelisted[_collateralToken]){
            revert NotWhiteListed();
        }
        BorrowerDetails storage _borrowerDetail = loanID[totalLoanIDs];
        Icollateral(_collateralToken).transferFrom(msg.sender,address(this),_amount);
        mockUSDT.transfer(msg.sender,_amount);
        _borrowerDetail.borrower = msg.sender;
        _borrowerDetail.collateralToken = _collateralToken;
        _borrowerDetail.timeOfBorrow = block.timestamp;
        _borrowerDetail.borrowedAmount = _amount;
        emit borrowEvent(msg.sender,totalLoanIDs,_amount);
        totalLoanIDs++;
    }

    function repay(uint _amount, uint _loanID) external{
      BorrowerDetails storage _borrowerDetail = loanID[_loanID];
      if(_borrowerDetail.borrower!= msg.sender){
          revert NotTheCaller();
      }
        uint epoctimeDiff = block.timestamp - _borrowerDetail.timeOfBorrow;
        uint interestAmount = calculateInterestBorrower(_borrowerDetail.borrowedAmount,epoctimeDiff);
        if(interestAmount>=_borrowerDetail.borrowedAmount){
            revert AssetLiquidated();
        }
      mockUSDT.transferFrom(msg.sender,address(this),_amount+interestAmount);
      Icollateral(_borrowerDetail.collateralToken).transfer(msg.sender,_amount);
      _borrowerDetail.borrowedAmount =0;

    }


    function withdrawLiquidity() external{
     DepositorDetail storage _depositordetail = depositor[msg.sender];
     if(mockUSDT.balanceOf(address(this)) - _depositordetail.totalOwed <= MIN_LIQUIDITY * (10 ** mockUSDT.decimals())){
        revert ThresholdLiquidity();
     }
     withdrawInterest();
     uint owedAmount = _depositordetail.totalOwed;
     _depositordetail.totalOwed = 0;
     _depositordetail.totalDeposit =0;
     mockUSDT.transfer(msg.sender,owedAmount);

    }

   function calculateInterestDepositor(uint _amount, uint _epocTimeDiff) internal view returns(uint){
    return _amount*_epocTimeDiff/31536000*DEPOSITOR_INTEREST_RATE/10000;
   }

    function calculateInterestBorrower(uint _amount, uint _epocTimeDiff) internal view returns(uint){
    return _amount*_epocTimeDiff/31536000*BORROWER_INTEREST_RATE/10000;
   }
}