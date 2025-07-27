const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Create a collection for commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// When the client is ready, run this code
client.once('ready', async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Register slash commands globally
    try {
        console.log('Started refreshing application (/) commands.');
        
        const commands = [];
        for (const command of client.commands.values()) {
            commands.push(command.data.toJSON());
        }
        
        // Register commands globally (takes up to 1 hour to appear)
        await client.application.commands.set(commands);
        console.log('Successfully reloaded application (/) commands globally.');
        console.log(`Registered ${commands.length} slash commands. They may take up to 1 hour to appear.`);
        console.log('You can use prefix commands with ? immediately: ?generate type:5char count:5');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// Handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        
        const errorMessage = 'There was an error while executing this command!';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Handle prefix commands (fallback)
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('?')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === 'generate') {
        // Parse arguments for prefix command
        let type = '5char';
        let count = 5;
        
        // Look for type argument
        const typeIndex = args.findIndex(arg => arg.startsWith('type:'));
        if (typeIndex !== -1) {
            type = args[typeIndex].split(':')[1] || '5char';
        }
        
        // Look for count argument
        const countIndex = args.findIndex(arg => arg.startsWith('count:'));
        if (countIndex !== -1) {
            const parsedCount = parseInt(args[countIndex].split(':')[1]);
            if (parsedCount && parsedCount >= 1 && parsedCount <= 10) {
                count = parsedCount;
            }
        }
        
        // Create a mock interaction object for the generate command
        const mockInteraction = {
            options: {
                getString: (name) => name === 'type' ? type : null,
                getInteger: (name) => name === 'count' ? count : null
            },
            deferReply: async () => {},
            editReply: async (content) => {
                if (content.embeds && content.embeds[0]) {
                    await message.reply({ embeds: content.embeds });
                } else {
                    await message.reply(content);
                }
            },
            replied: false,
            deferred: false
        };
        
        try {
            const generateCommand = client.commands.get('generate');
            if (generateCommand) {
                await generateCommand.execute(mockInteraction);
            }
        } catch (error) {
            console.error('Error executing prefix command:', error);
            await message.reply('There was an error while executing this command!');
        }
    } else if (commandName === 'help') {
        const { EmbedBuilder } = require('discord.js');
        const helpEmbed = new EmbedBuilder()
            .setTitle('🎮 Roblox Username Generator Bot')
            .setDescription('Generate available Roblox usernames with different styles!')
            .addFields([
                {
                    name: '📝 Commands',
                    value: '`?generate type:5char count:5` - Generate usernames\n`/generate` - Use slash command (if available)',
                    inline: false
                },
                {
                    name: '🎯 Types',
                    value: '• `5char` - 5 character usernames\n• `gaming` - Gaming themed\n• `cool` - Cool/aesthetic\n• `random` - Random length (3-12)\n• `mixed` - Letters + numbers',
                    inline: false
                },
                {
                    name: '📊 Examples',
                    value: '`?generate type:gaming count:3`\n`?generate type:cool count:8`\n`?generate type:5char count:10`',
                    inline: false
                }
            ])
            .setColor('#00D084')
            .setTimestamp();
        
        await message.reply({ embeds: [helpEmbed] });
    }
});

// Handle errors
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your client's token
client.login(config.DISCORD_TOKEN);
