-- ============================================================
--  HAPPY SAREES — ADMIN DATABASE SCHEMA (ADDITIVE)
--  Extends existing tables non-destructively
--  All new tables use CREATE TABLE IF NOT EXISTS
--  All alterations use ADD COLUMN IF NOT EXISTS
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- 1. ADMIN ROLES
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 2. ADMIN USERS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  role_id       INTEGER REFERENCES admin_roles(id) ON DELETE SET NULL,
  status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active','inactive','suspended')),
  last_login    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 3. ADMIN PERMISSIONS (per role, per module)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_permissions (
  id         SERIAL PRIMARY KEY,
  role_id    INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  module     VARCHAR(50) NOT NULL,
  can_view   BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit   BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_manage BOOLEAN DEFAULT false,
  UNIQUE(role_id, module)
);

-- ───────────────────────────────────────────────────────────
-- 4. ADMIN REFRESH TOKENS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
  id            SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token         TEXT UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 5. ADMIN PASSWORD RESETS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id            SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token         VARCHAR(255) UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  used          BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 6. ADMIN ACTIVITY LOG (Audit Trail)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id            SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  action        VARCHAR(150) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     INTEGER,
  description   TEXT,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 7. ADMIN NOTIFICATIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id   INTEGER,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 8. MASTER TYPES (fabric, occasion, color, etc.)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_types (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon        VARCHAR(50),
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 9. MASTER ITEMS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_items (
  id          SERIAL PRIMARY KEY,
  type_id     INTEGER NOT NULL REFERENCES master_types(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) NOT NULL,
  description TEXT,
  image_data  TEXT,
  color_hex   VARCHAR(7),
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type_id, slug)
);

-- ───────────────────────────────────────────────────────────
-- 10. COUPONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id                 SERIAL PRIMARY KEY,
  code               VARCHAR(50) UNIQUE NOT NULL,
  name               VARCHAR(100) NOT NULL,
  description        TEXT,
  type               VARCHAR(20) NOT NULL CHECK (type IN ('percentage','flat')),
  value              DECIMAL(10,2) NOT NULL,
  min_order_amount   DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit        INTEGER,
  usage_count        INTEGER DEFAULT 0,
  per_user_limit     INTEGER DEFAULT 1,
  is_active          BOOLEAN DEFAULT true,
  starts_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at         TIMESTAMP,
  created_by         INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 11. COUPON USAGE TRACKING
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_usage (
  id              SERIAL PRIMARY KEY,
  coupon_id       INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  order_id        INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2),
  used_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 12. CMS SECTIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_sections (
  id          SERIAL PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 13. CMS CONTENT BLOCKS
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_content (
  id           SERIAL PRIMARY KEY,
  section_id   INTEGER NOT NULL REFERENCES cms_sections(id) ON DELETE CASCADE,
  content_key  VARCHAR(100),
  content_type VARCHAR(30) DEFAULT 'text',
  text_value   TEXT,
  image_data   TEXT,
  video_url    TEXT,
  json_value   JSONB,
  sort_order   INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  scheduled_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 14. PRODUCT SEO (extension of products)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_seo (
  id               SERIAL PRIMARY KEY,
  product_id       INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  meta_title       VARCHAR(200),
  meta_description TEXT,
  meta_keywords    TEXT,
  og_image_data    TEXT,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 15. ORDER TIMELINE (status history)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_timeline (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status        VARCHAR(50) NOT NULL,
  note          TEXT,
  created_by    INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────
-- 16. STORE SETTINGS (key-value)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id            SERIAL PRIMARY KEY,
  setting_key   VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  category      VARCHAR(50) DEFAULT 'general',
  description   TEXT,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by    INTEGER REFERENCES admin_users(id) ON DELETE SET NULL
);

-- ============================================================
--  NON-DESTRUCTIVE ALTERATIONS TO EXISTING TABLES
-- ============================================================

-- products: admin management fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_on_homepage BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- orders: tracking + admin fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(30) DEFAULT 'none';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- product_images: admin upload support
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- users: block/unblock support
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
--  PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admin_users_email   ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role    ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_user      ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_created   ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read    ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_master_items_type   ON master_items(type_id);
CREATE INDEX IF NOT EXISTS idx_master_items_active ON master_items(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code        ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active      ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_content_section ON cms_content(section_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_products_status     ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_deleted    ON products(deleted_at);
