# Discord Roblox Username Generator Bot

## Overview

This is a Discord bot that generates and checks the availability of Roblox usernames. The bot uses Discord.js v14 with slash commands to provide an interactive experience for users looking for available Roblox usernames. It generates different types of usernames (5-character, gaming-themed, cool/aesthetic, etc.) and checks their availability through the Roblox API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Runtime**: Node.js application
- **Framework**: Discord.js v14 for Discord bot functionality
- **Architecture Pattern**: Modular command-based structure with utility classes

### Core Components
- **Main Application** (`index.js`): Entry point that initializes the Discord client, loads commands, and registers slash commands
- **Command System**: Modular command structure located in `/commands` directory
- **Utility Classes**: Helper modules for username generation and Roblox API interaction
- **Configuration**: Centralized config file for bot settings and constants

## Key Components

### Discord Bot Client
- Uses Discord.js v14 with Gateway Intents for Guilds, Guild Messages, and Message Content
- Implements slash command registration and handling
- Collection-based command storage for dynamic command loading

### Command System
- **Generate Command** (`/commands/generate.js`): Main command for generating usernames with multiple type options
- Supports 5 different username generation types: 5-character, random length, gaming-themed, cool/aesthetic, and mixed numbers/letters
- Configurable count parameter (1-10 usernames per request)

### Username Generation Engine
- **UsernameGenerator Class** (`/utils/usernameGenerator.js`): Handles different username generation strategies
- Pre-defined word banks for gaming and aesthetic themes
- Character set management for different generation types
- Randomization algorithms for creating unique usernames

### Roblox API Integration
- **RobloxApi Class** (`/utils/robloxApi.js`): Manages communication with Roblox services
- Rate limiting implementation to respect Roblox API constraints
- Username availability checking through Roblox user search endpoints
- Error handling and timeout management

## Data Flow

1. **User Interaction**: User invokes `/generate` slash command with parameters
2. **Command Processing**: Discord bot receives and validates command parameters
3. **Username Generation**: UsernameGenerator creates usernames based on selected type
4. **Availability Check**: RobloxApi checks each generated username against Roblox database
5. **Response Formatting**: Results are formatted into Discord embeds with availability status
6. **User Response**: Bot sends formatted response back to Discord channel

## External Dependencies

### Core Dependencies
- **discord.js (v14.21.0)**: Discord API wrapper for bot functionality
- **axios (v1.11.0)**: HTTP client for Roblox API requests

### Roblox API Endpoints
- **User Search API**: `https://users.roblox.com/v1/users/search` - For checking username existence
- **Username Validation API**: `https://auth.roblox.com/v1/usernames/validate` - For validation (referenced but not fully implemented)

### Rate Limiting Strategy
- Minimum 100ms delay between API requests to respect Roblox rate limits
- Configurable delay settings in config file (500ms default)
- Request timestamp tracking to prevent API abuse

## Deployment Strategy

### Environment Configuration
- Discord bot token stored in environment variable (`DISCORD_TOKEN`)
- Fallback configuration values in config file for development
- No database requirements - stateless operation

### Scalability Considerations
- Stateless design allows for easy horizontal scaling
- Rate limiting prevents API abuse and potential IP bans
- Modular command structure supports easy feature additions

### Error Handling
- Comprehensive error messages defined in configuration
- API timeout handling (5-second timeout for requests)
- Graceful degradation when Roblox API is unavailable

### Bot Permissions Required
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History

The bot is designed to be lightweight and focused, requiring minimal setup while providing robust username generation and availability checking functionality for Discord communities interested in Roblox gaming.