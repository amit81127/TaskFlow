const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { restrictTo } = require('../../middleware/role.middleware');
const { getAllUsersProgress } = require('./admin.controller');

/**
 * @route   GET /api/v1/admin/progress
 * @desc    Get progress details for all users
 * @access  Private/Admin
 */
router.get(
  '/progress',
  protect,
  restrictTo('admin'),
  getAllUsersProgress
);

module.exports = router;
