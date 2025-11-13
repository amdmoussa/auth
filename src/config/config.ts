//
// config.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

require('dotenv').config();

// ===================================
// ENVIRONMENT & VALIDATION
// ===================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

// Validate required environment variables
if (!DB_URI) {
    throw new Error('Missing required environment variable: DB_URI');
}

if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
}

// ===================================
// JWT & AUTHENTICATION CONFIG
// ===================================

export const AUTH_CONFIG = {
    // JWT Secret key
    JWT_SECRET: process.env.JWT_SECRET,
    
    // Access token expiry time (short-lived)
    // Use format: "15m", "1h", "7d", etc. (passed to jsonwebtoken)
    ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRES_IN || '15m',
    
    // Refresh token expiry time (long-lived)
    // Used to calculate expiration date for refresh tokens stored in DB
    REFRESH_TOKEN_EXPIRY_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7'),
    
    // Email verification token expiry time (in hours)
    VERIFICATION_TOKEN_EXPIRY_HOURS: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || '24'),
    
    // Password reset token expiry time (in hours)
    PASSWORD_RESET_TOKEN_EXPIRY_HOURS: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_HOURS || '1'),
};

// ===================================
// TOKEN TYPES
// ===================================

export const TOKEN_TYPES = {
    REFRESH: 'refresh',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'passwordReset',
} as const;

// ===================================
// USER ROLES
// ===================================

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superadmin',
} as const;

// ===================================
// HTTP STATUS CODES
// ===================================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// ===================================
// RESPONSE MESSAGES
// ===================================

export const RESPONSE_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

export const RESPONSE_MESSAGES = {
    // Auth messages
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Login failed',
    SIGNUP_SUCCESS: 'User created successfully',
    SIGNUP_FAILED: 'Signup failed',
    LOGOUT_SUCCESS: 'Logout successful',
    LOGOUT_FAILED: 'Logout failed',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    TOKEN_REFRESH_FAILED: 'Token refresh failed',
    TOKEN_REVOKE_SUCCESS: 'Token revoked successfully',
    TOKEN_REVOKE_FAILED: 'Token revocation failed',
    
    // Authentication errors
    AUTH_REQUIRED: 'Authentication required',
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_TOKEN: 'Invalid or expired token',
    ACCESS_TOKEN_REQUIRED: 'Access token required',
    REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
    
    // User messages
    USER_NOT_FOUND: 'User not found',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    USER_RETRIEVED: 'User retrieved successfully',
    USERS_RETRIEVED: 'Users retrieved successfully',
    FAILED_RETRIEVE_USER: 'Failed to retrieve user',
    FAILED_RETRIEVE_USERS: 'Failed to retrieve users',
    
    // Validation errors
    VALIDATION_FAILED: 'Validation failed',
    EMAIL_PASSWORD_REQUIRED: 'Email and password are required',
    EMAIL_USERNAME_PASSWORD_REQUIRED: 'Email, username, and password are required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
    USER_ALREADY_EXISTS: 'User with this email or username already exists',
    
    // Authorization errors
    ADMIN_REQUIRED: 'Admin access required',
    SUPERADMIN_REQUIRED: 'Super admin access required',
    ACCESS_DENIED: 'Access denied',
    ONLY_ADMIN_CAN_CHANGE_ROLES: 'Only admins can change user roles',
    ONLY_SUPERADMIN_CAN_MANAGE_ADMINS: 'Only super admins can create, modify, or delete admin accounts',
    
    // Database errors
    DB_CONNECTION_FAILED: 'DB connection failed. Some features may not work as expected.',
    DB_ERROR: 'Database error',
    
    // Token errors
    USER_ASSOCIATED_TOKEN_NOT_FOUND: 'Associated user account not found',
} as const;

// ===================================
// VALIDATION CONSTRAINTS
// ===================================

export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
    TOKEN_LENGTH: {
        REFRESH: 48, // bytes -> base64
        VERIFICATION: 32, // bytes -> hex
        PASSWORD_RESET: 32, // bytes -> hex
    },
} as const;

// ===================================
// PAGINATION
// ===================================

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// ===================================
// DATABASE CONFIG
// ===================================

export const DATABASE_CONFIG = {
    URI: DB_URI,
    OPTIONS: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
} as const;

// ===================================
// SERVER CONFIG
// ===================================

export const SERVER_CONFIG = {
    NODE_ENV,
    PORT,
    IS_PRODUCTION: NODE_ENV === 'production',
    IS_DEVELOPMENT: NODE_ENV === 'development',
} as const;

// ===================================
// SECURITY CONFIG
// ===================================

export const SECURITY_CONFIG = {
    BCRYPT_ROUNDS: 10,
} as const;

// ===================================
// CORS CONFIG
// ===================================

export const CORS_CONFIG = {
    ALLOWED_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
} as const;

// Default export
export default {
    AUTH_CONFIG,
    TOKEN_TYPES,
    USER_ROLES,
    HTTP_STATUS,
    RESPONSE_STATUS,
    RESPONSE_MESSAGES,
    VALIDATION,
    PAGINATION,
    DATABASE_CONFIG,
    SERVER_CONFIG,
    SECURITY_CONFIG,
    CORS_CONFIG,
};
