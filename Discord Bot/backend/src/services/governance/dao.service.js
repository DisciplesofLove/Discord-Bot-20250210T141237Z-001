const { Web3 } = require('web3');
const { DAO_CONTRACT_ABI } = require('../../config/contracts');
const { DAO_ADDRESS } = require('../../config/blockchain');
const TwilioService = require('../notification/twilio.service');

class DAOService {
    constructor() {
        this.web3 = new Web3(process.env.POLYGON_RPC_URL);
        this.daoContract = new this.web3.eth.Contract(
            DAO_CONTRACT_ABI,
            DAO_ADDRESS
        );
        this.twilioService = new TwilioService();
    }

    async createProposal(type, data, creator) {
        const proposal = {
            type, // 'MODEL_APPROVAL', 'FEATURE_REQUEST', 'PARAMETER_CHANGE'
            data,
            creator,
            status: 'PENDING',
            votes: {
                for: 0,
                against: 0
            },
            createdAt: Date.now(),
            endTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 week voting period
        };

        const transaction = await this.daoContract.methods
            .createProposal(JSON.stringify(proposal))
            .send({ from: creator });

        // Notify community members
        await this.notifyCommunity('NEW_PROPOSAL', proposal);

        return {
            proposalId: transaction.events.ProposalCreated.returnValues.proposalId,
            transactionHash: transaction.transactionHash
        };
    }

    async castVote(proposalId, voter, vote, votingPower) {
        // Implement quadratic voting
        const quadraticVotingPower = Math.sqrt(votingPower);
        
        const transaction = await this.daoContract.methods
            .castVote(proposalId, vote, quadraticVotingPower)
            .send({ from: voter });

        const proposal = await this.getProposal(proposalId);
        
        // Check if proposal has reached conclusion
        await this.checkProposalStatus(proposalId);

        return {
            success: true,
            votingPower: quadraticVotingPower,
            transactionHash: transaction.transactionHash
        };
    }

    async getProposal(proposalId) {
        const proposal = await this.daoContract.methods
            .getProposal(proposalId)
            .call();
        
        return JSON.parse(proposal);
    }

    async checkProposalStatus(proposalId) {
        const proposal = await this.getProposal(proposalId);
        
        if (this.hasReachedConsensus(proposal)) {
            await this.executeProposal(proposalId);
        }
    }

    hasReachedConsensus(proposal) {
        const totalVotes = proposal.votes.for + proposal.votes.against;
        const forPercentage = (proposal.votes.for / totalVotes) * 100;
        
        return totalVotes >= 100 && forPercentage >= 66; // 66% majority required
    }

    async executeProposal(proposalId) {
        const proposal = await this.getProposal(proposalId);
        
        switch(proposal.type) {
            case 'MODEL_APPROVAL':
                await this.executeModelApproval(proposal);
                break;
            case 'FEATURE_REQUEST':
                await this.executeFeatureRequest(proposal);
                break;
            case 'PARAMETER_CHANGE':
                await this.executeParameterChange(proposal);
                break;
        }

        await this.notifyCommunity('PROPOSAL_EXECUTED', proposal);
    }

    async executeModelApproval(proposal) {
        if (proposal.votes.for > proposal.votes.against) {
            // Approve model and mint NFT
            const nftService = require('../marketplace/nft.service');
            await nftService.mintModelNFT(proposal.data.model, proposal.data.creator);
        }
    }

    async notifyCommunity(eventType, data) {
        // Send notifications via Twilio
        const subscribers = await this.getSubscribers();
        
        for (const subscriber of subscribers) {
            await this.twilioService.sendNotification(
                subscriber.phone,
                this.formatNotificationMessage(eventType, data)
            );
        }
    }

    formatNotificationMessage(eventType, data) {
        switch(eventType) {
            case 'NEW_PROPOSAL':
                return `New DAO proposal created: ${data.type} by ${data.creator}. Vote now!`;
            case 'PROPOSAL_EXECUTED':
                return `Proposal ${data.id} has been executed! Result: ${data.votes.for > data.votes.against ? 'Approved' : 'Rejected'}`;
            default:
                return `DAO Update: ${eventType}`;
        }
    }

    async getSubscribers() {
        // Implement subscriber fetching logic
        return this.daoContract.methods.getSubscribers().call();
    }
}

module.exports = DAOService;