//
// user.routes.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const express = require('express');

const router = express.Router();

const userController = require('../controllers/user.controller');
const {
    authenticateToken,
    isAdmin,
    isOwnerOrAdmin,
    isSuperAdmin
} = require('../middlewares/auth.middleware');

// how all users (admin only)
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// show one user (self or admin)
router.get('/:id', authenticateToken, isOwnerOrAdmin, userController.getUserById);

// create admin (superadmin only)
router.post('/admin', authenticateToken, isSuperAdmin, userController.createAdmin);

// update user (superadmin for role changes, otherwise self or admin)
router.put('/:id', authenticateToken, isSuperAdmin, userController.updateUser);

// delete user (self or admin)
router.delete('/:id', authenticateToken, isOwnerOrAdmin, userController.deleteUser);

module.exports = router;