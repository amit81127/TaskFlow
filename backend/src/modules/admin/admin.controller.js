const User = require('../users/user.model');
const Task = require('../tasks/task.model');

/**
 * @desc    Get progress for all users
 * @route   GET /api/v1/admin/progress
 * @access  Private/Admin
 */
exports.getAllUsersProgress = async (req, res, next) => {
  try {
    const users = await User.find().select('name email');

    const data = await Promise.all(
      users.map(async (user) => {
        const total = await Task.countDocuments({ owner: user._id });
        const completed = await Task.countDocuments({
          owner: user._id,
          status: 'done',
        });

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

    res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};
