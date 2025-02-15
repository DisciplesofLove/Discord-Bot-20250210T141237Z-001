class MarketplaceService {
    constructor() {
        this.apiKey = process.env.MARKETPLACE_API_KEY;
    }

    async listItems() {
        console.log('Fetching marketplace items');
        return [];
    }
}

module.exports = MarketplaceService;