class NFTService {
    constructor() {
        this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    }

    async getNFTs() {
        console.log('Fetching NFTs');
        return [];
    }
}

module.exports = NFTService;