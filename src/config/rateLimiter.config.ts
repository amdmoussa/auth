//
// rateLimiter.config.ts
// 
// Created by Ahmed Moussa, 15/11/2025
//

const rateLimit = require('express-rate-limit');

const windowMsLimiter = {
    short: 15 * 60 * 1000, // 15 minutes window
    long: 60 * 60 * 1000 // 1 hour window
}

const generalLimiter = rateLimit({
    windowMs: windowMsLimiter.short,
    max: 100,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: windowMsLimiter.short,
    max: 5,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

const loginLimiter = rateLimit({
    windowMs: windowMsLimiter.short,
    max: 10,
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
    windowMs: windowMsLimiter.long,
    max: 3,
    message: {
        status: 'error',
        message: 'Too many password reset attempts, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const emailVerificationLimiter = rateLimit({
    windowMs: windowMsLimiter.long,
    max: 3,
    message: {
        status: 'error',
        message: 'Too many verification attempts, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    loginLimiter,
    passwordResetLimiter,
    emailVerificationLimiter
};