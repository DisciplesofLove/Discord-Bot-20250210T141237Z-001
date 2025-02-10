// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAIDAO.sol";

contract AIDAO is IAIDAO, Ownable {
    ERC20 public joyToken;
    mapping(address => uint256) public stakingBalance;
    uint256 public totalStaked;
    uint256 public constant MIN_STAKE = 100 * 10**18; // 100 tokens minimum stake

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    constructor(address _joyToken) {
        require(_joyToken != address(0), "Invalid token address");
        joyToken = ERC20(_joyToken);
    }

    function stake(uint256 amount) external {
        require(amount >= MIN_STAKE, "Below minimum stake amount");
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakingBalance[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakingBalance[msg.sender] >= amount, "Insufficient stake");
        require(joyToken.transfer(msg.sender, amount), "Transfer failed");
        
        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;
        emit Unstaked(msg.sender, amount);
    }

    function getStakingBalance(address user) external view returns (uint256) {
        return stakingBalance[user];
    }
}