const { ethers } = require('ethers');
const { NotificationService } = require('./notification.service');

class DAOService {
    constructor() {
        this.provider = new ethers.providers.AlchemyProvider(
            process.env.NETWORK,
            process.env.ALCHEMY_API_KEY
        );
        this.notificationService = new NotificationService();
    }

    async createProposal({ title, description, type, modelId, creator }) {
        try {
            const daoContract = new ethers.Contract(
                process.env.DAO_CONTRACT_ADDRESS,
                ['function createProposal(string, string, uint8, address) returns (uint256)'],
                this.provider.getSigner()
            );

            const tx = await daoContract.createProposal(
                title,
                description,
                this.getProposalTypeId(type),
                creator
            );
            const receipt = await tx.wait();

            // Get proposal ID from event
            const proposalEvent = receipt.events.find(e => e.event === 'ProposalCreated');
            const proposalId = proposalEvent.args.proposalId.toString();

            // Notify DAO members
            await this.notificationService.sendCrossplatformNotification({
                type: 'new_proposal',
                message: `New DAO Proposal: ${title}`,
                platforms: ['discord', 'telegram', 'slack']
            });

            return {
                id: proposalId,
                status: 'active',
                created: Date.now()
            };
        } catch (error) {
            console.error('DAO proposal creation error:', error);
            throw new Error(`Failed to create proposal: ${error.message}`);
        }
    }

    async vote(proposalId, voter, support, power) {
        try {
            const votingContract = new ethers.Contract(
                process.env.DAO_VOTING_ADDRESS,
                ['function vote(uint256, bool, uint256)'],
                this.provider.getSigner()
            );

            const tx = await votingContract.vote(proposalId, support, power);
            await tx.wait();

            return {
                proposalId,
                voter,
                support,
                power,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('DAO voting error:', error);
            throw new Error(`Failed to cast vote: ${error.message}`);
        }
    }

    getProposalTypeId(type) {
        const types = {
            'model_approval': 0,
            'parameter_update': 1,
            'fine_tuning': 2,
            'ethics': 3
        };
        return types[type] || 0;
    }
}

module.exports = { DAOService };