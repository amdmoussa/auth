//
// email.service.ts
// 
// Created by Ahmed Moussa, 15/11/2025
//

const transporter = require('../config/email.config');
const {
    ACCOUNT_CREATION_TEMPLATE,
    PASSWORD_RESET_TEMPLATE
} = require('../config/email.templates');

const sendVerificationEmail = async (
    email: string,
    username: string,
    token: string
) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        const htmlContent = ACCOUNT_CREATION_TEMPLATE
            .replace(/{{USERNAME}}/g, username)
            .replace(/{{VALIDATION_LINK}}/g, verificationLink);

        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: htmlContent
        });

        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
};

const sendPasswordResetEmail = async (
    email: string,
    username: string,
    token: string
) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const htmlContent = PASSWORD_RESET_TEMPLATE
            .replace(/{{USERNAME}}/g, username)
            .replace(/{{EMAIL}}/g, email)
            .replace(/{{RESET_LINK}}/g, resetLink);

        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your Password',
            html: htmlContent
        });

        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};