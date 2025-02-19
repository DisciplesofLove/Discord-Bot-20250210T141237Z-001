// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITreasury {
    struct Proposal {
        string title;
        string description;
        address payable recipient;
        uint256 amount;
        address token;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        address proposer;
    }
    
    struct Transaction {
        string txType;
        uint256 amount;
        address token;
        string description;
        uint256 timestamp;
    }
    
    event ProposalCreated(uint256 indexed proposalId, string title, address proposer);
    event ProposalExecuted(uint256 indexed proposalId);
    event FundsDeposited(address indexed from, address indexed token, uint256 amount);
    
    function createProposal(
        string memory title,
        string memory description,
        address payable recipient,
        uint256 amount,
        address token
    ) external returns (uint256);
    
    function executeProposal(uint256 proposalId) external;
    function getEthBalance() external view returns (uint256);
    function getTokenBalance(address token) external view returns (uint256);
    function getRecentTransactions() external view returns (Transaction[] memory);
}