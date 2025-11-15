//
// auth.routes.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');
const loginValidation = require('../validations/login.validation');
const signupValidation = require('../validations/signup.validation');

const { 
    authLimiter, 
    loginLimiter, 
    passwordResetLimiter,
    emailVerificationLimiter 
} = require('../config/rateLimiter.config');

// login (public)
router.post('/login', loginLimiter, loginValidation.validateBody, authController.login);

// signup (public)
router.post('/signup', authLimiter, signupValidation.validateBody, authController.signup);

// logout (requires valid token)
router.post('/logout', authController.logout);

// refresh access token (requires valid refresh token)
router.post('/refresh', authController.refresh);

// revoke refresh token (requires valid refresh token)
router.post('/revoke', authController.revoke);

// revoke all refresh tokens for user (requires valid access token)
router.post('/revoke-all', authController.revokeAll);

// verify email (public)
router.get('/verify-email/:token', emailVerificationLimiter, authController.verifyEmail);

// forgot password (public)
router.post('/forgot-password', passwordResetLimiter, authController.requestForgotPassword);

// reset password
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

module.exports = router;