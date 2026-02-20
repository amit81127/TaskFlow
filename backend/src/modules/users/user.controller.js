const userService = require('./user.service');
const { sendSuccess } = require('../../utils/response');

/**
 * Get all users' progress (Admin only)
 */
const getAllUsersProgress = async (req, res, next) => {
  try {
    const progress = await userService.getUsersProgress();
    return sendSuccess(res, {
      message: 'All users progress fetched successfully',
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all users list
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { users, total, page, limit } = await userService.getAllUsers(req.query);
    return sendSuccess(res, {
      message: 'Users fetched successfully',
      data: { users, total, page, limit },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsersProgress,
  getAllUsers,
};
