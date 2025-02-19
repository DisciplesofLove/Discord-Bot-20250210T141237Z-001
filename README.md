# AI-Powered Decentralized Discord Bot with DAO Governance

This project implements an advanced Discord bot leveraging AI, blockchain, and decentralized technologies to provide a robust platform for community engagement, governance, and AI model marketplace with a focus on decentralized deployment and operation.

## Project Description

This Discord bot is a cutting-edge application that combines artificial intelligence, blockchain technology, and decentralized infrastructure to create a powerful platform for Discord communities. The bot offers a wide range of features, including AI model training and marketplace integration, decentralized autonomous organization (DAO) governance, and robust peer-to-peer (P2P) data management.

Key features include:
- AI model training and fine-tuning using decentralized compute resources (Akash Network)
- Marketplace for buying, selling, and leasing AI models
- DAO governance system for community decision-making
- Decentralized data storage and retrieval using IPFS and OrbitDB
- Integration with multiple blockchain networks (Ethereum, IOTA)
- Advanced error handling and monitoring
- Fully decentralized deployment and operation

The bot is designed to be highly scalable, secure, and resilient, leveraging decentralized technologies to ensure high availability and data integrity. It provides a comprehensive suite of commands for users to interact with various aspects of the system, from AI model management to participation in DAO governance, all while maintaining a decentralized architecture.

## Repository Structure

The repository is organized into several key directories, with a focus on decentralized components:

- `backend/`: Contains the core backend services and API routes
  - `src/`: Source code for the backend
    - `controllers/`: Request handlers for different API endpoints
    - `models/`: Database models for MongoDB
    - `routes/`: API route definitions
    - `services/`: Core business logic implementations, including decentralized services
- `Discord Bot/`: Main Discord bot implementation
  - `commands/`: Individual command implementations
  - `events/`: Event handlers for Discord events
  - `middleware/`: Custom middleware for command processing
  - `utils/`: Utility functions and helpers, including P2P and blockchain utilities
- `smart-contracts/`: Ethereum and IOTA smart contracts
  - `contracts/`: Solidity contract files
  - `scripts/`: Deployment and management scripts for decentralized networks
  - `test/`: Contract test files
- `scripts/`: Various utility and setup scripts, including decentralized deployment scripts

Key Files:
- `Discord Bot/bot.js`: Main entry point for the Discord bot
- `Discord Bot/backend/src/app.js`: Express.js application setup
- `Discord Bot/backend/src/server.js`: Server initialization
- `Discord Bot/scripts/deploy1.js`: Main deployment script for smart contracts on decentralized networks
- `Discord Bot/scripts/setup.sh`: Environment setup script for decentralized infrastructure
- `Discord Bot/package.json`: Project dependencies and scripts

## Usage Instructions

### Installation

Prerequisites:
- Node.js v16.0.0 or higher
- Akash Network CLI (`akash`)
- IPFS CLI (`ipfs`)
- OrbitDB
- Docker

Steps:
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in the required environment variables
4. Run `npm run setup` to initialize the environment and decentralized infrastructure

### Getting Started

1. Start the bot: `npm run start`
2. Invite the bot to your Discord server using the generated invite link
3. Use the `/help` command in Discord to see available commands

### Configuration

Key configuration files:
- `.env`: Environment variables
- `Discord Bot/backend/src/config/`: Configuration files for various decentralized services

### Common Use Cases

1. Training an AI model using decentralized compute:
   ```
   /train dataset:<IPFS_HASH> parameters:{"epochs": 10, "batch_size": 32}
   ```

2. Listing a model on the decentralized marketplace:
   ```
   /list model_id:<MODEL_ID> price:100
   ```

3. Creating a DAO proposal:
   ```
   /propose title:"New Feature" description:"Let's add a new command" type:FEATURE_REQUEST
   ```

### Integration Patterns

- Use the provided `AIService` to integrate AI functionality into custom commands
- Leverage the `BlockchainService` for interacting with smart contracts on Ethereum and IOTA
- Utilize the `P2PManager` for decentralized data storage and retrieval using IPFS and OrbitDB

### Testing & Quality

Run tests: `npm run test`

### Troubleshooting

Common issues:
1. Bot fails to connect to Discord
   - Error: "Error: An invalid token was provided."
   - Solution: Check the `DISCORD_TOKEN` in your `.env` file
   - Debug: Enable verbose logging by setting `LOG_LEVEL=debug` in `.env`

2. Smart contract deployment fails
   - Error: "Error: cannot estimate gas; transaction may fail or may require manual gas limit"
   - Solution: Ensure you have sufficient ETH in your deployer account
   - Debug: Run deployment with `HARDHAT_NETWORK=localhost` for local testing

3. P2P operations timeout
   - Error: "Error: operation timed out after 30000ms"
   - Solution: Check your IPFS node connection and increase the timeout in `Discord Bot/backend/src/config/ipfs.js`
   - Debug: Enable IPFS debug logs by setting `IPFS_LOGGING=true` in `.env`

For further debugging:
- Check log files in the `logs/` directory
- Use the `/status` command to check system health
- Review the Sentry dashboard for detailed error reports

## Data Flow

The Discord bot processes user commands through a series of steps, integrating various decentralized services:

1. User input: Discord user sends a command
2. Command parsing: Bot parses the command and validates input
3. Middleware processing: Rate limiting, permissions, and input validation
4. Service interaction: Bot interacts with relevant services (AI, Blockchain, P2P)
5. External API calls: Interaction with Akash, IPFS, or other decentralized services
6. Data storage/retrieval: Storing or fetching data from OrbitDB or IPFS
7. Smart contract interaction: Executing functions on Ethereum or IOTA contracts
8. Response generation: Preparing and sending response to user

```
[Discord User] -> [Discord API] -> [Bot Command Handler]
    -> [Middleware (Rate Limit, Permissions, Validation)]
    -> [Service Layer (AI, Blockchain, P2P)]
    -> [Decentralized Services (Akash, IPFS)] <-> [Decentralized Storage (OrbitDB, IPFS)]
    -> [Smart Contracts] <-> [Ethereum/IOTA Networks]
    -> [Response Formatter] -> [Discord API] -> [Discord User]
```

Note: The bot uses a circuit breaker pattern to handle failures in external service calls, ensuring resilience and fault tolerance across decentralized components.

## Deployment

Prerequisites:
- Docker
- Akash Network CLI (`akash`)
- IPFS CLI (`ipfs`)
- OrbitDB

Deployment Steps:

1. Build Docker image:
   ```bash
   docker build -t discord-bot .
   ```

2. Push image to decentralized registry (IPFS-based)

3. Deploy to Akash Network:
   ```bash
   # Initialize deployment
   akash tx deployment create deployment.yml --from wallet
   # Accept provider bid
   akash tx market lease create --from wallet --provider selected-provider
   ```

4. Setup decentralized services:
   ```bash
   # Initialize IPFS storage
   ipfs init
   ipfs daemon

   # Setup OrbitDB
   node scripts/setup/init-orbitdb.js
   ```

Environment Configuration:

Use appropriate .env files with decentralized configurations:
- Development: `.env.development.decentralized`
- Staging: `.env.staging.decentralized`
- Production: `.env.production.decentralized`

Monitoring Setup:

1. Deploy monitoring stack on Akash:
   ```bash
   akash tx deployment create monitoring/prometheus-deployment.yml
   ```

2. Configure Grafana dashboards:
   ```bash
   node scripts/setup/setup-monitoring.js
   ```

3. Monitor decentralized components:
   - IPFS node health and network metrics
   - OrbitDB replication status
   - Akash deployment status
   - Custom application metrics

## Decentralized Infrastructure Components

The project is designed to run entirely on decentralized infrastructure:

### Core Components:
- **Compute**: Akash Network provides decentralized computing resources
- **Storage**: IPFS handles distributed file storage
- **Database**: OrbitDB manages decentralized data storage
- **Monitoring**: Self-hosted Prometheus and Grafana

### Key Features:
- Fully decentralized compute layer using Akash Network
- Distributed storage and content addressing via IPFS
- Decentralized database with automatic replication using OrbitDB
- Scalable and fault-tolerant architecture
- No single point of failure

- IPFS: Used for decentralized file storage and content addressing
- OrbitDB: Provides a decentralized database built on top of IPFS
- Ethereum: Smart contracts for DAO governance and token management
- IOTA: Used for feeless transactions and data integrity
- Akash Network: Decentralized compute resources for AI model training

Key decentralized services:
- `IPFSService`: Handles interaction with the IPFS network
- `OrbitDBService`: Manages decentralized database operations
- `BlockchainService`: Interacts with Ethereum and IOTA networks
- `AkashService`: Manages deployment of training environments on Akash Network

By leveraging these decentralized technologies, the Discord bot achieves a high level of resilience, scalability, and censorship resistance.
Visit Our Discord to Get Involved in Decentralized A.I. https://discord.com/channels/1333920429546672263/1336103019246391469
Visit Our Discord for SDG 2030 Discord, https://discord.com/channels/1332746516963524609/1332750850761687052
