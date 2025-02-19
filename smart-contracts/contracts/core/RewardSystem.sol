// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReputationSystem.sol";

contract RewardSystem is ERC721, ReentrancyGuard, Ownable {
    IERC20 public joyToken;
    ReputationSystem public reputationSystem;
    
    uint256 public constant LOVE_TO_JOY_RATE = 100; // 100 love points = 1 JOY token
    uint256 public constant MIN_LOVE_FOR_NFT = 5000; // Minimum love score for NFT
    uint256 private _tokenIds;
    
    struct RewardTier {
        uint256 minLove;
        uint256 maxVice;
        uint256 joyReward;
        bool nftEligible;
    }
    
    mapping(uint256 => RewardTier) public rewardTiers;
    mapping(address => uint256) public lastRewardTime;
    mapping(uint256 => string) private _tokenURIs;
    
    uint256 public constant REWARD_COOLDOWN = 7 days;
    
    event RewardClaimed(address user, uint256 joyAmount);
    event NFTMinted(address user, uint256 tokenId, string uri);
    event RewardTierUpdated(uint256 tierId, uint256 minLove, uint256 maxVice, uint256 joyReward, bool nftEligible);
    
    constructor(
        address _joyToken,
        address _reputationSystem
    ) ERC721("Reputation Achievement", "REPACH") {
        joyToken = IERC20(_joyToken);
        reputationSystem = ReputationSystem(_reputationSystem);
        
        // Initialize default reward tiers
        rewardTiers[1] = RewardTier(1000, 100, 10 ether, false);
        rewardTiers[2] = RewardTier(5000, 200, 50 ether, true);
        rewardTiers[3] = RewardTier(10000, 300, 100 ether, true);
    }
    
    function claimReward() external nonReentrant {
        require(block.timestamp >= lastRewardTime[msg.sender] + REWARD_COOLDOWN, "Reward cooldown active");
        
        (uint256 loveScore, uint256 viceScore) = reputationSystem.getReputationScores(msg.sender);
        
        // Find eligible tier
        uint256 eligibleTier;
        uint256 joyReward;
        bool canGetNFT;
        
        for (uint256 i = 3; i >= 1; i--) {
            if (loveScore >= rewardTiers[i].minLove && viceScore <= rewardTiers[i].maxVice) {
                eligibleTier = i;
                joyReward = rewardTiers[i].joyReward;
                canGetNFT = rewardTiers[i].nftEligible;
                break;
            }
        }
        
        require(eligibleTier > 0, "No eligible reward tier");
        require(joyToken.balanceOf(address(this)) >= joyReward, "Insufficient reward pool");
        
        // Transfer JOY tokens
        require(joyToken.transfer(msg.sender, joyReward), "Token transfer failed");
        
        // Mint NFT if eligible
        if (canGetNFT && loveScore >= MIN_LOVE_FOR_NFT) {
            _mintAchievementNFT(msg.sender, loveScore);
        }
        
        lastRewardTime[msg.sender] = block.timestamp;
        emit RewardClaimed(msg.sender, joyReward);
    }
    
    function _mintAchievementNFT(address user, uint256 loveScore) internal {
        _tokenIds++;
        _mint(user, _tokenIds);
        
        string memory uri = _generateNFTMetadata(loveScore);
        _tokenURIs[_tokenIds] = uri;
        
        emit NFTMinted(user, _tokenIds, uri);
    }
    
    function _generateNFTMetadata(uint256 loveScore) internal pure returns (string memory) {
        // Generate dynamic NFT metadata based on love score
        // This would be implemented to return IPFS hash of metadata
        return "";
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    function updateRewardTier(
        uint256 tierId,
        uint256 minLove,
        uint256 maxVice,
        uint256 joyReward,
        bool nftEligible
    ) external onlyOwner {
        require(tierId > 0 && tierId <= 3, "Invalid tier ID");
        rewardTiers[tierId] = RewardTier(minLove, maxVice, joyReward, nftEligible);
        emit RewardTierUpdated(tierId, minLove, maxVice, joyReward, nftEligible);
    }
    
    function withdrawExcessTokens(uint256 amount) external onlyOwner {
        require(joyToken.transfer(owner(), amount), "Transfer failed");
    }
}