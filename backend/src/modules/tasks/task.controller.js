const taskService = require('./task.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/response');

// ─── Create Task ──────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get My Tasks ─────────────────────────────────────────────────────────────
const getMyTasks = async (req, res, next) => {
  try {
    const { tasks, total, page, limit } = await taskService.getTasksByOwner(
      req.user.id,
      req.query
    );
    return sendPaginated(res, {
      message: 'Tasks fetched successfully',
      data: tasks,
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Tasks (Admin) ────────────────────────────────────────────────────
const getAllTasks = async (req, res, next) => {
  try {
    const { tasks, total, page, limit } = await taskService.getAllTasks(req.query);
    return sendPaginated(res, {
      message: 'All tasks fetched successfully',
      data: tasks,
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Task ──────────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    // Ownership check — admin bypasses
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user.id) {
      return sendError(res, { statusCode: 403, message: 'Access denied: not your task' });
    }

    return sendSuccess(res, { data: { task } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Task ──────────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    // Ownership check — admin bypasses
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user.id) {
      return sendError(res, { statusCode: 403, message: 'Access denied: not your task' });
    }

    const updated = await taskService.updateTask(req.params.id, req.body);
    return sendSuccess(res, { message: 'Task updated successfully', data: { task: updated } });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Task ──────────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    if (!task) {
      return sendError(res, { statusCode: 404, message: 'Task not found' });
    }

    // Ownership check — admin bypasses
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user.id) {
      return sendError(res, { statusCode: 403, message: 'Access denied: not your task' });
    }

    await taskService.deleteTask(req.params.id);
    return sendSuccess(res, { message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Task Stats ───────────────────────────────────────────────────────────────
const getTaskStats = async (req, res, next) => {
  try {
    // Admin gets global stats, users get their own
    const ownerId = req.user.role === 'admin' ? null : req.user.id;
    const stats = await taskService.getTaskStats(ownerId);
    return sendSuccess(res, { data: { stats } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getMyTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};
