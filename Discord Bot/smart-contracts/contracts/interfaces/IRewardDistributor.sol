// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRewardDistributor {
    function distributeRewards(address[] calldata recipients, uint256[] calldata amounts) external;
    function getRewardsClaimed(address user) external view returns (uint256);
    
    event RewardsClaimed(address indexed user, uint256 amount);
}