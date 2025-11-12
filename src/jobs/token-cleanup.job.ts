//
// token-cleanup.job.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const cron = require('node-cron');
const Token = require('../models/token.model');

export const startTokenCleanupJob = () => {
    // Run every hour (0 * * * *)
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const result = await Token.deleteMany({
                expiresAt: { $lt: now }
            });

            console.log(`[Token Cleanup Job] Deleted ${result.deletedCount} expired tokens at ${now.toISOString()}`);
        } catch (error) {
            console.error('[Token Cleanup Job] Error deleting expired tokens:', error.message);
        }
    });

    console.log('[Token Cleanup Job] Started - runs every hour');
};

export const deleteUserExpiredTokens = async (userId: string) => {
    try {
        const now = new Date();
        const result = await Token.deleteMany({
            userId,
            expiresAt: { $lt: now }
        });

        return result.deletedCount;
    } catch (error) {
        console.error('Error deleting user expired tokens:', error.message);
        return 0;
    }
};

module.exports = {
    startTokenCleanupJob,
    deleteUserExpiredTokens
};
