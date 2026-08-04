import { sendError } from "../utils/response.js";

/**
 * Middleware to restrict route access to administrators only.
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendError(res, "Access denied. Administrator privileges required.", 403);
  }
};

export default adminMiddleware;
