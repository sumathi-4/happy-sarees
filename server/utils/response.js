// ============================================================
//  response.js — Standard API response helpers
// ============================================================

/**
 * Send a successful JSON response
 * @param {object} res - Express response object
 * @param {any} data - Response payload
 * @param {string} message - Optional message
 * @param {number} statusCode - HTTP status code (default 200)
 */
function success(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

/**
 * Send an error JSON response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} errors - Optional validation error details
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated list response
 */
function paginated(res, items, total, page, limit, message = 'Success') {
  return res.json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

module.exports = { success, error, paginated };
