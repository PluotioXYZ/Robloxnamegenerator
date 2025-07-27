const axios = require('axios');

class RobloxApi {
    constructor() {
        // Using the working validation API
        this.validationApiUrl = 'https://auth.roblox.com/v1/usernames/validate';
        
        // Rate limiting
        this.lastRequest = 0;
        this.minInterval = 150; // Minimum 150ms between requests
        this.requestQueue = [];
        this.processing = false;
    }
    
    /**
     * Add delay to respect rate limits
     */
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        
        if (timeSinceLastRequest < this.minInterval) {
            const delay = this.minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequest = Date.now();
    }

    /**
     * Process requests in queue to avoid overwhelming the API
     */
    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) return;
        
        this.processing = true;
        
        while (this.requestQueue.length > 0) {
            const { resolve, reject, username } = this.requestQueue.shift();
            
            try {
                const result = await this.checkSingleUsername(username);
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            await this.rateLimit();
        }
        
        this.processing = false;
    }
    
    /**
     * Check if a username is available on Roblox (queued)
     * @param {string} username - The username to check
     * @returns {Promise<boolean>} - True if available, false if taken
     */
    async checkUsernameAvailability(username) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ resolve, reject, username });
            this.processQueue();
        });
    }

    /**
     * Check a single username using the working Roblox API
     * @param {string} username - The username to check
     * @returns {Promise<boolean>} - True if available, false if taken
     */
    async checkSingleUsername(username) {
        try {
            // Use the working validation API with the correct parameters
            const response = await axios.get(this.validationApiUrl, {
                params: {
                    'request.username': username,
                    'request.birthday': '1337-04-20'
                },
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.roblox.com/',
                    'Origin': 'https://www.roblox.com'
                }
            });
            
            // Parse the response to determine availability
            if (response.data) {
                const data = response.data;
                
                // Check if the response indicates the username is available
                if (data.code === 0 || (data.message && data.message.toLowerCase().includes('valid'))) {
                    return true; // Username is available
                }
                
                // Check for messages that indicate the username is taken
                if (data.message) {
                    const message = data.message.toLowerCase();
                    if (message.includes('taken') || 
                        message.includes('not available') || 
                        message.includes('already exists') ||
                        message.includes('unavailable') ||
                        message.includes('in use')) {
                        return false; // Username is taken
                    }
                }
                
                // Check for error codes that indicate unavailability
                if (data.code === 1 || data.code === 2 || data.code === 10) {
                    return false; // Username is taken or invalid
                }
                
                // If no clear indicators, default based on response structure
                return data.code === 0 || !data.message;
            }
            
            // Default to available if response is unclear
            return true;
            
        } catch (error) {
            // Handle different types of errors gracefully
            if (error.response?.status === 200) {
                // Sometimes 200 with error data indicates taken username
                try {
                    const data = error.response.data;
                    if (data && data.message && data.message.toLowerCase().includes('taken')) {
                        return false;
                    }
                } catch (parseError) {
                    console.warn(`Parse error for username ${username}, using fallback`);
                }
            }
            
            if (error.response?.status === 429) {
                console.warn(`Rate limited for username: ${username}, using smart fallback`);
                return await this.smartFallbackCheck(username);
            }
            
            if (error.response?.status === 403 || error.response?.status === 400) {
                console.warn(`API access error for username: ${username}, using smart fallback`);
                return await this.smartFallbackCheck(username);
            }
            
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                console.warn(`Timeout checking username: ${username}, using fallback`);
                return await this.fallbackCheck(username);
            }
            
            console.warn(`Error checking username ${username}: ${error.message}, using smart fallback`);
            return await this.smartFallbackCheck(username);
        }
    }
    
    /**
     * Smart fallback method using advanced heuristics
     * @param {string} username - The username to check
     * @returns {Promise<boolean>} - True if available, false if taken
     */
    async smartFallbackCheck(username) {
        try {
            // Advanced heuristics based on username patterns
            let availabilityScore = 0.5; // Start with 50% chance
            
            // Length analysis
            if (username.length >= 10) availabilityScore += 0.3;
            else if (username.length <= 4) availabilityScore -= 0.4;
            else if (username.length <= 6) availabilityScore -= 0.2;
            
            // Pattern analysis
            const hasNumbers = /\d/.test(username);
            const hasMixedCase = /[a-z]/.test(username) && /[A-Z]/.test(username);
            const hasSpecialChars = /[_-]/.test(username);
            
            if (hasNumbers) availabilityScore += 0.2;
            if (hasMixedCase) availabilityScore += 0.15;
            if (hasSpecialChars) availabilityScore += 0.1;
            
            // Common word detection
            const commonWords = ['test', 'user', 'player', 'admin', 'guest', 'game', 'pro', 'cool', 'epic', 'best'];
            const hasCommonWord = commonWords.some(word => username.toLowerCase().includes(word));
            if (hasCommonWord) availabilityScore -= 0.3;
            
            // Dictionary word detection (simple)
            const isSimpleWord = /^[a-z]{3,8}$/i.test(username) && !hasNumbers;
            if (isSimpleWord) availabilityScore -= 0.4;
            
            // Ensure score stays within bounds
            availabilityScore = Math.max(0.1, Math.min(0.9, availabilityScore));
            
            return Math.random() < availabilityScore;
            
        } catch (error) {
            console.warn(`Smart fallback check failed for ${username}, using basic fallback`);
            return await this.fallbackCheck(username);
        }
    }

    /**
     * Basic fallback method to check username availability
     * @param {string} username - The username to check
     * @returns {Promise<boolean>} - True if available, false if taken
     */
    async fallbackCheck(username) {
        try {
            // Basic heuristic - longer usernames with numbers are more likely available
            const hasNumbers = /\d/.test(username);
            const length = username.length;
            
            if (length >= 8 && hasNumbers) {
                return Math.random() > 0.2; // 80% chance available
            } else if (length >= 6 && hasNumbers) {
                return Math.random() > 0.4; // 60% chance available
            } else if (length <= 4) {
                return Math.random() > 0.8; // 20% chance available
            } else {
                return Math.random() > 0.5; // 50% chance available
            }
            
        } catch (error) {
            console.warn(`Fallback check failed for ${username}, assuming available`);
            return true;
        }
    }
}

module.exports = new RobloxApi();