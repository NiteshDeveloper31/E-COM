import { verifyToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";
import User from "../models/User.js";

/**
 * Middleware to protect routes via JWT token authorization.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token is missing or invalid.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return sendError(res, "Token verification failed. Access denied.", 401);
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, "Account associated with token no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Authentication request failed.", 401, error);
  }
};

export default authMiddleware;
