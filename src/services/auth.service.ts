//
// auth.service.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const Token = require('../models/token.model');
const crypto = require('crypto');
const { AUTH_CONFIG, TOKEN_TYPES } = require('../config/config');

interface TokenData {
    userId: string;
    token: string;
    type: string;
    expiresAt: Date;
}

class AuthService {
    /**
     * Generate a cryptographically secure refresh token
     * @param userId - User ID to associate with token
     * @returns Generated refresh token string
     */
    async generateRefreshToken(userId: string): Promise<string> {
        const tokenString = crypto.randomBytes(48).toString('base64');

        // Calculate expiration date using config
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS);

        const token = new Token({
            userId,
            token: tokenString,
            type: TOKEN_TYPES.REFRESH,
            expiresAt
        });

        await token.save();

        return tokenString;
    }

    /**
     * Verify refresh token is valid and not expired
     * @param tokenString - Token string to verify
     * @returns Token data if valid, null if invalid/expired
     */
    async verifyRefreshToken(tokenString: string): Promise<TokenData | null> {
        try {
            const token = await Token.findOne({
                token: tokenString,
                type: TOKEN_TYPES.REFRESH
            });

            if (!token) {
                return null;
            }

            const now = new Date();
            if (token.expiresAt < now) {
                await Token.findByIdAndDelete(token._id);
                return null;
            }

            return {
                userId: token.userId.toString(),
                token: token.token,
                type: token.type,
                expiresAt: token.expiresAt
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Revoke a refresh token (mark as invalid)
     * @param tokenString - Token string to revoke
     * @returns True if revoked, false if not found
     */
    async revokeRefreshToken(tokenString: string): Promise<boolean> {
        try {
            const result = await Token.findOneAndDelete({
                token: tokenString,
                type: TOKEN_TYPES.REFRESH
            });

            return result !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Revoke all refresh tokens for a user
     * Logs user out from all devices
     * @param userId - User ID
     * @returns Number of tokens revoked
     */
    async revokeAllUserTokens(userId: string): Promise<number> {
        try {
            const result = await Token.deleteMany({
                userId,
                type: TOKEN_TYPES.REFRESH
            });

            return result.deletedCount || 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Generate verification token for email verification
     * @param userId - User ID
     * @returns Generated verification token
     */
    async generateVerificationToken(userId: string): Promise<string> {
        const tokenString = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + AUTH_CONFIG.VERIFICATION_TOKEN_EXPIRY_HOURS);

        const token = new Token({
            userId,
            token: tokenString,
            type: TOKEN_TYPES.VERIFICATION,
            expiresAt
        });

        await token.save();

        return tokenString;
    }

    /**
     * Verify email verification token
     * @param tokenString - Verification token
     * @returns User ID if valid, null otherwise
     */
    async verifyVerificationToken(tokenString: string): Promise<string | null> {
        try {
            const token = await Token.findOne({
                token: tokenString,
                type: TOKEN_TYPES.VERIFICATION
            });

            if (!token) {
                return null;
            }

            const now = new Date();
            if (token.expiresAt < now) {
                await Token.findByIdAndDelete(token._id);
                return null;
            }

            // Delete token after use (one-time use)
            await Token.findByIdAndDelete(token._id);

            return token.userId.toString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate password reset token
     * @param userId - User ID
     * @returns Generated reset token
     */
    async generatePasswordResetToken(userId: string): Promise<string> {
        const tokenString = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + AUTH_CONFIG.PASSWORD_RESET_TOKEN_EXPIRY_HOURS);

        await Token.deleteMany({
            userId,
            type: TOKEN_TYPES.PASSWORD_RESET
        });

        const token = new Token({
            userId,
            token: tokenString,
            type: TOKEN_TYPES.PASSWORD_RESET,
            expiresAt
        });

        await token.save();

        return tokenString;
    }

    /**
     * Verify password reset token
     * @param tokenString - Reset token
     * @returns User ID if valid, null otherwise
     */
    async verifyPasswordResetToken(tokenString: string): Promise<string | null> {
        try {
            const token = await Token.findOne({
                token: tokenString,
                type: TOKEN_TYPES.PASSWORD_RESET
            });

            if (!token) {
                return null;
            }

            const now = new Date();
            if (token.expiresAt < now) {
                await Token.findByIdAndDelete(token._id);
                return null;
            }

            return token.userId.toString();
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete password reset token after successful password reset
     * @param tokenString - Reset token to delete
     */
    async deletePasswordResetToken(tokenString: string): Promise<void> {
        await Token.findOneAndDelete({
            token: tokenString,
            type: TOKEN_TYPES.PASSWORD_RESET
        });
    }

    /**
     * Clean up expired tokens (cron job)
     * @returns Number of tokens deleted
     */
    async cleanupExpiredTokens(): Promise<number> {
        try {
            const now = new Date();
            const result = await Token.deleteMany({
                expiresAt: { $lt: now }
            });

            return result.deletedCount || 0;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = new AuthService();