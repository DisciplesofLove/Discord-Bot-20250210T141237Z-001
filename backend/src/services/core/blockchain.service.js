const { ethers } = require('ethers');
const { NFTStorage } = require('nft.storage');
const { IotaService } = require('./iota.service');
const { PinataService } = require('./pinata.service');

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.AlchemyProvider(
            process.env.NETWORK,
            process.env.ALCHEMY_API_KEY
        );
        this.nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
        this.iotaService = new IotaService();
        this.pinataService = new PinataService();
    }

    async mintModelNFT({ modelMetadataHash, creator, modelType, deploymentId }) {
        try {
            // Upload metadata to NFT.storage
            const metadata = await this.nftStorage.store({
                name: `AI Model - ${modelType}`,
                description: `Trained AI model: ${modelType}`,
                image: `ipfs://${modelMetadataHash}`,
                properties: {
                    creator,
                    modelType,
                    deploymentId,
                    timestamp: Date.now()
                }
            });

            // Pin to Pinata for redundancy
            await this.pinataService.pin(modelMetadataHash);

            // Mint NFT on Polygon
            const nftContract = new ethers.Contract(
                process.env.NFT_CONTRACT_ADDRESS,
                ['function mint(address to, string memory uri) public returns (uint256)'],
                this.provider.getSigner()
            );

            const tx = await nftContract.mint(creator, metadata.url);
            const receipt = await tx.wait();

            // Get token ID from event logs
            const transferEvent = receipt.events.find(e => e.event === 'Transfer');
            const tokenId = transferEvent.args.tokenId.toString();

            // List on JoyMarketplace
            await this.listOnMarketplace(tokenId, creator);

            return {
                address: nftContract.address,
                tokenId,
                metadata: metadata.url
            };
        } catch (error) {
            console.error('NFT minting error:', error);
            throw new Error(`Failed to mint NFT: ${error.message}`);
        }
    }

    async listOnMarketplace(tokenId, creator) {
        // Implementation for listing on JoyMarketplace.io
        const marketplaceContract = new ethers.Contract(
            process.env.MARKETPLACE_ADDRESS,
            ['function listItem(uint256 tokenId, uint256 price) public'],
            this.provider.getSigner()
        );

        await marketplaceContract.listItem(tokenId, ethers.utils.parseEther('1.0'));
    }

    async setupFederatedLearning(participants) {
        // Implementation for setting up federated learning smart contracts
        return {
            contractAddress: '0x...',
            participants
        };
    }

    async processModelLease(modelId, lessee, duration) {
        // Implementation for processing model leases using IOTA
        const leaseTransaction = await this.iotaService.createLeaseTransaction({
            modelId,
            lessee,
            duration
        });

        return {
            leaseId: leaseTransaction.id,
            startTime: Date.now(),
            endTime: Date.now() + duration
        };
    }
}

module.exports = { BlockchainService };