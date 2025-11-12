//
// token.model.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    type: 'refresh' | 'verification' | 'passwordReset';
    expiresAt: Date;
    createdAt: Date;
}

const tokenSchema = new Schema<IToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['refresh', 'verification', 'passwordReset'],
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Automatic cleanup of expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model<IToken>('Token', tokenSchema);

module.exports = Token;