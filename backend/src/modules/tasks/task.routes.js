const { Router } = require('express');
const { body, param, query } = require('express-validator');
const taskController = require('./task.controller');
const { protect } = require('../../middleware/auth.middleware');
const { restrictTo } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');

const router = Router();

// All task routes require authentication
router.use(protect);

// ─── Validation Chains ────────────────────────────────────────────────────────

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Status must be one of: todo, in-progress, review, done'),

  body('priority')
    .optional({ checkFalsy: true })
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),

  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('tags')
    .optional({ checkFalsy: true })
    .isArray({ max: 10 }).withMessage('Tags must be an array of max 10 items'),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional({ checkFalsy: true })
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Status must be one of: todo, in-progress, review, done'),

  body('priority')
    .optional({ checkFalsy: true })
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),

  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('tags')
    .optional({ checkFalsy: true })
    .isArray({ max: 10 }).withMessage('Tags must be an array of max 10 items'),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid task ID format'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', createTaskValidation, validate, taskController.createTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get my tasks (with filter, search, pagination)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', taskController.getMyTasks);

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', taskController.getTaskStats);

/**
 * @swagger
 * /api/v1/tasks/admin/all:
 *   get:
 *     summary: Get ALL tasks (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/all', restrictTo('admin'), taskController.getAllTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', idValidation, validate, taskController.getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', updateTaskValidation, validate, taskController.updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', idValidation, validate, taskController.deleteTask);

module.exports = router;
