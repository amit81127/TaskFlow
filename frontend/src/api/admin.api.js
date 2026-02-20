import api from './axios';

/**
 * Get all users with their task progress (Admin only)
 * This uses the new isolated Admin module
 */
export const getAdminProgress = () => api.get('/admin/progress');
