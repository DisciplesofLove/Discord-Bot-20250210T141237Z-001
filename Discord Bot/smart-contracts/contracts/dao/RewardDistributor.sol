// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IRewardDistributor.sol";

contract RewardDistributor is IRewardDistributor, Ownable {
    IERC20 public joyToken;
    uint256 public totalDistributed;
    mapping(address => uint256) public rewardsClaimed;
    
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _joyToken) {
        require(_joyToken != address(0), "Invalid token address");
        joyToken = IERC20(_joyToken);
    }
    
    function distributeRewards(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            
            require(joyToken.transfer(recipients[i], amounts[i]), "Transfer failed");
            rewardsClaimed[recipients[i]] += amounts[i];
            totalDistributed += amounts[i];
            
            emit RewardsClaimed(recipients[i], amounts[i]);
        }
    }
    
    function getRewardsClaimed(address user) external view returns (uint256) {
        return rewardsClaimed[user];
    }
}