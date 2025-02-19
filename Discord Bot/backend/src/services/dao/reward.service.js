const { ethers } = require('ethers');
const Member = require('../../models/dao/Member');
const RewardSystemABI = require('../../../Contracts/RewardSystem.json');
const config = require('../../config');

class RewardService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(config.ethereumRPC);
        this.contract = new ethers.Contract(
            config.contracts.rewardSystem,
            RewardSystemABI,
            this.provider
        );
    }

    async claimRewards(userId) {
        try {
            const member = await Member.findOne({ discordId: userId });
            if (!member || !member.walletAddress) {
                throw new Error('Member not found or wallet not linked');
            }

            const tx = await this.contract.claimReward();
            const receipt = await tx.wait();

            const rewardEvent = receipt.events.find(e => e.event === 'RewardClaimed');
            const nftEvent = receipt.events.find(e => e.event === 'NFTMinted');

            const result = {
                success: true,
                message: 'Rewards claimed successfully',
                joyAmount: ethers.utils.formatEther(rewardEvent.args.joyAmount),
                transactionHash: receipt.transactionHash
            };

            if (nftEvent) {
                result.nftMinted = {
                    tokenId: nftEvent.args.tokenId.toString(),
                    uri: nftEvent.args.uri
                };
            }

            return result;
        } catch (error) {
            console.error('Error claiming rewards:', error);
            throw error;
        }
    }

    async getRewardTiers() {
        try {
            const tiers = [];
            for (let i = 1; i <= 3; i++) {
                const tier = await this.contract.rewardTiers(i);
                tiers.push({
                    id: i,
                    minLove: tier.minLove.toString(),
                    maxVice: tier.maxVice.toString(),
                    joyReward: ethers.utils.formatEther(tier.joyReward),
                    nftEligible: tier.nftEligible
                });
            }
            return {
                success: true,
                tiers
            };
        } catch (error) {
            console.error('Error getting reward tiers:', error);
            throw error;
        }
    }

    async getNFTBalance(userId) {
        try {
            const member = await Member.findOne({ discordId: userId });
            if (!member || !member.walletAddress) {
                throw new Error('Member not found or wallet not linked');
            }

            const balance = await this.contract.balanceOf(member.walletAddress);
            const nfts = [];

            for (let i = 0; i < balance; i++) {
                const tokenId = await this.contract.tokenOfOwnerByIndex(member.walletAddress, i);
                const uri = await this.contract.tokenURI(tokenId);
                nfts.push({ tokenId: tokenId.toString(), uri });
            }

            return {
                success: true,
                balance: balance.toString(),
                nfts
            };
        } catch (error) {
            console.error('Error getting NFT balance:', error);
            throw error;
        }
    }
}

module.exports = new RewardService();