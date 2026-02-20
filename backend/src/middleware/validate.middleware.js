const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Run after express-validator chains.
 * Collects all validation errors and returns them in a consistent format.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    // Log validation errors for easier debugging in development
    const { config } = require('../config/env');
    if (config.isDev) {
      console.warn('[Validation Failed]', JSON.stringify({
        path: req.path,
        method: req.method,
        errors: formattedErrors
      }, null, 2));
    }

    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed. Please check your input.',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
