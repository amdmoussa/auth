//
// auth.controller.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const jwt = require('jsonwebtoken');

const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');

const {
    AUTH_CONFIG,
    RESPONSE_MESSAGES,
    RESPONSE_STATUS,
    USER_ROLES,
    HTTP_STATUS
} = require('../config/config');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userService.verifyCredentials(email, password);

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
                error: {
                    details: RESPONSE_MESSAGES.INVALID_CREDENTIALS
                }
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            AUTH_CONFIG.JWT_SECRET,
            { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = await authService.generateRefreshToken(user._id);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.LOGIN_FAILED,
            error: {
                details: error.message
            }
        });
    }
};

const signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const user = await userService.createUser({
            email,
            username,
            password,
            role: USER_ROLES.USER
        });

        const verificationToken = await authService.generateVerificationToken(user._id);

        await emailService.sendVerificationEmail(
            user.email,
            user.username,
            verificationToken
        );

        res.status(HTTP_STATUS.CREATED).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.SIGNUP_FAILED,
            error: {
                details: error.message
            }
        });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        await authService.revokeRefreshToken(refreshToken);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.LOGOUT_SUCCESS
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.LOGOUT_FAILED,
            error: {
                details: error.message
            }
        });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        const tokenData = await authService.verifyRefreshToken(refreshToken);

        if (!tokenData) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.INVALID_TOKEN,
                error: {
                    details: RESPONSE_MESSAGES.INVALID_TOKEN
                }
            });
        }

        const user = await userService.getUserById(tokenData.userId);

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                error: {
                    details: RESPONSE_MESSAGES.USER_ASSOCIATED_TOKEN_NOT_FOUND
                }
            });
        }

        const newAccessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            AUTH_CONFIG.JWT_SECRET,
            { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
        );

        const newRefreshToken = await authService.generateRefreshToken(user._id);

        await authService.revokeRefreshToken(refreshToken);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.TOKEN_REFRESH_SUCCESS,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.TOKEN_REFRESH_FAILED,
            error: {
                details: error.message
            }
        });
    }
};

const revoke = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        await authService.revokeRefreshToken(refreshToken);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.TOKEN_REVOKE_SUCCESS
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.TOKEN_REVOKE_FAILED,
            error: {
                details: error.message
            }
        });
    }
};

const revokeAll = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: 'Access token is required'
                }
            });
        }

        const decoded = jwt.verify(accessToken, AUTH_CONFIG.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: 'Invalid access token'
                }
            });
        }

        const revokedCount = await authService.revokeAllUserTokens(userId);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: `${revokedCount} refresh token(s) revoked successfully`,
            data: {
                revokedCount
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: 'Failed to revoke all tokens',
            error: {
                details: error.message
            }
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const userId = await authService.verifyVerificationToken(token);

        if (!userId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_STATUS.ERROR,
                message: 'Invalid or expired verification token'
            });
        }

        const user = await userService.updateUser(userId, { isVerified: true });
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: 'User not found'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: 'Email verified successfully',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: 'Email verification failed',
            error: {
                details: error.message
            }
        });
    }
};

module.exports = {
    login,
    signup,
    logout,
    refresh,
    revoke,
    revokeAll,
    verifyEmail
};