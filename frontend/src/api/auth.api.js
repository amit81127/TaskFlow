import api from './axios';

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string }} data
 */
export const registerUser = (data) => api.post('auth/register', data);

/**
 * Login user
 * @param {{ email: string, password: string }} data
 */
export const loginUser = (data) => api.post('auth/login', data);

/**
 * Logout — revokes refresh token on server
 */
export const logoutUser = () => api.post('auth/logout');

/**
 * Get the currently authenticated user's profile
 */
export const getMe = () => api.get('auth/me');

/**
 * Update the current user's profile
 * @param {{ name?: string, email?: string }} data
 */
export const updateMe = (data) => api.patch('auth/me', data);

/**
 * Refresh tokens (called automatically by axios interceptor)
 * @param {string} refreshToken
 */
export const refreshTokens = (refreshToken) =>
  api.post('auth/refresh-token', { refreshToken });
