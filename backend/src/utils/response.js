/**
 * Sends a success JSON response.
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Response payload data
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends an error JSON response.
 * @param {object} res - Express response object
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP status code
 * @param {any} error - Optional detailed error object
 */
export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message || error;
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};
