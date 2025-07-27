const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const usernameGenerator = require('../utils/usernameGenerator.js');
const robloxApi = require('../utils/robloxApi.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate available Roblox usernames')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of username to generate')
                .setRequired(true)
                .addChoices(
                    { name: '5 Character', value: '5char' },
                    { name: 'Random Length (3-12)', value: 'random' },
                    { name: 'Gaming Themed', value: 'gaming' },
                    { name: 'Cool/Aesthetic', value: 'cool' },
                    { name: 'Numbers + Letters', value: 'mixed' }
                ))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of usernames to generate (1-10)')
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const count = interaction.options.getInteger('count') || 5;

        await interaction.deferReply();

        try {
            // Generate and check usernames until we have the requested count of available ones
            const availableUsernames = [];
            const allCheckedUsernames = [];
            let attempts = 0;

            while (availableUsernames.length < count) {
                const username = usernameGenerator.generate(type);
                
                // Skip if we've already checked this username
                if (allCheckedUsernames.find(u => u.username === username)) {
                    attempts++;
                    continue;
                }
                
                attempts++;
                
                try {
                    const isAvailable = await robloxApi.checkUsernameAvailability(username);
                    const result = { username, available: isAvailable };
                    
                    allCheckedUsernames.push(result);
                    
                    if (isAvailable) {
                        availableUsernames.push(result);
                    }
                } catch (error) {
                    console.warn(`Error checking ${username}:`, error.message);
                    // Assume available on error and count it
                    const result = { username, available: true, error: true };
                    allCheckedUsernames.push(result);
                    availableUsernames.push(result);
                }
                
                // Update progress every 10 attempts to prevent Discord timeout
                if (attempts % 10 === 0) {
                    try {
                        const progressEmbed = new EmbedBuilder()
                            .setTitle('🔍 Searching for Available Usernames...')
                            .setDescription(`Found: **${availableUsernames.length}**/${count} available usernames\nTotal checked: **${allCheckedUsernames.length}** usernames`)
                            .setColor('#FFD700')
                            .setFooter({ text: 'Please wait, continuing search...' });
                        
                        await interaction.editReply({ embeds: [progressEmbed] });
                    } catch (updateError) {
                        console.warn('Failed to update progress:', updateError.message);
                    }
                }
                
                // Add small delay to avoid overwhelming the API
                if (attempts % 3 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Prepare results - show available usernames first, then some taken ones for context
            const results = [...availableUsernames];
            const takenUsernames = allCheckedUsernames.filter(u => !u.available).slice(0, Math.min(3, count));
            results.push(...takenUsernames);
            
            const embed = new EmbedBuilder()
                .setTitle(`🎮 Generated ${type === '5char' ? '5-Character' : type.charAt(0).toUpperCase() + type.slice(1)} Roblox Usernames`)
                .setColor('#00D084')
                .setTimestamp();

            let description = '';
            const availableCount = availableUsernames.length;
            const totalChecked = allCheckedUsernames.length;

            // Sort results to show available usernames first
            results.sort((a, b) => {
                if (a.available && !b.available) return -1;
                if (!a.available && b.available) return 1;
                return 0;
            });

            // Add header for available usernames
            if (availableCount > 0) {
                description += `**✅ Available Usernames (${availableCount}):**\n`;
                const available = results.filter(r => r.available);
                for (const result of available) {
                    const { username, error } = result;
                    if (error) {
                        description += `🟡 \`${username}\` - Check failed, likely available\n`;
                    } else {
                        description += `🟢 \`${username}\` - Available\n`;
                    }
                }
            }

            // Add taken usernames for context if any
            const takenResults = results.filter(r => !r.available);
            if (takenResults.length > 0) {
                description += `\n**❌ Some Taken Usernames Checked:**\n`;
                for (const result of takenResults.slice(0, 3)) {
                    description += `🔴 \`${result.username}\` - Taken\n`;
                }
            }

            // Add summary
            if (description) {
                embed.setDescription(description);
            } else {
                embed.setDescription('❌ Unable to check any usernames. Please try again later.');
            }

            embed.addFields([
                {
                    name: '📊 Summary',
                    value: `Found: **${availableCount}**/${count} available\nTotal checked: **${totalChecked}** usernames\nAttempts: **${attempts}**`,
                    inline: true
                }
            ]);

            // Add footer with generation info
            const typeDescriptions = {
                '5char': '5 random characters',
                'random': '3-12 character random mix',
                'gaming': 'Gaming-themed usernames',
                'cool': 'Cool/aesthetic usernames',
                'mixed': 'Letters and numbers mix'
            };

            embed.setFooter({
                text: `Generation type: ${typeDescriptions[type] || type} | Real-time Roblox API checking`
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in generate command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while generating usernames. This might be due to rate limiting or API issues. Please try again in a few moments.')
                .setColor('#FF0000')
                .setTimestamp();

            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else {
                    await interaction.reply({ embeds: [errorEmbed] });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    },
};
