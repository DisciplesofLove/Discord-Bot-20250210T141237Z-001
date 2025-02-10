// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVotingStrategy.sol";

abstract contract VotingStrategy is IVotingStrategy, Ownable {
    mapping(uint256 => mapping(address => uint256)) public votes;
    mapping(uint256 => uint256) public totalVotesForProposal;

    function vote(uint256 proposalId, uint256 amount) external virtual {
        _vote(msg.sender, proposalId, amount);
    }

    function getVoteWeight(address voter, uint256 proposalId) external view virtual returns (uint256) {
        return votes[proposalId][voter];
    }

    function getTotalVotes(uint256 proposalId) external view returns (uint256) {
        return totalVotesForProposal[proposalId];
    }

    function _vote(address voter, uint256 proposalId, uint256 amount) internal virtual;
}