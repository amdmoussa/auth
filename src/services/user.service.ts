//
// user.service.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const User = require('../models/user.model');
const { USER_ROLES } = require('../config/config');

interface PaginationOptions {
    skip?: number;
    limit?: number;
}

interface UserFilter {
    role?: string;
}

interface UserData {
    email: string;
    username: string;
    password: string;
    role?: string;
}

class UserService {
    /**
     * Get all users with filtering and pagination
     * @param filter - Filter object (e.g., { role: 'user' })
     * @param options - Pagination options { skip, limit }
     * @returns Array of users
     */
    async getAllUsers(
        filter: UserFilter = {},
        options: PaginationOptions = {}
    ) {
        const { skip = 0, limit } = options;

        let query = User.find(filter)
            .select('-password')
            .skip(skip);

        if (limit) {
            query = query.limit(limit);
        }

        return await query.exec();
    }

    /**
     * Get total count of users matching filter
     * @param filter - Filter object
     * @returns Total count
     */
    async getAllUsersCount(filter: UserFilter = {}): Promise<number> {
        return await User.countDocuments(filter);
    }

    /**
     * Get user by ID
     * @param id - User ID
     * @returns User object or null
     */
    async getUserById(id: string) {
        return await User.findById(id).select('-password').exec();
    }

    /**
     * Create a new user
     * @param userData - User data { email, username, password, role }
     * @returns Created user object
     */
    async createUser(userData: UserData) {
        const { email, username, password, role = USER_ROLES.USER } = userData;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        const user = new User({
            email,
            username,
            password,
            role,
            isVerified: false
        });

        await user.save();

        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }

    /**
     * Update user by ID
     * @param id - User ID
     * @param updates - Fields to update
     * @returns Updated user object or null
     */
    async updateUser(id: string, updates: Partial<UserData>) {
        const sanitizedUpdates = { ...updates };
        delete sanitizedUpdates.password;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: sanitizedUpdates },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        return user;
    }

    /**
     * Delete user by ID
     * @param id - User ID
     * @returns Deleted user object or null
     */
    async deleteUser(id: string) {
        const user = await User.findByIdAndDelete(id).select('-password');
        return user;
    }

    /**
     * Update user password
     * @param id - User ID
     * @param newPassword - New password
     * @returns Updated user object
     */
    async updatePassword(id: string, newPassword: string) {
        const user = await User.findById(id);

        if (!user) {
            throw new Error('User not found');
        }

        user.password = newPassword;
        await user.save();

        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }

    /**
     * Verify user credentials
     * @param email - User email
     * @param password - User password
     * @returns User object if credentials are valid, null otherwise
     */
    async verifyCredentials(email: string, password: string) {
        const user = await User.findOne({ email });

        if (!user) {
            return null;
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return null;
        }

        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
}

module.exports = new UserService();