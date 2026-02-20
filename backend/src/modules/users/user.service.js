const User = require('./user.model');

/**
 * Find a user by ID (exclude sensitive fields)
 */
const findUserById = async (id) => {
  return User.findById(id).select('-password -refreshToken');
};

/**
 * Find a user by email (include password for auth) — bypasses isActive filter
 * so that deactivated accounts are found and handled explicitly.
 */
const findUserByEmailWithPassword = async (email) => {
  return User.findOne({ email, isActive: { $in: [true, false] } }).select('+password +refreshToken');
};

/**
 * Get all users (admin only), with optional filters
 */
const getAllUsers = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const { role } = queryParams;

  const skip = (page - 1) * limit;
  const filter = {};
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit };
};

/**
 * Update a user's refresh token (store hashed or raw depending on strategy)
 */
const updateRefreshToken = async (userId, refreshToken) => {
  return User.findByIdAndUpdate(
    userId,
    { refreshToken, lastLogin: new Date() },
    { returnDocument: 'after' }
  );
};

/**
 * Clear a user's refresh token (logout)
 */
const clearRefreshToken = async (userId) => {
  return User.findByIdAndUpdate(userId, { refreshToken: null }, { returnDocument: 'after' });
};

/**
 * Update a user's profile fields
 */
const updateUserById = async (userId, updates) => {
  const allowedFields = ['name', 'email'];
  const filteredUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) filteredUpdates[key] = updates[key];
  });

  return User.findByIdAndUpdate(userId, filteredUpdates, {
    returnDocument: 'after',
    runValidators: true,
  }).select('-password -refreshToken');
};

/**
 * Soft-delete (deactivate) a user
 */
const deactivateUser = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { returnDocument: 'after' }
  ).select('-password -refreshToken');
};

/**
 * Get all users with their task progress (admin only)
 */
const getUsersProgress = async () => {
  return User.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'owner',
        as: 'userTasks',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        totalTasks: { $size: '$userTasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$userTasks',
              as: 'task',
              cond: { $eq: ['$$task.status', 'done'] },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        totalTasks: 1,
        completedTasks: 1,
        progress: {
          $cond: {
            if: { $eq: ['$totalTasks', 0] },
            then: 0,
            else: {
              $round: [
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                0,
              ],
            },
          },
        },
      },
    },
    { $sort: { progress: -1 } },
  ]);
};

module.exports = {
  findUserById,
  findUserByEmailWithPassword,
  getAllUsers,
  updateRefreshToken,
  clearRefreshToken,
  updateUserById,
  deactivateUser,
  getUsersProgress,
};
