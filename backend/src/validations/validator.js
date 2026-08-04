/**
 * Helper to check if email matches standard formats.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Audit request body keys to verify all required parameters exist.
 * @param {object} body - Request body object
 * @param {string[]} requiredFields - List of keys required
 * @returns {string|null} - First missing field or null
 */
export const checkRequiredFields = (body, requiredFields) => {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "") {
      return field;
    }
  }
  return null;
};
