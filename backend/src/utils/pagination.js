/**
 * Calculate pagination offsets and metadata.
 * @param {number|string} page - Current page index
 * @param {number|string} limit - Items per page
 * @param {number} totalItems - Total records matching query
 */
export const getPaginationMeta = (page = 1, limit = 10, totalItems = 0) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const totalPages = Math.ceil(totalItems / parsedLimit) || 1;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
    totalPages,
    totalItems,
    hasNextPage: parsedPage < totalPages,
    hasPrevPage: parsedPage > 1
  };
};
