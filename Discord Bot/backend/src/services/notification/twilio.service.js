const twilio = require('twilio');

class TwilioService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendNotification(to, message) {
        try {
            const response = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });

            return {
                success: true,
                messageId: response.sid,
                status: response.status
            };
        } catch (error) {
            console.error('Failed to send Twilio notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendBatchNotifications(recipients, message) {
        const results = await Promise.allSettled(
            recipients.map(recipient => 
                this.sendNotification(recipient, message)
            )
        );

        return {
            success: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
            details: results
        };
    }

    async scheduleNotification(to, message, scheduledTime) {
        // Convert scheduledTime to UTC if it's not already
        const utcTime = new Date(scheduledTime).toISOString();

        try {
            const response = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to,
                sendAt: utcTime,
                scheduleType: 'fixed'
            });

            return {
                success: true,
                messageId: response.sid,
                scheduledTime: utcTime
            };
        } catch (error) {
            console.error('Failed to schedule Twilio notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = TwilioService;