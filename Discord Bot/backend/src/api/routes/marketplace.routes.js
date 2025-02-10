const express = require('express');
const router = express.Router();
const MarketplaceService = require('../../services/marketplace/marketplace.service');
const NFTService = require('../../services/marketplace/nft.service');
const auth = require('../middleware/auth');

const marketplaceService = new MarketplaceService();
const nftService = new NFTService();

// List model for sale
router.post('/list', auth, async (req, res) => {
    try {
        const { modelId, price, terms } = req.body;
        const listing = await marketplaceService.listModel(modelId, price, terms);
        res.json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Purchase model
router.post('/purchase/:listingId', auth, async (req, res) => {
    try {
        const result = await marketplaceService.purchaseModel(req.params.listingId, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get model details
router.get('/model/:modelId', async (req, res) => {
    try {
        const metadata = await nftService.getModelMetadata(req.params.modelId);
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get market statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await marketplaceService.getMarketStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;