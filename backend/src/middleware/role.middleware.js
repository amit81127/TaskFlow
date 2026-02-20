const { sendError } = require('../utils/response');

/**
 * Restrict access to specific roles.
 * Usage: restrictTo('admin', 'manager')
 *
 * @param  {...string} roles - Allowed roles
 * @returns {import('express').RequestHandler}
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'You must be logged in to access this resource.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = { restrictTo };
