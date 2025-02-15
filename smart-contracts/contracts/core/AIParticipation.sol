// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IAIParticipation.sol";

contract AIParticipation is IAIParticipation, Ownable, ReentrancyGuard {
    IERC20 public joyToken;
    mapping(address => uint256) public participationPoints;
    mapping(address => uint256) public lastParticipationTime;
    uint256 public constant COOLDOWN_PERIOD = 1 days;
    uint256 public constant MAX_POINTS_PER_PARTICIPATION = 1000;
    
    event ParticipationRecorded(address participant, uint256 points);
    event RewardDistributed(address participant, uint256 amount);

    constructor(address _joyToken) {
        require(_joyToken != address(0), "Invalid token address");
        joyToken = IERC20(_joyToken);
    }

    function recordParticipation(address participant, uint256 points) external onlyOwner {
        require(participant != address(0), "Invalid participant address");
        require(points > 0 && points <= MAX_POINTS_PER_PARTICIPATION, "Invalid points amount");
        require(
            block.timestamp >= lastParticipationTime[participant] + COOLDOWN_PERIOD,
            "Cooldown period not elapsed"
        );
        
        participationPoints[participant] += points;
        lastParticipationTime[participant] = block.timestamp;
        
        emit ParticipationRecorded(participant, points);
    }

    function getParticipationPoints(address participant) external view returns (uint256) {
        return participationPoints[participant];
    }

    function distributeRewards(address participant, uint256 amount) external onlyOwner nonReentrant {
        require(participant != address(0), "Invalid participant address");
        require(amount > 0, "Invalid reward amount");
        require(joyToken.balanceOf(address(this)) >= amount, "Insufficient token balance");
        
        participationPoints[participant] = 0; // Reset points after distribution
        require(joyToken.transfer(participant, amount), "Transfer failed");
        
        emit RewardDistributed(participant, amount);
    }

    function updateJoyToken(address newTokenAddress) external onlyOwner {
        require(newTokenAddress != address(0), "Invalid token address");
        joyToken = IERC20(newTokenAddress);
    }
}