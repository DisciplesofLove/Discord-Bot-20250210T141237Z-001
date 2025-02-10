// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./VotingStrategy.sol";

contract QuadraticVoting is VotingStrategy {
    using Math for uint256;

    function _vote(address voter, uint256 proposalId, uint256 amount) internal override {
        uint256 voteWeight = Math.sqrt(amount);
        votes[proposalId][voter] = voteWeight;
        totalVotesForProposal[proposalId] += voteWeight;
    }
}