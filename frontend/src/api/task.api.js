import api from './axios';

/**
 * Create a new task
 * @param {{ title, description?, status?, priority?, dueDate?, tags?, assignedTo? }} data
 */
export const createTask = (data) => api.post('/tasks', data);

/**
 * Get my tasks with optional filters
 * @param {{ status?, priority?, search?, page?, limit?, sortBy?, order? }} params
 */
export const getMyTasks = (params = {}) => api.get('/tasks', { params });

/**
 * Get task statistics (counts by status)
 */
export const getTaskStats = () => api.get('/tasks/stats');

/**
 * Get ALL tasks — Admin only
 * @param {{ status?, owner?, page?, limit? }} params
 */
export const getAllTasks = (params = {}) => api.get('/tasks/admin/all', { params });

/**
 * Get a single task by ID
 * @param {string} id
 */
export const getTaskById = (id) => api.get(`/tasks/${id}`);

/**
 * Update a task
 * @param {string} id
 * @param {Object} data
 */
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);

/**
 * Delete a task
 * @param {string} id
 */
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
