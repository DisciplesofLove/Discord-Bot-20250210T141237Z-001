module.exports = {
    name: 'ping',
    aliases: ['test', 'latency', 'how are you'],
    description: 'Check if the bot is responding',
    cooldown: 5,
    async execute(message) {
        const reply = await message.reply('Pinging...');
        const latency = reply.createdTimestamp - message.createdTimestamp;
        await reply.edit(`Pong! Latency is ${latency}ms.`);
    },
};