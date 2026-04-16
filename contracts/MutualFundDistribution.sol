// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MutualFundDistribution is Ownable, ReentrancyGuard {
    IERC20 public fundToken;
    uint256 public distributionInterval;
    uint256 public lastDistributionTime;
    
    mapping(address => uint256) public shares;
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public pendingRewards;
    
    address[] private customerList;
    mapping(address => bool) private isCustomer;
    
    uint256 public totalShares;
    
    event Distribution(uint256 amount, uint256 timestamp);
    event SharePurchase(address indexed customer, uint256 amount);
    event Claimed(address indexed customer, uint256 amount);
    event RewardsCalculated(address indexed customer, uint256 amount);
    
    constructor(address _fundToken, uint256 _distributionInterval) Ownable(msg.sender) {
        require(_fundToken != address(0), "Invalid token address");
        fundToken = IERC20(_fundToken);
        distributionInterval = _distributionInterval;
        lastDistributionTime = block.timestamp;
    }
    
    function purchaseShares(uint256 _amount) public nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            fundToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        
        if (!isCustomer[msg.sender]) {
            customerList.push(msg.sender);
            isCustomer[msg.sender] = true;
            lastClaimTime[msg.sender] = block.timestamp;
        }
        
        shares[msg.sender] += _amount;
        totalShares += _amount;
        
        emit SharePurchase(msg.sender, _amount);
    }
    
    function distributeFunds(uint256 amount) public onlyOwner nonReentrant {
        require(
            block.timestamp >= lastDistributionTime + distributionInterval,
            "Distribution interval not reached"
        );
        require(totalShares > 0, "No shares held");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 contractBalance = fundToken.balanceOf(address(this));
        uint256 availableForDistribution = contractBalance - totalShares;
        require(amount <= availableForDistribution, "Insufficient funds");
        
        for (uint256 i = 0; i < customerList.length; i++) {
            address customer = customerList[i];
            if (shares[customer] > 0) {
                uint256 reward = (amount * shares[customer]) / totalShares;
                pendingRewards[customer] += reward;
                emit RewardsCalculated(customer, reward);
            }
        }
        
        lastDistributionTime = block.timestamp;
        emit Distribution(amount, block.timestamp);
    }
    
    function claimRewards() public nonReentrant {
        require(pendingRewards[msg.sender] > 0, "No rewards to claim");
        
        uint256 amount = pendingRewards[msg.sender];
        pendingRewards[msg.sender] = 0;
        lastClaimTime[msg.sender] = block.timestamp;
        
        require(
            fundToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );
        
        emit Claimed(msg.sender, amount);
    }
    
    function getCustomerInfo(address customer) public view returns (
        uint256 shareholding,
        uint256 pending,
        uint256 lastClaim
    ) {
        return (
            shares[customer],
            pendingRewards[customer],
            lastClaimTime[customer]
        );
    }
    
    function getContractStats() public view returns (
        uint256 totalSharesHeld,
        uint256 contractBalance,
        uint256 availableForDistribution,
        uint256 nextDistributionTime,
        uint256 customerCount
    ) {
        uint256 balance = fundToken.balanceOf(address(this));
        return (
            totalShares,
            balance,
            balance - totalShares,
            lastDistributionTime + distributionInterval,
            customerList.length
        );
    }
    
    function getCustomers() public view returns (address[] memory) {
        return customerList;
    }
    
    function setDistributionInterval(uint256 _interval) public onlyOwner {
        distributionInterval = _interval;
    }
    
    function setFundToken(address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        fundToken = IERC20(_tokenAddress);
    }
}