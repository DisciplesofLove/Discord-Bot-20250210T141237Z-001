// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DatasetGovernance {
    struct Proposal {
        string dataset;
        string description;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
    }
    
    Proposal[] public proposals;
    uint256 public constant MINIMUM_VOTES = 2;

    event ProposalCreated(uint256 proposalId, string dataset, string description);
    event Voted(uint256 proposalId, address voter, bool support);
    event ProposalExecuted(uint256 proposalId);

    function proposeChange(string memory dataset, string memory description) public returns (uint256) {
        uint256 proposalId = proposals.length;
        Proposal storage newProposal = proposals.push();
        newProposal.dataset = dataset;
        newProposal.description = description;
        newProposal.executed = false;
        newProposal.votesFor = 0;
        newProposal.votesAgainst = 0;

        emit ProposalCreated(proposalId, dataset, description);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) public {
        require(proposalId < proposals.length, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");

        if (support) {
            proposal.votesFor += 1;
        } else {
            proposal.votesAgainst += 1;
        }
        proposal.hasVoted[msg.sender] = true;

        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) public {
        require(proposalId < proposals.length, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor >= MINIMUM_VOTES, "Insufficient votes");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) public view returns (
        string memory dataset,
        string memory description,
        bool executed,
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        require(proposalId < proposals.length, "Invalid proposal ID");
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.dataset,
            proposal.description,
            proposal.executed,
            proposal.votesFor,
            proposal.votesAgainst
        );
    }

    function hasVoted(uint256 proposalId, address voter) public view returns (bool) {
        require(proposalId < proposals.length, "Invalid proposal ID");
        return proposals[proposalId].hasVoted[voter];
    }
}