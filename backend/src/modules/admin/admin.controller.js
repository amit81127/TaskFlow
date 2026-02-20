const User = require('../users/user.model');
const Task = require('../tasks/task.model');
const { sendSuccess } = require('../../utils/response');

/**
 * @desc    Get progress for all users using high-performance aggregation
 * @route   GET /api/v1/admin/progress
 * @access  Private/Admin
 */
exports.getAllUsersProgress = async (req, res, next) => {
  try {
    // 🔥 HIGH PERFORMANCE AGGREGATION
    // This query calculates total and completed tasks for all users in one database trip
    const analytics = await User.aggregate([
      {
        $lookup: {
          from: 'tasks', // The 'tasks' collection name
          localField: '_id',
          foreignField: 'owner',
          as: 'userTasks'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          totalTasks: { $size: '$userTasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$userTasks',
                as: 'task',
                cond: { $eq: ['$$task.status', 'done'] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          totalTasks: 1,
          completedTasks: 1,
          progress: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 0] }
            ]
          }
        }
      },
      { $sort: { progress: -1, name: 1 } } // Show highest performers first
    ]);

    return sendSuccess(res, {
      message: 'Workforce telemetry synchronized successfully',
      data: { 
        count: analytics.length,
        progress: analytics 
      }
    });
  } catch (error) {
    console.error(`[ADMIN_PROGRESS_AGGREGATION_ERROR]: ${error.message}`, error);
    next(error);
  }
};
