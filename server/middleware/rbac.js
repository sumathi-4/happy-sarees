// ============================================================
//  rbac.js — Role-Based Access Control middleware factory
// ============================================================

const db = require('../db');

// Cache permissions per role to avoid repeated DB hits
const permCache = new Map();

/**
 * Load permissions for a role from DB (with 60s cache)
 */
async function loadPermissions(roleId) {
  if (permCache.has(roleId)) {
    const { data, ts } = permCache.get(roleId);
    if (Date.now() - ts < 60_000) return data; // 60 second cache
  }

  const result = await db.query(
    `SELECT module, can_view, can_create, can_edit, can_delete, can_manage
     FROM admin_permissions WHERE role_id = $1`,
    [roleId]
  );

  const perms = {};
  result.rows.forEach(row => {
    perms[row.module] = {
      view:   row.can_view,
      create: row.can_create,
      edit:   row.can_edit,
      delete: row.can_delete,
      manage: row.can_manage,
    };
  });

  permCache.set(roleId, { data: perms, ts: Date.now() });
  return perms;
}

/**
 * Invalidate cached permissions for a role
 */
function invalidateCache(roleId) {
  permCache.delete(roleId);
}

/**
 * Middleware factory — checks if the logged-in admin has the required permission
 * @param {string} module  - e.g. 'products', 'orders'
 * @param {string} action  - 'view' | 'create' | 'edit' | 'delete' | 'manage'
 */
function requirePermission(module, action = 'view') {
  return async (req, res, next) => {
    try {
      // Super Admin has all permissions
      if (req.adminUser && req.adminUser.role === 'Super Admin') {
        return next();
      }

      const roleId = req.adminUser && req.adminUser.roleId;
      if (!roleId) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied: No role assigned.',
        });
      }

      const perms = await loadPermissions(roleId);
      const modulePerms = perms[module];

      if (!modulePerms || !modulePerms[action]) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: Cannot ${action} ${module}.`,
        });
      }

      next();
    } catch (err) {
      console.error('[RBAC Error]', err);
      return res.status(500).json({ success: false, message: 'Permission check failed.' });
    }
  };
}

module.exports = { requirePermission, invalidateCache };
