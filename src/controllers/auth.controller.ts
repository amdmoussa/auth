//
// auth.controller.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const jwt = require('jsonwebtoken');

const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { AUTH_CONFIG, RESPONSE_MESSAGES, RESPONSE_STATUS, VALIDATION, USER_ROLES } = require('../config/config');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.EMAIL_PASSWORD_REQUIRED
                }
            });
        }

        const user = await userService.verifyCredentials(email, password);

        if (!user) {
            return res.status(401).json({
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

        res.status(200).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
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

        if (!email || !username || !password) {
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.EMAIL_USERNAME_PASSWORD_REQUIRED
                }
            });
        }

        if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.PASSWORD_MIN_LENGTH
                }
            });
        }

        const user = await userService.createUser({
            email,
            username,
            password,
            role: USER_ROLES.USER
        });

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            AUTH_CONFIG.JWT_SECRET,
            { expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = await authService.generateRefreshToken(user._id);

        res.status(201).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        await authService.revokeRefreshToken(refreshToken);

        res.status(200).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.LOGOUT_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        const tokenData = await authService.verifyRefreshToken(refreshToken);

        if (!tokenData) {
            return res.status(401).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.INVALID_TOKEN,
                error: {
                    details: RESPONSE_MESSAGES.INVALID_TOKEN
                }
            });
        }

        const user = await userService.getUserById(tokenData.userId);

        if (!user) {
            return res.status(404).json({
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

        res.status(200).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.TOKEN_REFRESH_SUCCESS,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        res.status(500).json({
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
            return res.status(400).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.VALIDATION_FAILED,
                error: {
                    details: RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED
                }
            });
        }

        await authService.revokeRefreshToken(refreshToken);

        res.status(200).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.TOKEN_REVOKE_SUCCESS
        });
    } catch (error) {
        res.status(500).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.TOKEN_REVOKE_FAILED,
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
    revoke
};