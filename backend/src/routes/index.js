const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const taskRoutes = require('../modules/tasks/task.routes');
const userRoutes = require('../modules/users/user.routes');

const adminRoutes = require('../modules/admin/admin.routes');

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running 🚀',
    timestamp: new Date().toISOString(),
    version: 'v1',
  });
});

// ─── API v1 Routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
