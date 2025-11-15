//
// signup.validation.ts
// 
// Created by Ahmed Moussa, 15/11/2025
//

const {
    RESPONSE_MESSAGES,
    RESPONSE_STATUS,
    VALIDATION,
    HTTP_STATUS
} = require('../config/config');

const validateBody = (req, res, next) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.VALIDATION_FAILED,
            error: {
                details: RESPONSE_MESSAGES.EMAIL_USERNAME_PASSWORD_REQUIRED
            }
        });
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.VALIDATION_FAILED,
            error: {
                details: RESPONSE_MESSAGES.PASSWORD_MIN_LENGTH
            }
        });
    }

    next();
}

module.exports = { validateBody };