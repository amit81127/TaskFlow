const { verifyAccessToken, extractBearerToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const userService = require('../modules/users/user.service');

/**
 * Protect routes — validates JWT access token and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return sendError(res, {
        statusCode: 401,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, {
          statusCode: 401,
          message: 'Session expired. Please refresh your token.',
        });
      }
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid token. Please log in again.',
      });
    }

    // Check if user still exists
    const currentUser = await userService.findUserById(decoded.id);
    if (!currentUser) {
      return sendError(res, {
        statusCode: 401,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if password was changed after token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return sendError(res, {
        statusCode: 401,
        message: 'User recently changed password. Please log in again.',
      });
    }

    // Attach user payload to request
    req.user = {
      id: currentUser._id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
