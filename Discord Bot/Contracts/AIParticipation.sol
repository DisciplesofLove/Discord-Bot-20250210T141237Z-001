// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IAIParticipation.sol";
import "./JoyToken.sol";

contract AIParticipation is IAIParticipation, AccessControl, ReentrancyGuard {
    bytes32 public constant PARTICIPANT_ROLE = keccak256("PARTICIPANT_ROLE");
    JoyToken public joyToken;
    
    struct Participant {
        uint256 contributionScore;
        uint256 lastParticipationTime;
        bool isActive;
    }
    
    mapping(address => Participant) public participants;
    
    event ParticipantRegistered(address indexed participant);
    event ContributionRecorded(address indexed participant, uint256 score);
    
    constructor(address _joyToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        joyToken = JoyToken(_joyToken);
    }
    
    function registerParticipant() external override {
        require(!participants[msg.sender].isActive, "Already registered");
        
        participants[msg.sender] = Participant({
            contributionScore: 0,
            lastParticipationTime: block.timestamp,
            isActive: true
        });
        
        _setupRole(PARTICIPANT_ROLE, msg.sender);
        emit ParticipantRegistered(msg.sender);
    }
    
    function recordContribution(address participant, uint256 score) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(participants[participant].isActive, "Participant not active");
        
        participants[participant].contributionScore += score;
        participants[participant].lastParticipationTime = block.timestamp;
        
        emit ContributionRecorded(participant, score);
    }
}
