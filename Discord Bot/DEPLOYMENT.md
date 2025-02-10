# Decentralized Deployment Guide

This application uses a fully decentralized infrastructure with the following components:

## Core Services

1. IPFS
   - Used for distributed file storage
   - Replaces S3 for file storage
   - Port: 5001 (API), 4001 (P2P), 8080 (Gateway)

2. OrbitDB
   - Decentralized database built on IPFS
   - Replaces PostgreSQL/RDS
   - Requires IPFS node

3. GunDB
   - Distributed cache and real-time sync
   - Replaces Redis/ElastiCache
   - Port: 8765

4. IOTA Node
   - Provides feeless blockchain transactions
   - Replaces Ethereum integration
   - Ports: 14265 (API), 15600 (P2P)

5. LibP2P Monitoring
   - Decentralized metrics and monitoring
   - Replaces CloudWatch
   - Port: 9090

## Deployment Steps

1. Start IPFS node:
   ```bash
   docker-compose up ipfs
   ```

2. Initialize OrbitDB:
   ```bash
   docker-compose up orbitdb
   ```

3. Start GunDB cache:
   ```bash
   docker-compose up gun
   ```

4. Start IOTA node:
   ```bash
   docker-compose up iota-node
   ```

5. Deploy Discord bot:
   ```bash
   docker-compose up discord-bot
   ```

## Data Persistence

All data is stored in local volumes:
- ./ipfs-data: IPFS blocks and config
- ./orbitdb-data: OrbitDB database files
- ./gun-data: GunDB cache data
- ./iota-data: IOTA node data

## Monitoring

Monitoring is handled through the P2P network using LibP2P and OrbitDB for metrics storage. No central monitoring service is required.

## Scaling

The application can be scaled horizontally by running multiple instances across different machines. The P2P nature of the infrastructure ensures data consistency and availability.