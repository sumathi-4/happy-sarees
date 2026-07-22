// ============================================================
//  slugify.js — URL-safe slug generator
// ============================================================

/**
 * Convert a string to a URL-safe slug
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores → dash
    .replace(/^-+|-+$/g, '');   // trim leading/trailing dashes
}

/**
 * Ensure a slug is unique by appending a numeric suffix
 * @param {function} checkExists - async fn(slug) => boolean
 * @param {string} baseSlug
 * @returns {Promise<string>}
 */
async function uniqueSlug(checkExists, baseSlug) {
  let slug = baseSlug;
  let i = 1;
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${i}`;
    i++;
  }
  return slug;
}

module.exports = { slugify, uniqueSlug };
