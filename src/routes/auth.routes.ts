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

// login (public)
router.post('/login', loginValidation.validateBody, authController.login);

// signup (public)
router.post('/signup', signupValidation.validateBody, authController.signup);

// logout (requires valid token)
router.post('/logout', authController.logout);

// refresh access token (requires valid refresh token)
router.post('/refresh', authController.refresh);

// revoke refresh token (requires valid refresh token)
router.post('/revoke', authController.revoke);

// revoke all refresh tokens for user (requires valid access token)
router.post('/revoke-all', authController.revokeAll);

module.exports = router;