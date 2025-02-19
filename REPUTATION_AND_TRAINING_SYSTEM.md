# Reputation and AI Training System Documentation

## 1. Reputation System Overview

The system implements a dual-score reputation mechanism using Love and Vice points, managed through smart contracts and integrated across multiple platforms.

### Score Types
- **Love Score**: Positive reputation points earned through constructive actions
- **Vice Score**: Negative reputation points accumulated through detrimental actions
- Both scores are capped at 1000 points

### Key Features
- Cool-down period between rewards (1 hour)
- Action tracking to prevent duplicate rewards
- Integration with participation tracking
- Multi-platform support (Discord, Telegram, Slack)

## 2. Reward System

### Reward Tiers
1. **Basic Tier**
   - Minimum Love: 1000
   - Maximum Vice: 100
   - Reward: 10 JOY tokens
   - NFT Eligibility: No

2. **Intermediate Tier**
   - Minimum Love: 5000
   - Maximum Vice: 200
   - Reward: 50 JOY tokens
   - NFT Eligibility: Yes

3. **Advanced Tier**
   - Minimum Love: 10000
   - Maximum Vice: 300
   - Reward: 100 JOY tokens
   - NFT Eligibility: Yes

### NFT Rewards
- Minimum love score requirement: 5000
- Unique achievement NFTs with dynamic metadata
- ERC721 standard implementation

## 3. AI Training Integration

### Training Rewards
- Time-based reward calculation
- Configurable reward rates
- Training session tracking per user
- Integration with reputation system

### Multi-Platform Bot Integration

The system supports multiple messaging platforms for AI training and interaction:

#### Supported Platforms
- Discord
- Telegram
- Slack

#### Integration Features
- Unified command interface across platforms
- Platform-specific message handling
- Common training commands:
  - `/train` - Start a training session
  - `/list` - View available models
  - `/vote` - Participate in model governance

### Platform Integration Methods
1. **Discord**: Primary integration through Discord.js
2. **Telegram**: Integration via Telegram Bot API
3. **Slack**: Slack Bot integration

### Command Structure
All platforms support a unified command structure for:
- Model training
- Reputation checking
- Reward claiming
- Proposal voting

## 4. Usage Guidelines

### Earning Reputation
1. Participate in AI training sessions
2. Contribute to model improvements
3. Engage in community governance
4. Help other community members

### Claiming Rewards
- Rewards can be claimed every 7 days
- Higher reputation tiers unlock better rewards
- NFT rewards for high-performing members
- JOY tokens distributed based on tier

### Best Practices
1. Maintain consistent participation
2. Keep vice score low
3. Engage across multiple platforms
4. Document training contributions

## 5. Technical Integration

### Smart Contracts
- ReputationSystem.sol: Manages reputation scores
- RewardSystem.sol: Handles reward distribution
- AITrainingRewards.sol: Tracks training participation

### Service Integration
- Platform-agnostic message handling
- Unified command processing
- Cross-platform user identification
- Automated reward distribution

### Security Features
- Reentrancy protection
- Cooldown periods
- Action verification
- Owner-only administrative functions

For technical integration details, refer to the source code and API documentation.