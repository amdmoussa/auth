//
// user.controller.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const userService = require('../services/user.service');
const { USER_ROLES, RESPONSE_MESSAGES, RESPONSE_STATUS, HTTP_STATUS, PAGINATION } = require('../config/config');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = limit > 0 ? (page - 1) * limit : 0;
        const requestingUserRole = req.user.role;

        let filter = {
            role: ""
        };
        if ('role' in req.query) {
            if (req.query.role === USER_ROLES.USER) filter.role = USER_ROLES.USER;
            else if (req.query.role === USER_ROLES.ADMIN) filter.role = USER_ROLES.ADMIN;
        }

        const [users, total] = await Promise.all([
            userService.getAllUsers(filter, {
                skip,
                limit: limit > 0 ? limit : undefined
            }, requestingUserRole),
            userService.getAllUsersCount(filter, requestingUserRole)
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: limit > 0 ? Math.ceil(total / limit) : 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve users',
            error: {
                details: error.message
            }
        });
    }
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve user',
            error: {
                details: error.message
            }
        });
    }
}

const createAdmin = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                error: {
                    details: 'Email, username, and password are required'
                }
            });
        }

        // Create admin user
        const admin = await userService.createUser({
            email,
            username,
            password,
            role: USER_ROLES.ADMIN
        });

        res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
            data: { admin }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create admin',
            error: {
                details: error.message
            }
        });
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const updates = req.body;

        // Prevent role escalation unless admin
        if (updates.role && req.user.role !== USER_ROLES.ADMIN) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden',
                error: {
                    details: 'Only admins can change user roles'
                }
            });
        }

        delete updates.password;

        const updatedUser = await userService.updateUser(id, updates);

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user',
            error: {
                details: error.message
            }
        });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent users from deleting themselves
        if (req.user.id === id && req.user.role !== USER_ROLES.ADMIN) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden',
                error: {
                    details: 'You cannot delete your own account'
                }
            });
        }

        const deletedUser = await userService.deleteUser(id);

        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
            data: { user: deletedUser }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user',
            error: {
                details: error.message
            }
        });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createAdmin,
    updateUser,
    deleteUser
};