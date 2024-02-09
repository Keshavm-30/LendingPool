// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "./interface/Icollateral.sol";
import "./Mock/interface/ImockUSDT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract LendingPool is Ownable{

    ImockUSDT public mockUSDT;
    Icollateral public collateralToken;
    uint public totalInterestAccumulated;
    uint public BORROWER_INTEREST_RATE = 1000;
    uint public DEPOSITOR_INTEREST_RATE = 500;
    uint public MIN_LIQUIDITY = 1000;
    uint totalLoanIDs;

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

    event borrow(address borrower, uint loanID, uint amountBorrowed);

    error ZeroAddress();
    error ZeroAmount();
    error AlreadyWhitelisted();
    error  NotWhiteListed();
    error AssetLiquidated();
    error NotAdepositor();

    constructor(address _mockUSDT) Ownable(msg.sender){
        if(_mockUSDT == address(0)){
           revert ZeroAddress();
        }
       mockUSDT = ImockUSDT(_mockUSDT);
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
        emit borrow(msg.sender,totalLoanIDs,_amount);
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
      totalInterestAccumulated+ = interestAmount;
    }


    function withdrawInterest() external{
        DepositorDetail storage _depositordetail = depositor[msg.sender];
        if(_depositordetail.totalOwed==0){
            revert NotAdepositor();
        }
         uint epoctimeDiff = block.timestamp - _depositordetail.lastTimeOfDeposit;
        uint interestAmount = calculateInterestDepositor(_depositordetail.totalOwed,epoctimeDiff);
        _depositordetail.lastTimeOfDeposit = block.timestamp;
        totalInterestAccumulated -= interestAmount;
        mockUSDT.transfer(msg.sender,interestAmount);
    }




   function calculateInterestDepositor(uint _amount, uint _epocTimeDiff) public view returns(uint){
    return _amount*_epocTimeDiff/31536000*DEPOSITOR_INTEREST_RATE/10000;
   }

    function calculateInterestBorrower(uint _amount, uint _epocTimeDiff) public view returns(uint){
    return _amount*_epocTimeDiff/31536000*BORROWER_INTEREST_RATE/10000;
   }
}