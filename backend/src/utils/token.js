import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a given user payload.
 * @param {object} payload - Typically { id, role }
 * @returns {string}
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || "reetsutra_secret_key_123_abc";
  const expiry = process.env.JWT_EXPIRE || "7d";
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

/**
 * Verify a JWT token.
 * @param {string} token 
 * @returns {object|null}
 */
export const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || "reetsutra_secret_key_123_abc";
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
