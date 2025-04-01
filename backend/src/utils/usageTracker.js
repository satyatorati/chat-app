import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USAGE_FILE = path.join(__dirname, '../../data/translation_usage.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize usage file if it doesn't exist
if (!fs.existsSync(USAGE_FILE)) {
    fs.writeFileSync(USAGE_FILE, JSON.stringify({
        currentMonth: new Date().toISOString().slice(0, 7),
        totalCharacters: 0
    }));
}

export const checkAndUpdateUsage = (charCount) => {
    try {
        const usageData = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Reset usage if it's a new month
        if (usageData.currentMonth !== currentMonth) {
            usageData.currentMonth = currentMonth;
            usageData.totalCharacters = 0;
        }

        // Check if we've exceeded the limit
        if (usageData.totalCharacters + charCount > 500000) {
            return {
                allowed: false,
                remaining: 500000 - usageData.totalCharacters
            };
        }

        // Update usage
        usageData.totalCharacters += charCount;
        fs.writeFileSync(USAGE_FILE, JSON.stringify(usageData, null, 2));

        return {
            allowed: true,
            remaining: 500000 - usageData.totalCharacters
        };
    } catch (error) {
        console.error('Error tracking usage:', error);
        throw new Error('Failed to track API usage');
    }
}; 