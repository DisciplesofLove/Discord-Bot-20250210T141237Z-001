const pinataSDK = require('@pinata/sdk');

class PinataService {
    constructor() {
        this.pinata = pinataSDK(
            process.env.PINATA_API_KEY,
            process.env.PINATA_SECRET_KEY
        );
    }

    async pin(hash) {
        try {
            await this.pinata.pinByHash(hash);
            return true;
        } catch (error) {
            console.error('Pinata pinning error:', error);
            throw new Error(`Failed to pin to Pinata: ${error.message}`);
        }
    }
}

module.exports = { PinataService };