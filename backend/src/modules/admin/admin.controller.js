const User = require('../users/user.model');
const Task = require('../tasks/task.model');
const { sendSuccess } = require('../../utils/response');

/**
 * @desc    Get progress for all users
 * @route   GET /api/v1/admin/progress
 * @access  Private/Admin
 */
exports.getAllUsersProgress = async (req, res, next) => {
  try {
    // 1. Fetch all users
    const users = await User.find().select('name email');

    // 2. Calculate progress for each user
    const data = await Promise.all(
      users.map(async (user) => {
        const [total, completed] = await Promise.all([
          Task.countDocuments({ owner: user._id }),
          Task.countDocuments({ owner: user._id, status: 'done' })
        ]);

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          progress: total === 0 ? 0 : Math.round((completed / total) * 100),
          totalTasks: total,
          completedTasks: completed
        };
      })
    );

    return sendSuccess(res, {
      message: 'All users progress fetched successfully',
      data: { 
        count: data.length,
        progress: data 
      }
    });
  } catch (error) {
    console.error(`[ADMIN_PROGRESS_ERROR]: ${error.message}`, error);
    next(error);
  }
};
