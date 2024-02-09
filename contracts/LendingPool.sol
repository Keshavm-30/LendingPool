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
    uint totalLoanIDs;

    struct DepositorDetail{
        uint totalOwed;
        uint timeOfDeposit;
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

    error ZeroAddress();
    error AlreadyWhitelisted();

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

    }




   function calculateInterestDepositor(uint _amount, uint _epocTimeDiff) public view returns(uint){
    return _amount*_epocTimeDiff/31536000*DEPOSITOR_INTEREST_RATE/10000;
   }

    function calculateInterestBorrower(uint _amount, uint _epocTimeDiff) public view returns(uint){
    return _amount*_epocTimeDiff/31536000*BORROWER_INTEREST_RATE/10000;
   }
}