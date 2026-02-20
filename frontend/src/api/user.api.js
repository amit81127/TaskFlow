import api from './axios';

/**
 * Get all users with their task progress (Admin only)
 * Integrated with the legacy path for backwards compatibility or updated to the new modular Admin route
 */
export const getAllUsersProgress = () => api.get('/admin/progress');

/**
 * Get all users list (Admin only)
 * @param {Object} params - page, limit, role
 */
export const getAllUsers = (params = {}) => api.get('/users', { params });

/**
 * Toggle user activation status (Admin only)
 * @param {string} id 
 * @param {boolean} isActive 
 */
export const toggleUserStatus = (id, isActive) => api.patch(`/users/${id}`, { isActive });
