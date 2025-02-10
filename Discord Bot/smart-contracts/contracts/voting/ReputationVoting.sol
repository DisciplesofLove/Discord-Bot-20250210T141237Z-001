// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingStrategy.sol";

contract ReputationVoting is VotingStrategy {
    mapping(address => uint256) public reputation;
    
    function updateReputation(address user, uint256 newReputation) external onlyOwner {
        reputation[user] = newReputation;
    }
    
    function _vote(address voter, uint256 proposalId, uint256 amount) internal override {
        uint256 voteWeight = amount * reputation[voter];
        votes[proposalId][voter] = voteWeight;
        totalVotesForProposal[proposalId] += voteWeight;
    }
}