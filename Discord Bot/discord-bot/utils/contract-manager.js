const Web3 = require('web3');
const gnosisSafe = require('../../../services/integration/gnosis-safe.service');
const logger = require('./logger');

class ContractManager {
    constructor() {
        this.web3 = null;
        this.contracts = new Map();
    }

    async initialize() {
        try {
            // Connect to the blockchain network (e.g., local node, Infura, etc.)
            this.web3 = new Web3(process.env.WEB3_PROVIDER_URL);
            logger.info('Web3 connection initialized');
        } catch (error) {
            logger.error('Failed to initialize Web3:', error);
            throw error;
        }
    }

    async loadContract(contractName, abi, address) {
        try {
            const contract = new this.web3.eth.Contract(abi, address);
            this.contracts.set(contractName, contract);
            logger.info(`Contract ${contractName} loaded at address ${address}`);
            return contract;
        } catch (error) {
            logger.error(`Failed to load contract ${contractName}:`, error);
            throw error;
        }
    }

    async callContractMethod(contractName, methodName, ...args) {
        try {
            const contract = this.contracts.get(contractName);
            if (!contract) {
                throw new Error(`Contract ${contractName} not found`);
            }

            const method = contract.methods[methodName];
            if (!method) {
                throw new Error(`Method ${methodName} not found in contract ${contractName}`);
            }

            return await method(...args).call();
        } catch (error) {
            logger.error(`Contract method call failed:`, error);
            throw error;
        }
    }

    async sendTransaction(contractName, methodName, fromAddress, ...args) {
        if (contractName === 'Treasury') {
            // For treasury transactions, use Gnosis Safe
            return await gnosisSafe.proposeTreasurySafeTransaction(...args);
        }
        try {
            const contract = this.contracts.get(contractName);
            if (!contract) {
                throw new Error(`Contract ${contractName} not found`);
            }

            const method = contract.methods[methodName];
            if (!method) {
                throw new Error(`Method ${methodName} not found in contract ${contractName}`);
            }

            const gas = await method(...args).estimateGas({ from: fromAddress });
            return await method(...args).send({ from: fromAddress, gas });
        } catch (error) {
            logger.error(`Contract transaction failed:`, error);
            throw error;
        }
    }
}

module.exports = new ContractManager();