# AI-Powered Discord Bot with DAO and Marketplace Integration

This project implements an AI-powered Discord bot with integrated DAO governance and marketplace functionality. It leverages blockchain technology, IPFS, and machine learning to create a decentralized ecosystem for AI model training and distribution.

The bot serves as an interface for users to interact with the system, allowing them to participate in governance, contribute to datasets, train AI models, and engage in marketplace activities. The backend infrastructure supports these operations through a combination of smart contracts, distributed storage, and cloud-based AI training capabilities.

## Repository Structure

The repository is organized into several key directories:

- `backend/`: Contains the Express.js backend application
  - `src/`: Source code for the backend
    - `controllers/`: Request handlers for different functionalities
    - `models/`: Database models
    - `routes/`: API route definitions
    - `services/`: Business logic implementations
- `discord-bot/`: Discord bot implementation
  - `commands/`: Bot command implementations
  - `events/`: Event handlers for Discord events
  - `utils/`: Utility functions and helpers
- `smart-contracts/`: Solidity smart contracts
  - `contracts/`: Smart contract implementations
  - `scripts/`: Deployment and management scripts
  - `test/`: Contract test suites
- `scripts/`: Utility scripts for deployment, maintenance, and automation
- `monitoring/`: Monitoring and logging utilities

Key Files:
- `discord-bot/bot.js`: Main entry point for the Discord bot
- `backend/src/server.js`: Entry point for the backend server
- `scripts/deploy1.js`: Main deployment script for smart contracts
- `Dockerfile` and `docker-compose.yml`: Container configurations
- `package.json`: Project dependencies and scripts

## Usage Instructions

### Installation

Prerequisites:
- Node.js v16 or later
- Docker and Docker Compose
- Ethereum development environment (e.g., Hardhat)

Steps:
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in the required environment variables
4. Run `npm run setup` to initialize the project

### Getting Started

1. Start the backend and bot:
   ```
   npm run start
   ```

2. Deploy smart contracts (if needed):
   ```
   npm run deploy:contracts
   ```

3. Register Discord bot commands:
   ```
   npm run discord:register
   ```

### Configuration

Key configuration files:
- `.env`: Environment variables
- `config/`: Application configuration files
- `hardhat.config.js`: Ethereum network configuration

### Common Use Cases

1. Training an AI model:
   ```
   /train <dataset_hash> <training_params>
   ```

2. Proposing a governance action:
   ```
   /propose <proposal_details>
   ```

3. Voting on a proposal:
   ```
   /vote <proposal_id> <vote>
   ```

4. Listing an AI model on the marketplace:
   ```
   /list <model_details> <price>
   ```

### Testing & Quality

Run the test suite:
```
npm run test
```

### Troubleshooting

Common issues:
1. Discord bot not responding
   - Check if the bot is online and has the correct permissions
   - Verify the `DISCORD_TOKEN` in the `.env` file
   - Review the bot logs for any error messages

2. Smart contract deployment failures
   - Ensure you have sufficient ETH for gas fees
   - Check the network configuration in `hardhat.config.js`
   - Verify that the contract ABIs are up to date

3. Database connection issues
   - Confirm that the database is running and accessible
   - Check the database connection string in the `.env` file
   - Ensure the necessary database user permissions are set

Debugging:
- Enable debug logging by setting `LOG_LEVEL=debug` in the `.env` file
- Check the `logs/` directory for detailed application logs
- Use the `/status` command in Discord to get the bot's current status

## Data Flow

The application follows a multi-layered architecture with the Discord bot as the primary user interface. Here's an overview of the data flow:

1. User interacts with the Discord bot using slash commands
2. Bot validates input and sends requests to the backend API
3. Backend processes requests, interacting with the database and blockchain as needed
4. For AI operations, the backend communicates with IPFS and Akash for dataset storage and model training
5. Smart contracts handle token operations, governance, and marketplace transactions
6. Results are sent back through the API to the Discord bot for user feedback

```
User -> Discord Bot -> Backend API -> Services -> Database/Blockchain/IPFS/Akash
  ^                                                          |
  |----------------------------------------------------------|
```

Note: The system uses caching and rate limiting to optimize performance and prevent abuse.

## Deployment

Prerequisites:
- AWS account with ECS configured
- Docker images pushed to a container registry

Steps:
1. Set up the required AWS resources (ECS cluster, task definitions, etc.)
2. Configure the deployment environment in `.env`
3. Run the deployment script:
   ```
   npm run deploy
   ```

The deployment uses a blue-green strategy to ensure zero-downtime updates.

## Infrastructure

The application uses the following key infrastructure resources:

- ECS:
  - Task Definition: Defines the Discord bot and backend containers
  - Service: Manages the running tasks and load balancing
- ElastiCache:
  - Redis cluster for caching and rate limiting
- RDS:
  - PostgreSQL database for persistent storage
- S3:
  - Bucket for storing backups and large files
- CloudWatch:
  - Log groups for centralized logging
  - Alarms for monitoring critical metrics

The infrastructure is defined and managed using AWS CloudFormation or Terraform (not included in this repository).