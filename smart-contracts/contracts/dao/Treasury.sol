// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

contract Treasury is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    GnosisSafe public gnosisSafe;
    IERC20 public joyToken;
    
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
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    struct Transaction {
        string txType;
        uint256 amount;
        address token;
        string description;
        uint256 timestamp;
    }
    
    Transaction[] public recentTransactions;
    uint256 public constant MAX_RECENT_TX = 10;

    event ProposalCreated(uint256 indexed proposalId, string title, address proposer);
    event ProposalExecuted(uint256 indexed proposalId);
    event FundsDeposited(address indexed from, address indexed token, uint256 amount);
    
    constructor(address _gnosisSafe, address _joyToken) {
        require(_gnosisSafe != address(0), "Invalid Gnosis Safe address");
        require(_joyToken != address(0), "Invalid JOY token address");
        
        gnosisSafe = GnosisSafe(_gnosisSafe);
        joyToken = IERC20(_joyToken);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    receive() external payable {
        emit FundsDeposited(msg.sender, address(0), msg.value);
        _addTransaction("DEPOSIT", msg.value, address(0), "ETH Deposit");
    }
    
    function createProposal(
        string memory title,
        string memory description,
        address payable recipient,
        uint256 amount,
        address token
    ) external returns (uint256) {
        require(hasRole(PROPOSER_ROLE, msg.sender), "Must have proposer role");
        
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            title: title,
            description: description,
            recipient: recipient,
            amount: amount,
            token: token,
            executed: false,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + 7 days,
            proposer: msg.sender
        });
        
        emit ProposalCreated(proposalId, title, msg.sender);
        return proposalId;
    }
    
    function executeProposal(uint256 proposalId, bytes memory signatures) external nonReentrant {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Must have executor role");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp <= proposal.deadline, "Proposal expired");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");
        
        proposal.executed = true;
        
        if (proposal.token == address(0)) {
            // ETH transfer
            bytes memory data = "";
            require(
                gnosisSafe.execTransaction(
                    proposal.recipient,
                    proposal.amount,
                    data,
                    0,
                    0,
                    0,
                    0,
                    address(0),
                    payable(0),
                    signatures
                ),
                "Safe execution failed"
            );
        } else {
            // ERC20 transfer
            require(
                IERC20(proposal.token).transfer(proposal.recipient, proposal.amount),
                "Token transfer failed"
            );
        }
        
        _addTransaction(
            "WITHDRAWAL",
            proposal.amount,
            proposal.token,
            string(abi.encodePacked("Proposal: ", proposal.title))
        );
        
        emit ProposalExecuted(proposalId);
    }
    
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function getRecentTransactions() external view returns (Transaction[] memory) {
        return recentTransactions;
    }
    
    function _addTransaction(
        string memory txType,
        uint256 amount,
        address token,
        string memory description
    ) internal {
        if (recentTransactions.length >= MAX_RECENT_TX) {
            // Remove oldest transaction
            for (uint i = 0; i < recentTransactions.length - 1; i++) {
                recentTransactions[i] = recentTransactions[i + 1];
            }
            recentTransactions.pop();
        }
        
        recentTransactions.push(Transaction({
            txType: txType,
            amount: amount,
            token: token,
            description: description,
            timestamp: block.timestamp
        }));
    }
}