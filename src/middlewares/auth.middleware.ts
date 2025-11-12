//
// auth.middleware.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const jwt = require('jsonwebtoken');
const { AUTH_CONFIG, RESPONSE_MESSAGES, USER_ROLES } = require('../config/config');

const authenticateToken = async (req, res, next): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: RESPONSE_MESSAGES.ACCESS_TOKEN_REQUIRED
            });
            return;
        }

        const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({
            message: RESPONSE_MESSAGES.INVALID_TOKEN
        });
        return;
    }
};

const isAdmin = async (req, res, next): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            message: RESPONSE_MESSAGES.AUTH_REQUIRED
        });
        return;
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
        res.status(403).json({
            message: RESPONSE_MESSAGES.ADMIN_REQUIRED
        });
        return;
    }

    next();
};

const isOwnerOrAdmin = async (req, res, next): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            message: RESPONSE_MESSAGES.AUTH_REQUIRED
        });
        return;
    }

    const resourceId = req.params.id;
    const isOwner = req.user.id === resourceId;
    const isAdminRole = req.user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isAdminRole) {
        res.status(403).json({
            message: RESPONSE_MESSAGES.ACCESS_DENIED
        });
        return;
    }

    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    isOwnerOrAdmin,
};