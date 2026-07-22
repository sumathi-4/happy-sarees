// ============================================================
//  pagination.js — Pagination utilities
// ============================================================

/**
 * Parse and validate pagination query params
 * @param {object} query - req.query
 * @param {number} defaultLimit
 * @returns {{ page, limit, offset }}
 */
function parsePagination(query, defaultLimit = 10) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build SQL ORDER BY clause from sort query param
 * @param {string} sort - e.g. "name_asc", "created_at_desc"
 * @param {string[]} allowedColumns - Whitelist of column names
 * @param {string} defaultSort - Default sort expression
 */
function buildOrderBy(sort, allowedColumns = [], defaultSort = 'created_at DESC') {
  if (!sort) return defaultSort;

  const parts = sort.split('_');
  const dir   = parts.pop(); // last segment: asc or desc
  const col   = parts.join('_');

  if (!allowedColumns.includes(col)) return defaultSort;
  if (!['asc', 'desc'].includes(dir.toLowerCase())) return defaultSort;

  return `${col} ${dir.toUpperCase()}`;
}

module.exports = { parsePagination, buildOrderBy };
