class CommandHandler {
    constructor() {
        this.commands = new Map();
    }

    registerCommand(command) {
        if (!command.name) {
            throw new Error('Command must have a name');
        }
        this.commands.set(command.name, command);
    }

    async processMessage(message) {
        const prefix = '!';
        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error('Error executing command:', error);
            message.reply('There was an error executing that command.');
        }
    }
}

module.exports = CommandHandler;