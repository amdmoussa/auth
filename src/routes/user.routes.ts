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
    isOwnerOrAdmin
} = require('../middlewares/auth.middleware');

// how all users (admin only)
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// show one user (self or admin)
router.get('/:id', authenticateToken, isOwnerOrAdmin, userController.getUserById);

// create admin (admin only)
router.post('/admin', authenticateToken, isAdmin, userController.createAdmin);

// update user (self or admin)
router.put('/:id', authenticateToken, isOwnerOrAdmin, userController.updateUser);

// delete user (self or admin)
router.delete('/:id', authenticateToken, isOwnerOrAdmin, userController.deleteUser);

module.exports = router;