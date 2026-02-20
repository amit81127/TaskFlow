/**
 * Send a successful JSON response
 * @param {import('express').Response} res
 * @param {Object} opts
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;

  return res.status(statusCode).json(payload);
};

/**
 * Send an error JSON response
 * @param {import('express').Response} res
 * @param {Object} opts
 */
const sendError = (res, { statusCode = 500, message = 'Internal Server Error', errors = null } = {}) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;

  return res.status(statusCode).json(payload);
};

/**
 * Send a paginated list response
 * @param {import('express').Response} res
 * @param {Object} opts
 */
const sendPaginated = (res, {
  statusCode = 200,
  message = 'Success',
  data = [],
  total = 0,
  page = 1,
  limit = 10,
} = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
