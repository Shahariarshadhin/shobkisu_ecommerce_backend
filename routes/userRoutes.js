const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
} = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin and super_admin only)
router.get('/', authorizeRoles('admin', 'super_admin'), getAllUsers);

// Get user by ID (admin and super_admin only)
router.get('/:id', authorizeRoles('admin', 'super_admin'), getUserById);

// Update user (admin and super_admin only)
router.put('/:id', authorizeRoles('admin', 'super_admin'), updateUser);

// Delete user (admin and super_admin only)
router.delete('/:id', authorizeRoles('admin', 'super_admin'), deleteUser);

// Update password (admin and super_admin only)
router.put('/:id/password', authorizeRoles('admin', 'super_admin'), updatePassword);

module.exports = router;