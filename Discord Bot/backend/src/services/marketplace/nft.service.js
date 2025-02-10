const { Web3 } = require('web3');
const IPFS = require('../core/ipfs.service');
const { MARKETPLACE_CONTRACT_ABI } = require('../../config/contracts');
const { MARKETPLACE_ADDRESS } = require('../../config/blockchain');

class NFTService {
    constructor() {
        this.web3 = new Web3(process.env.POLYGON_RPC_URL);
        this.ipfs = new IPFS();
        this.marketplaceContract = new this.web3.eth.Contract(
            MARKETPLACE_CONTRACT_ABI,
            MARKETPLACE_ADDRESS
        );
    }

    async mintModelNFT(modelData, owner) {
        // Store model metadata on IPFS
        const metadata = await this.createModelMetadata(modelData);
        const ipfsHash = await this.ipfs.store(metadata);

        // Mint NFT
        const transaction = await this.marketplaceContract.methods
            .mintModelNFT(owner, ipfsHash)
            .send({ from: process.env.MINTER_ADDRESS });

        return {
            tokenId: transaction.events.Transfer.returnValues.tokenId,
            ipfsHash,
            transactionHash: transaction.transactionHash
        };
    }

    async listModelForSale(tokenId, price) {
        const transaction = await this.marketplaceContract.methods
            .listModel(tokenId, this.web3.utils.toWei(price.toString(), 'ether'))
            .send({ from: process.env.MARKETPLACE_OPERATOR });

        return {
            listingId: transaction.events.ModelListed.returnValues.listingId,
            transactionHash: transaction.transactionHash
        };
    }

    async createModelMetadata(modelData) {
        return {
            name: modelData.name,
            description: modelData.description,
            architecture: modelData.architecture,
            performance_metrics: modelData.metrics,
            training_data_summary: modelData.dataSummary,
            created_at: Date.now(),
            version: modelData.version,
            license: modelData.license,
            creator: modelData.creator
        };
    }

    async getModelMetadata(tokenId) {
        const ipfsHash = await this.marketplaceContract.methods
            .tokenURI(tokenId)
            .call();
        
        return this.ipfs.retrieve(ipfsHash);
    }
}

module.exports = NFTService;