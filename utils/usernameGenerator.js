class UsernameGenerator {
    constructor() {
        // Character sets for generation
        this.letters = 'abcdefghijklmnopqrstuvwxyz';
        this.numbers = '0123456789';
        this.vowels = 'aeiou';
        this.consonants = 'bcdfghjklmnpqrstvwxyz';
        
        // Gaming-themed word parts
        this.gamingPrefixes = [
            'Pro', 'Epic', 'Shadow', 'Dark', 'Fire', 'Ice', 'Storm', 'Thunder',
            'Dragon', 'Wolf', 'Fox', 'Cyber', 'Ninja', 'Ghost', 'Blade', 'Steel',
            'Rapid', 'Swift', 'Mystic', 'Neon', 'Quantum', 'Alpha', 'Beta', 'Omega'
        ];
        
        this.gamingSuffixes = [
            'X', 'Pro', 'Gaming', 'YT', 'TTV', 'God', 'Lord', 'King', 'Master',
            'Slayer', 'Hunter', 'Warrior', 'Legend', 'Hero', 'Champion', 'Elite',
            'Prime', 'Ultra', 'Max', 'Zone', 'Core', 'Edge', 'Fury', 'Rage'
        ];
        
        // Cool/aesthetic word parts
        this.coolPrefixes = [
            'Aesthetic', 'Vibe', 'Moon', 'Star', 'Sky', 'Ocean', 'Dream', 'Cosmic',
            'Aurora', 'Crystal', 'Pearl', 'Gold', 'Silver', 'Rose', 'Sage', 'Mint',
            'Velvet', 'Silk', 'Marble', 'Ivory', 'Honey', 'Sunset', 'Dawn', 'Twilight'
        ];
        
        this.coolSuffixes = [
            'Vibes', 'Dreams', 'Glow', 'Shine', 'Flow', 'Wave', 'Mist', 'Frost',
            'Bloom', 'Bliss', 'Grace', 'Soul', 'Heart', 'Mind', 'Spirit', 'Aura',
            'Energy', 'Magic', 'Wonder', 'Beauty', 'Charm', 'Style', 'Mode', 'Feel'
        ];
    }
    
    /**
     * Generate a random character from a given set
     */
    randomChar(charset) {
        return charset[Math.floor(Math.random() * charset.length)];
    }
    
    /**
     * Generate a random number between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Capitalize first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    /**
     * Generate a 5-character username with better uniqueness
     */
    generate5Char() {
        const strategies = [
            // Letters with strategic numbers for uniqueness
            () => {
                let username = '';
                for (let i = 0; i < 3; i++) {
                    username += this.randomChar(this.letters);
                }
                for (let i = 0; i < 2; i++) {
                    username += this.randomChar(this.numbers);
                }
                return username;
            },
            
            // Consonant-vowel-consonant-number-number for pronounceability
            () => {
                return this.randomChar(this.consonants) + 
                       this.randomChar(this.vowels) + 
                       this.randomChar(this.consonants) + 
                       this.randomChar(this.numbers) + 
                       this.randomChar(this.numbers);
            },
            
            // Mixed case with numbers
            () => {
                let username = this.randomChar(this.letters).toUpperCase();
                username += this.randomChar(this.letters);
                username += this.randomChar(this.letters);
                username += this.randomChar(this.numbers);
                username += this.randomChar(this.numbers);
                return username;
            },
            
            // Random mix favoring letters
            () => {
                let username = '';
                for (let i = 0; i < 5; i++) {
                    if (Math.random() < 0.6) { // 60% chance for letter
                        username += this.randomChar(this.letters);
                    } else {
                        username += this.randomChar(this.numbers);
                    }
                }
                return username;
            }
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }
    
    /**
     * Generate a random length username (3-12 characters)
     */
    generateRandom() {
        const length = this.randomInt(3, 12);
        const strategies = [
            // Random letters and numbers
            () => {
                let username = '';
                for (let i = 0; i < length; i++) {
                    if (Math.random() < 0.8) {
                        username += this.randomChar(this.letters);
                    } else {
                        username += this.randomChar(this.numbers);
                    }
                }
                return username;
            },
            
            // Alternating consonants and vowels
            () => {
                let username = '';
                for (let i = 0; i < length; i++) {
                    if (i % 2 === 0) {
                        username += this.randomChar(this.consonants);
                    } else {
                        username += this.randomChar(this.vowels);
                    }
                }
                return username;
            },
            
            // Mixed case with numbers
            () => {
                let username = '';
                for (let i = 0; i < length; i++) {
                    if (Math.random() < 0.1) {
                        username += this.randomChar(this.numbers);
                    } else {
                        const char = this.randomChar(this.letters);
                        username += Math.random() < 0.3 ? char.toUpperCase() : char;
                    }
                }
                return username;
            }
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }
    
    /**
     * Generate a gaming-themed username with better uniqueness
     */
    generateGaming() {
        const strategies = [
            // Prefix + Random Numbers (3-4 digits for uniqueness)
            () => {
                const prefix = this.gamingPrefixes[Math.floor(Math.random() * this.gamingPrefixes.length)];
                const numbers = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
                return prefix + numbers;
            },
            
            // Word + Random Letters + Numbers
            () => {
                const word = this.gamingPrefixes[Math.floor(Math.random() * this.gamingPrefixes.length)];
                const letter = this.randomChar(this.letters).toUpperCase();
                const numbers = Math.floor(Math.random() * 99) + 10; // 10-99
                return word + letter + numbers;
            },
            
            // Two words with separator
            () => {
                const word1 = this.gamingPrefixes[Math.floor(Math.random() * this.gamingPrefixes.length)];
                const word2 = this.gamingSuffixes[Math.floor(Math.random() * this.gamingSuffixes.length)];
                const separators = ['X', '_', ''];
                const sep = separators[Math.floor(Math.random() * separators.length)];
                return word1 + sep + word2;
            },
            
            // Prefix + Suffix + Numbers
            () => {
                const prefix = this.gamingPrefixes[Math.floor(Math.random() * this.gamingPrefixes.length)];
                const suffix = this.gamingSuffixes[Math.floor(Math.random() * this.gamingSuffixes.length)];
                const numbers = Math.floor(Math.random() * 999) + 100; // 100-999
                return prefix + suffix + numbers;
            }
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }
    
    /**
     * Generate a cool/aesthetic username
     */
    generateCool() {
        const strategies = [
            // Prefix + Suffix
            () => {
                const prefix = this.coolPrefixes[Math.floor(Math.random() * this.coolPrefixes.length)];
                const suffix = this.coolSuffixes[Math.floor(Math.random() * this.coolSuffixes.length)];
                return prefix + suffix;
            },
            
            // Single word with numbers
            () => {
                const word = this.coolPrefixes[Math.floor(Math.random() * this.coolPrefixes.length)];
                const numbers = Math.floor(Math.random() * 999) + 1;
                return word + numbers;
            },
            
            // Lowercase aesthetic
            () => {
                const word1 = this.coolPrefixes[Math.floor(Math.random() * this.coolPrefixes.length)];
                const word2 = this.coolSuffixes[Math.floor(Math.random() * this.coolSuffixes.length)];
                return (word1 + word2).toLowerCase();
            },
            
            // With underscores
            () => {
                const word1 = this.coolPrefixes[Math.floor(Math.random() * this.coolPrefixes.length)];
                const word2 = this.coolSuffixes[Math.floor(Math.random() * this.coolSuffixes.length)];
                return word1.toLowerCase() + '_' + word2.toLowerCase();
            }
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }
    
    /**
     * Generate a mixed letters and numbers username
     */
    generateMixed() {
        const length = this.randomInt(4, 10);
        const strategies = [
            // Letters followed by numbers
            () => {
                const letterCount = Math.ceil(length * 0.6);
                const numberCount = length - letterCount;
                
                let username = '';
                for (let i = 0; i < letterCount; i++) {
                    username += this.randomChar(this.letters);
                }
                for (let i = 0; i < numberCount; i++) {
                    username += this.randomChar(this.numbers);
                }
                return username;
            },
            
            // Alternating letters and numbers
            () => {
                let username = '';
                for (let i = 0; i < length; i++) {
                    if (i % 2 === 0) {
                        username += this.randomChar(this.letters);
                    } else {
                        username += this.randomChar(this.numbers);
                    }
                }
                return username;
            },
            
            // Random mix with higher letter probability
            () => {
                let username = '';
                for (let i = 0; i < length; i++) {
                    if (Math.random() < 0.65) {
                        username += this.randomChar(this.letters);
                    } else {
                        username += this.randomChar(this.numbers);
                    }
                }
                return username;
            }
        ];
        
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }
    
    /**
     * Main generation method
     */
    generate(type) {
        let username;
        
        switch (type) {
            case '5char':
                username = this.generate5Char();
                break;
            case 'random':
                username = this.generateRandom();
                break;
            case 'gaming':
                username = this.generateGaming();
                break;
            case 'cool':
                username = this.generateCool();
                break;
            case 'mixed':
                username = this.generateMixed();
                break;
            default:
                username = this.generate5Char();
        }
        
        // Ensure username meets Roblox requirements (3-20 characters, no spaces)
        username = username.replace(/[^a-zA-Z0-9_]/g, '');
        
        if (username.length < 3) {
            username += this.randomChar(this.letters) + this.randomChar(this.letters);
        } else if (username.length > 20) {
            username = username.substring(0, 20);
        }
        
        return username;
    }
}

module.exports = new UsernameGenerator();
