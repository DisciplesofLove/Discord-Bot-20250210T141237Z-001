// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../dao/AIDAO.sol";
import "./VotingStrategy.sol";

contract StakedVoting is VotingStrategy {
    AIDAO public dao;
    
    constructor(address _dao) {
        require(_dao != address(0), "Invalid DAO address");
        dao = AIDAO(_dao);
    }
    
    function _vote(address voter, uint256 proposalId, uint256 amount) internal override {
        uint256 stakedAmount = dao.getStakingBalance(voter);
        require(stakedAmount > 0, "Must have staked tokens to vote");
        
        uint256 voteWeight = amount * stakedAmount;
        votes[proposalId][voter] = voteWeight;
        totalVotesForProposal[proposalId] += voteWeight;
    }
}