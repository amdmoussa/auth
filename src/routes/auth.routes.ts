//
// auth.routes.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');

// post - login (public)
router.post('/login', authController.login);

// post - signup (public)
router.post('/signup', authController.signup);

// post - logout (requires valid token)
router.post('/logout', authController.logout);

// post - refresh access token (requires valid refresh token)
router.post('/refresh', authController.refresh);

// post - revoke refresh token (requires valid refresh token)
router.post('/revoke', authController.revoke);

module.exports = router;