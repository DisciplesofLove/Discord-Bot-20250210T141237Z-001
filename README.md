# AI-Powered Decentralized Discord Bot with DAO Governance

This project implements an advanced Discord bot leveraging AI, blockchain, and decentralized technologies to provide a robust platform for community engagement, governance, and AI model marketplace.

## Project Description

This Discord bot is a cutting-edge application that combines artificial intelligence, blockchain technology, and decentralized infrastructure to create a powerful platform for Discord communities. The bot offers a wide range of features, including AI model training and marketplace integration, decentralized autonomous organization (DAO) governance, and robust peer-to-peer (P2P) data management.

Key features include:
- AI model training and fine-tuning using decentralized compute resources
- Marketplace for buying, selling, and leasing AI models
- DAO governance system for community decision-making
- Decentralized data storage and retrieval using IPFS and OrbitDB
- Integration with multiple blockchain networks (Ethereum, IOTA)
- Advanced error handling and monitoring

The bot is designed to be highly scalable, secure, and resilient, leveraging decentralized technologies to ensure high availability and data integrity. It provides a comprehensive suite of commands for users to interact with various aspects of the system, from AI model management to participation in DAO governance.

## Repository Structure

The repository is organized into several key directories:

- `backend/`: Contains the core backend services and API routes
  - `src/`: Source code for the backend
    - `controllers/`: Request handlers for different API endpoints
    - `models/`: Database models for MongoDB
    - `routes/`: API route definitions
    - `services/`: Core business logic implementations
- `Discord Bot/`: Main Discord bot implementation
  - `commands/`: Individual command implementations
  - `events/`: Event handlers for Discord events
  - `middleware/`: Custom middleware for command processing
  - `utils/`: Utility functions and helpers
- `smart-contracts/`: Ethereum smart contracts
  - `contracts/`: Solidity contract files
  - `scripts/`: Deployment and management scripts
  - `test/`: Contract test files
- `scripts/`: Various utility and setup scripts
- `tests/`: Test suites for different components

Key Files:
- `Discord Bot/bot.js`: Main entry point for the Discord bot
- `Discord Bot/backend/src/app.js`: Express.js application setup
- `Discord Bot/backend/src/server.js`: Server initialization
- `Discord Bot/scripts/deploy1.js`: Main deployment script for smart contracts
- `Discord Bot/scripts/setup.sh`: Environment setup script
- `Discord Bot/package.json`: Project dependencies and scripts

## Usage Instructions

### Installation

Prerequisites:
- Node.js v16.0.0 or higher
- MongoDB
- IPFS node
- Ethereum node (for blockchain integration)

Steps:
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in the required environment variables
4. Run `npm run setup` to initialize the environment and database

### Getting Started

1. Start the bot: `npm run start`
2. Invite the bot to your Discord server using the generated invite link
3. Use the `/help` command in Discord to see available commands

### Configuration

Key configuration files:
- `.env`: Environment variables
- `Discord Bot/backend/src/config/`: Configuration files for various services

### Common Use Cases

1. Training an AI model:
   ```
   /train dataset:<IPFS_HASH> parameters:{"epochs": 10, "batch_size": 32}
   ```

2. Listing a model on the marketplace:
   ```
   /list model_id:<MODEL_ID> price:100
   ```

3. Creating a DAO proposal:
   ```
   /propose title:"New Feature" description:"Let's add a new command" type:FEATURE_REQUEST
   ```

### Integration Patterns

- Use the provided `AIService` to integrate AI functionality into custom commands
- Leverage the `BlockchainService` for interacting with smart contracts
- Utilize the `P2PManager` for decentralized data storage and retrieval

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
5. External API calls: Interaction with Akash, IPFS, or other external services
6. Data storage/retrieval: Storing or fetching data from OrbitDB or IPFS
7. Smart contract interaction: Executing functions on Ethereum contracts
8. Response generation: Preparing and sending response to user

```
[Discord User] -> [Discord API] -> [Bot Command Handler]
    -> [Middleware (Rate Limit, Permissions, Validation)]
    -> [Service Layer (AI, Blockchain, P2P)]
    -> [External APIs (Akash, IPFS)] <-> [Decentralized Storage (OrbitDB, IPFS)]
    -> [Smart Contracts] <-> [Ethereum Network]
    -> [Response Formatter] -> [Discord API] -> [Discord User]
```

Note: The bot uses a circuit breaker pattern to handle failures in external service calls, ensuring resilience and fault tolerance.

## Deployment

Prerequisites:
- Docker
- AWS CLI (for AWS deployment)
- Kubernetes cluster (optional)

Deployment steps:
1. Build Docker image: `docker build -t discord-bot .`
2. Push image to container registry
3. Deploy using preferred method:
   - Docker: `docker run -d --env-file .env discord-bot`
   - Kubernetes: `kubectl apply -f k8s/`
   - AWS ECS: Use `scripts/deployment/deploy-backend.js`

Environment configurations:
- Development: Use `.env.development`
- Staging: Use `.env.staging`
- Production: Use `.env.production`

Monitoring setup:
- Configure Sentry DSN in `.env` for error tracking
- Set up Prometheus for metrics collection
- Use provided `scripts/monitor.sh` for basic health checks

## Infrastructure

The project utilizes several infrastructure resources defined in deployment scripts:

Lambda:
- `verifyDeployment`: Verifies the deployment of the Discord bot

ECS:
- `DiscordBotService`: Main ECS service running the Discord bot containers

S3:
- `BackupBucket`: Stores backups of the bot's data

DynamoDB:
- `CommandHistoryTable`: Stores command execution history for analytics

CloudWatch:
- `BotLogGroup`: Collects logs from the Discord bot containers

IAM:
- `BotExecutionRole`: IAM role for the bot's ECS tasks, granting necessary permissions