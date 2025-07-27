module.exports = {
    // Discord bot token from environment variable
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || 'your_discord_bot_token_here',
    
    // Bot configuration
    BOT_PREFIX: '!',
    
    // Rate limiting configuration
    ROBLOX_API_DELAY: 500, // Delay between Roblox API calls in milliseconds
    MAX_USERNAMES_PER_REQUEST: 10,
    
    // Username generation limits
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    
    // Error messages
    ERRORS: {
        ROBLOX_API_ERROR: 'Unable to check username availability with Roblox API',
        RATE_LIMITED: 'Rate limited by Roblox. Please try again later',
        INVALID_USERNAME: 'Invalid username format',
        GENERATION_FAILED: 'Failed to generate usernames'
    },
    
    // Success messages
    MESSAGES: {
        USERNAME_AVAILABLE: 'Username is available!',
        USERNAME_TAKEN: 'Username is already taken',
        GENERATION_COMPLETE: 'Username generation completed'
    },
    
    // Discord embed colors
    COLORS: {
        SUCCESS: '#00D084',
        ERROR: '#FF0000',
        WARNING: '#FFD700',
        INFO: '#0099FF'
    }
};
