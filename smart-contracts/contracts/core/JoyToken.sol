// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract JoyToken is ERC20, Ownable, Pausable {
    uint256 private constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 2000000000 * 10**18; // 2 billion tokens maximum
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address minter);
    event MinterRemoved(address minter);

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    constructor() ERC20("JoyToken", "JOY") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function mint(address to, uint256 amount) external onlyMinter whenNotPaused {
        require(to != address(0), "Invalid recipient address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed maximum supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}