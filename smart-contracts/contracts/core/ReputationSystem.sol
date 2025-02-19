// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IAIParticipation.sol";

contract ReputationSystem is Ownable, ReentrancyGuard {
    struct UserReputation {
        uint256 loveScore;
        uint256 viceScore;
        uint256 lastUpdateTime;
        mapping(bytes32 => bool) actionRecords;
    }

    mapping(address => UserReputation) public userReputations;
    IAIParticipation public participationContract;
    
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    uint256 public constant MAX_LOVE_POINTS = 1000;
    uint256 public constant MAX_VICE_POINTS = 1000;
    
    event LoveScoreUpdated(address user, uint256 points, string action);
    event ViceScoreUpdated(address user, uint256 points, string action);
    event ReputationReset(address user);
    
    constructor(address _participationContract) {
        participationContract = IAIParticipation(_participationContract);
    }
    
    function awardLovePoints(address user, uint256 points, string memory action) external onlyOwner {
        require(points > 0 && points <= MAX_LOVE_POINTS, "Invalid points");
        require(user != address(0), "Invalid address");
        
        bytes32 actionHash = keccak256(abi.encodePacked(user, action, block.timestamp));
        require(!userReputations[user].actionRecords[actionHash], "Action already recorded");
        
        UserReputation storage reputation = userReputations[user];
        require(block.timestamp >= reputation.lastUpdateTime + COOLDOWN_PERIOD, "Cooldown period");
        
        reputation.loveScore += points;
        reputation.lastUpdateTime = block.timestamp;
        reputation.actionRecords[actionHash] = true;
        
        // Sync with participation contract
        participationContract.recordParticipation(user, points);
        
        emit LoveScoreUpdated(user, points, action);
    }
    
    function assignVicePoints(address user, uint256 points, string memory action) external onlyOwner {
        require(points > 0 && points <= MAX_VICE_POINTS, "Invalid points");
        require(user != address(0), "Invalid address");
        
        bytes32 actionHash = keccak256(abi.encodePacked(user, action, block.timestamp));
        require(!userReputations[user].actionRecords[actionHash], "Action already recorded");
        
        UserReputation storage reputation = userReputations[user];
        reputation.viceScore += points;
        reputation.actionRecords[actionHash] = true;
        
        emit ViceScoreUpdated(user, points, action);
    }
    
    function getReputationScores(address user) external view returns (uint256 love, uint256 vice) {
        UserReputation storage reputation = userReputations[user];
        return (reputation.loveScore, reputation.viceScore);
    }
    
    function resetReputation(address user) external onlyOwner {
        UserReputation storage reputation = userReputations[user];
        reputation.loveScore = 0;
        reputation.viceScore = 0;
        reputation.lastUpdateTime = block.timestamp;
        
        emit ReputationReset(user);
    }
    
    function updateParticipationContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid address");
        participationContract = IAIParticipation(newContract);
    }
}