const User = require('../users/user.model');
const userService = require('../users/user.service');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    if (!req.body) {
      return sendError(res, { statusCode: 400, message: 'Request body is missing' });
    }

    const { name, email, password } = req.body;

    // Check if email already exists — search ALL users including deactivated
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: { $in: [true, false] } 
    });

    if (existingUser) {
      return sendError(res, { statusCode: 409, message: 'Email is already registered' });
    }

    // Create user (password hashed by model pre-save hook)
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password, 
      role: req.body.role || 'user' 
    });

    // Generate tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    // Persist refresh token
    await userService.updateRefreshToken(user._id, refreshToken);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error(`[AUTH_REGISTER_ERROR]: ${err.message}`, err);
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    // 1. Guard against missing body or fields (even though validation should catch it)
    if (!req.body) {
      return sendError(res, { statusCode: 400, message: 'Request body is missing' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, { statusCode: 400, message: 'Email and password are required' });
    }

    // 2. Fetch user (using lean() for speed and select to be explicit)
    // We use User.findOne directly here to be absolute about what we're fetching
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: { $in: [true, false] } 
    }).select('+password +role +name +email +isActive');

    // 3. Guard against null user
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password' });
    }

    // 4. Check if account is deactivated
    if (user.isActive === false) {
      return sendError(res, { statusCode: 403, message: 'Account has been deactivated. Please contact support.' });
    }

    // 5. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password' });
    }

    // 6. Generate tokens
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });

    // 7. Persist refresh token & update lastLogin
    await userService.updateRefreshToken(user._id, refreshToken);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error(`[AUTH_LOGIN_ERROR]: ${err.message}`, err);
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, { statusCode: 400, message: 'Refresh token is required' });
    }

    // Verify signature
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return sendError(res, { statusCode: 401, message: 'Invalid or expired refresh token' });
    }

    // Fetch user and compare stored token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return sendError(res, { statusCode: 401, message: 'Refresh token revoked or invalid' });
    }

    // Rotate tokens
    const newAccessToken = signAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id });
    await userService.updateRefreshToken(user._id, newRefreshToken);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Tokens refreshed successfully',
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await userService.clearRefreshToken(req.user.id);
    return sendSuccess(res, { statusCode: 200, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User (me) ────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }
    return sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Current User Profile ─────────────────────────────────────────────
const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updated = await userService.updateUserById(req.user.id, { name, email });
    return sendSuccess(res, { message: 'Profile updated successfully', data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, updateMe };
