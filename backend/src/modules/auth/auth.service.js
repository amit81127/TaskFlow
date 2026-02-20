/**
 * auth.service.js
 *
 * Thin service layer for auth — business logic beyond the controller.
 * Most auth logic lives in auth.controller.js for simplicity.
 * This file is reserved for complex flows (e.g., password reset, email verify).
 */

const User = require('../users/user.model');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');
const userService = require('../users/user.service');

/**
 * Core registration logic (reusable)
 */
const registerUser = async ({ name, email, password, role = 'user' }) => {
  // Bypass pre(/^find/) isActive filter — must find ALL users including deactivated
  const existing = await User.findOne({ email, isActive: { $in: [true, false] } });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });
  await userService.updateRefreshToken(user._id, refreshToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Core login logic (reusable)
 */
const loginUser = async ({ email, password }) => {
  const user = await userService.findUserByEmailWithPassword(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });
  await userService.updateRefreshToken(user._id, refreshToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

module.exports = { registerUser, loginUser };
