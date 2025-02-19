const Safe = require('@safe-global/safe-core-sdk');
const SafeServiceClient = require('@safe-global/safe-service-client');
const EthersAdapter = require('@safe-global/safe-ethers-lib');
const { ethers } = require('ethers');
const config = require('../../config');

class GnosisSafeService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.rpc.ethereum);
        this.signer = new ethers.Wallet(config.privateKey, this.provider);
        this.safeAddress = config.contracts.treasury;
    }

    async initialize() {
        try {
            const ethAdapter = new EthersAdapter({
                ethers,
                signer: this.signer
            });

            this.safeSDK = await Safe.create({
                ethAdapter,
                safeAddress: this.safeAddress
            });

            this.safeService = new SafeServiceClient({
                txServiceUrl: config.services.gnosisSafe,
                ethAdapter
            });
        } catch (error) {
            console.error('Failed to initialize Gnosis Safe SDK:', error);
            throw error;
        }
    }

    async proposeTreasurySafeTransaction(proposalId, recipient, amount, token) {
        try {
            const safeTransaction = await this.safeSDK.createTransaction({
                to: token === ethers.constants.AddressZero ? recipient : token,
                value: token === ethers.constants.AddressZero ? amount : '0',
                data: token === ethers.constants.AddressZero ? '0x' : 
                    new ethers.utils.Interface(['function transfer(address,uint256)'])
                        .encodeFunctionData('transfer', [recipient, amount])
            });

            const safeTxHash = await this.safeSDK.getTransactionHash(safeTransaction);
            const senderSignature = await this.safeSDK.signTransactionHash(safeTxHash);

            await this.safeService.proposeTransaction({
                safeAddress: this.safeAddress,
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderAddress: this.signer.address,
                senderSignature: senderSignature.data,
                origin: `Treasury Proposal #${proposalId}`
            });

            return safeTxHash;
        } catch (error) {
            console.error('Failed to propose Safe transaction:', error);
            throw error;
        }
    }

    async executeTransaction(safeTxHash) {
        try {
            const safeTransaction = await this.safeService.getTransaction(safeTxHash);
            
            // Check if enough confirmations
            const threshold = await this.safeSDK.getThreshold();
            if (safeTransaction.confirmations.length < threshold) {
                throw new Error('Not enough confirmations');
            }

            const executeTxResponse = await this.safeSDK.executeTransaction(safeTransaction);
            await executeTxResponse.transactionResponse?.wait();

            return executeTxResponse.transactionResponse?.hash;
        } catch (error) {
            console.error('Failed to execute Safe transaction:', error);
            throw error;
        }
    }

    async getSigners() {
        try {
            const owners = await this.safeSDK.getOwners();
            return owners;
        } catch (error) {
            console.error('Failed to get Safe signers:', error);
            throw error;
        }
    }

    async getPendingTransactions() {
        try {
            const pendingTxs = await this.safeService.getPendingTransactions(this.safeAddress);
            return pendingTxs.results;
        } catch (error) {
            console.error('Failed to get pending transactions:', error);
            throw error;
        }
    }
}

module.exports = new GnosisSafeService();