import api from './axios';

/**
 * Get all users with their task progress (Admin only)
 */
export const getAllUsersProgress = () => api.get('/users/admin/progress');

/**
 * Get all users list (Admin only)
 * @param {Object} params - page, limit, role
 */
export const getAllUsers = (params = {}) => api.get('/users', { params });
