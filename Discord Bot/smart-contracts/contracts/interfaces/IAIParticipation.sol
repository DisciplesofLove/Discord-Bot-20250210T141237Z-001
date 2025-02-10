// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAIParticipation {
    function recordParticipation(address participant, uint256 points) external;
    function getParticipationPoints(address participant) external view returns (uint256);
    function distributeRewards(address participant, uint256 amount) external;
    
    event ParticipationRecorded(address participant, uint256 points);
    event RewardDistributed(address participant, uint256 amount);
}