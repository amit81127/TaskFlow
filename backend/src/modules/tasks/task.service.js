const Task = require('./task.model');

/**
 * Create a new task for the authenticated user
 */
const createTask = async (taskData, ownerId) => {
  const task = await Task.create({ ...taskData, owner: ownerId });
  return task;
};

/**
 * Get tasks for a user with filtering, sorting, and pagination
 */
const getTasksByOwner = async (ownerId, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const {
    status,
    priority,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const filter = { owner: ownerId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, total, page, limit };
};

/**
 * Get ALL tasks (admin only) with filtering, sorting, pagination
 */
const getAllTasks = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const {
    status,
    priority,
    owner,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (owner) filter.owner = owner;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, total, page, limit };
};

/**
 * Get a single task by ID (ownership enforced by caller)
 */
const getTaskById = async (taskId) => {
  return Task.findById(taskId)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email');
};

/**
 * Update a task by ID
 */
const updateTask = async (taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'assignedTo'];
  
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      task[key] = updates[key];
    }
  });

  await task.save();
  
  return task.populate([
    { path: 'owner', select: 'name email' },
    { path: 'assignedTo', select: 'name email' }
  ]);
};

/**
 * Delete a task by ID
 */
const deleteTask = async (taskId) => {
  return Task.findByIdAndDelete(taskId);
};

/**
 * Get task statistics for a user
 */
const getTaskStats = async (ownerId) => {
  const stats = await Task.aggregate([
    {
      $match: {
        owner: ownerId
          ? new (require('mongoose').Types.ObjectId)(ownerId)
          : { $exists: true },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
  stats.forEach(({ _id, count }) => {
    if (_id in result) result[_id] = count;
  });
  result.total = Object.values(result).reduce((a, b) => a + b, 0);

  return result;
};

module.exports = {
  createTask,
  getTasksByOwner,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};
