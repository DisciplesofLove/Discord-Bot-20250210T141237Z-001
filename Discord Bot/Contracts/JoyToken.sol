// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title JoyToken
 * @dev Governance token for the AI DAO ecosystem
 */
contract JoyToken is ERC20, ERC20Votes, Ownable, Pausable, ReentrancyGuard {
    // Events
    event RewardsDistributed(address indexed recipient, uint256 amount);
    event StakeDeposited(address indexed user, uint256 amount);
    event StakeWithdrawn(address indexed user, uint256 amount);

    // Staking related variables
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    
    uint256 public constant MINIMUM_STAKE_AMOUNT = 100 * 10**18; // 100 tokens
    uint256 public constant STAKING_PERIOD = 7 days;
    uint256 public constant EARLY_UNSTAKE_PENALTY = 10; // 10%

    constructor() 
        ERC20("Joy Token", "JOY") 
        ERC20Permit("Joy Token") // Enable gasless approvals
    {
        _mint(msg.sender, 100000000 * 10**decimals()); // Initial supply: 100 million
    }

    /**
     * @dev Stake tokens for governance participation
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MINIMUM_STAKE_AMOUNT, "Below minimum stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;

        emit StakeDeposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw staked tokens
     * @param amount Amount of tokens to withdraw
     */
    function unstake(uint256 amount) external nonReentrant {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");

        uint256 penalty = 0;
        if (block.timestamp < stakingTimestamp[msg.sender] + STAKING_PERIOD) {
            penalty = (amount * EARLY_UNSTAKE_PENALTY) / 100;
        }

        uint256 withdrawAmount = amount - penalty;
        stakedBalance[msg.sender] -= amount;

        if (penalty > 0) {
            // Burned penalties contribute to token deflation
            _burn(address(this), penalty);
        }

        _transfer(address(this), msg.sender, withdrawAmount);
        emit StakeWithdrawn(msg.sender, withdrawAmount);
    }

    /**
     * @dev Distribute rewards to contributors
     * @param recipients Array of reward recipients
     * @param amounts Array of reward amounts
     */
    function distributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _mint(recipients[i], amounts[i]);
            emit RewardsDistributed(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Returns the voting power of an account
     * @param account The address to check
     * @return The number of votes the account has
     */
    function getVotes(address account) public view override returns (uint256) {
        return stakedBalance[account];
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Required overrides
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
