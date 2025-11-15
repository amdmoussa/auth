//
// login.validation.ts
// 
// Created by Ahmed Moussa, 15/11/2025
//

const {
    RESPONSE_MESSAGES,
    RESPONSE_STATUS,
    HTTP_STATUS
} = require('../config/config');

const validateBody = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.VALIDATION_FAILED,
            error: {
                details: RESPONSE_MESSAGES.EMAIL_PASSWORD_REQUIRED
            }
        });
    }

    next();
}

module.exports = { validateBody };
