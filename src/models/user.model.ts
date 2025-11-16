//
// user.model.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { SECURITY_CONFIG } from '../config/config';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    isVerified: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            immutable: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            immutable: true
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(SECURITY_CONFIG.BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema, 'users');

module.exports = User;