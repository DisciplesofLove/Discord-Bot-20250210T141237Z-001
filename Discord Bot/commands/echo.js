module.exports = {
    name: 'echo',
    aliases: ['repeat', 'say', 'tell me'],
    description: 'Repeats your message',
    usage: '<message>',
    cooldown: 3,
    async execute(message, args) {
        if (!args.length) {
            return message.reply('You need to provide a message for me to repeat!');
        }
        await message.channel.send(args.join(' '));
    },
};