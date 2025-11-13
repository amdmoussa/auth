//
// user.controller.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const userService = require('../services/user.service');
const {
    USER_ROLES,
    RESPONSE_MESSAGES,
    RESPONSE_STATUS,
    HTTP_STATUS
} = require('../config/config');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = limit > 0 ? (page - 1) * limit : 0;

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
            }),
            userService.getAllUsersCount(filter)
        ]);

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.USERS_RETRIEVED,
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.FAILED_RETRIEVE_USERS,
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
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.USER_RETRIEVED,
            data: { user }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.FAILED_RETRIEVE_USER,
            error: {
                details: error.message
            }
        });
    }
}

const createAdmin = async (req, res) => {
    try {
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

        const admin = await userService.createUser({
            email,
            username,
            password,
            role: USER_ROLES.ADMIN
        });

        res.status(HTTP_STATUS.CREATED).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.USER_CREATED,
            data: { admin }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.SIGNUP_FAILED,
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

        // Role change restrictions - only super admin can change roles
        if (updates.role) {
            // Super admin cannot demote themselves
            if (req.user.id === id && updates.role !== USER_ROLES.SUPER_ADMIN) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    status: RESPONSE_STATUS.ERROR,
                    message: RESPONSE_MESSAGES.ACCESS_DENIED,
                    error: {
                        details: 'Super admin cannot change their own role'
                    }
                });
            }
        }

        delete updates.password;

        const updatedUser = await userService.updateUser(id, updates);

        if (!updatedUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.USER_UPDATED,
            data: { user: updatedUser }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.SIGNUP_FAILED,
            error: {
                details: error.message
            }
        });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if target user is super admin - cannot be deleted by anyone
        const targetUser = await userService.getUserById(id);
        if (!targetUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        if (targetUser.role === USER_ROLES.SUPER_ADMIN) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.ACCESS_DENIED,
                error: {
                    details: RESPONSE_MESSAGES.CANNOT_DELETE_SUPERADMIN
                }
            });
        }

        // Allow deletion of own account or admin/superadmin deleting others
        const isOwnAccount = req.user.id === id;

        // Only owner or admin can delete a user
        if (!isOwnAccount && req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPER_ADMIN) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.ACCESS_DENIED,
                error: {
                    details: 'You can only delete your own account'
                }
            });
        }

        const deletedUser = await userService.deleteUser(id);

        if (!deletedUser) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_STATUS.ERROR,
                message: RESPONSE_MESSAGES.USER_NOT_FOUND,
                error: {
                    details: `No user found with id: ${id}`
                }
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            message: RESPONSE_MESSAGES.USER_DELETED,
            data: { user: deletedUser }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_STATUS.ERROR,
            message: RESPONSE_MESSAGES.SIGNUP_FAILED,
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