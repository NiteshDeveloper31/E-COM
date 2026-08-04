import { sendError } from "../utils/response.js";

/**
 * Centralized error handler middleware.
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error("Centralized Error Handler Logging:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";

  return sendError(res, message, statusCode, err);
};

export default errorMiddleware;
