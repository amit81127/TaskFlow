const { config } = require('../config/env');

/**
 * Global error handling middleware.
 * Must have exactly 4 params for Express to treat it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    statusCode = 409;
    message = `Duplicate value: ${field} '${value}' already exists.`;
  }

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // ── Log in development ────────────────────────────────────────────────────
  if (config.isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    // Include stack trace in development only
    ...(config.isDev && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler — catches all unmatched routes
 */
const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
