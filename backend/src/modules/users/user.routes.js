const { Router } = require('express');
const userController = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');
const { restrictTo } = require('../../middleware/role.middleware');

const router = Router();

// All user routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/users/admin/progress:
 *   get:
 *     summary: View progress of all users (Admin only)
 *     tags: [Admin]
 */
router.get(
  '/admin/progress',
  restrictTo('admin'),
  userController.getAllUsersProgress
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Admin]
 */
router.get('/', restrictTo('admin'), userController.getAllUsers);

module.exports = router;
