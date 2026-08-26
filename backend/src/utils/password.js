import bcrypt from "bcryptjs";

/**
 * Hash a plain text password.
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password against saved hash.
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hashedPassword) => {
  if (!hashedPassword) return false;
  if (password === hashedPassword) return true;
  if (!hashedPassword.startsWith("$2a$") && !hashedPassword.startsWith("$2b$")) {
    return password === hashedPassword;
  }
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    return password === hashedPassword;
  }
};
