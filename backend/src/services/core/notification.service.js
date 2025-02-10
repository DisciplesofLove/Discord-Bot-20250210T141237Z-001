const twilio = require('twilio');
const { WebClient } = require('@slack/web-api');
const { Telegram } = require('telegraf');

class NotificationService {
    constructor() {
        this.twilio = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        this.telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN);
    }

    async sendCrossplatformNotification({
        userId,
        type,
        message,
        platforms = ['discord', 'sms', 'telegram', 'slack']
    }) {
        try {
            const notifications = [];

            if (platforms.includes('sms')) {
                notifications.push(this.sendSMS(userId, message));
            }
            if (platforms.includes('telegram')) {
                notifications.push(this.sendTelegram(userId, message));
            }
            if (platforms.includes('slack')) {
                notifications.push(this.sendSlack(userId, message));
            }
            if (platforms.includes('discord')) {
                notifications.push(this.sendDiscord(userId, message));
            }

            await Promise.all(notifications);

            return {
                success: true,
                platforms: platforms,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Notification error:', error);
            throw new Error(`Failed to send notifications: ${error.message}`);
        }
    }

    async sendSMS(userId, message) {
        const userPhone = await this.getUserPhone(userId);
        return this.twilio.messages.create({
            body: message,
            to: userPhone,
            from: process.env.TWILIO_PHONE_NUMBER
        });
    }

    async sendTelegram(userId, message) {
        const telegramId = await this.getTelegramId(userId);
        return this.telegram.sendMessage(telegramId, message);
    }

    async sendSlack(userId, message) {
        const slackId = await this.getSlackId(userId);
        return this.slack.chat.postMessage({
            channel: slackId,
            text: message,
            unfurl_links: false
        });
    }

    async sendDiscord(userId, message) {
        // Implementation for Discord DM notifications
        // This would typically use the Discord.js client
        return Promise.resolve();
    }

    // Helper methods to get platform-specific IDs
    async getUserPhone(userId) {
        // Implementation to get user's phone number from database
        return '+1234567890';
    }

    async getTelegramId(userId) {
        // Implementation to get user's Telegram ID from database
        return '123456789';
    }

    async getSlackId(userId) {
        // Implementation to get user's Slack ID from database
        return 'U123456789';
    }
}

module.exports = { NotificationService };