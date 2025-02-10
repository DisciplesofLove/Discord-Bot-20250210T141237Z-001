// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAIDAO {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function getStakingBalance(address user) external view returns (uint256);
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
}