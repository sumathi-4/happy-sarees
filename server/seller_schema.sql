-- ============================================================
--  HAPPY SAREES — SELLER DATABASE SCHEMA (ADDITIVE)
--  Extends existing tables non-destructively
--  All new tables use CREATE TABLE IF NOT EXISTS
--  All alterations use ADD COLUMN IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS sellers (
  id                 SERIAL PRIMARY KEY,
  business_name      VARCHAR(150) NOT NULL,
  store_name         VARCHAR(150) NOT NULL,
  store_slug         VARCHAR(150) UNIQUE,
  owner_name         VARCHAR(100) NOT NULL,
  email              VARCHAR(150) UNIQUE NOT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  phone              VARCHAR(20) NOT NULL,
  business_category  VARCHAR(100),
  business_description TEXT,
  gstin              VARCHAR(20),
  pan_number         VARCHAR(20),
  store_logo_url     TEXT,
  store_banner_url   TEXT,
  street_address     TEXT,
  city               VARCHAR(100),
  state              VARCHAR(100),
  pincode            VARCHAR(10),
  bank_account_name  VARCHAR(150),
  bank_account_no    VARCHAR(50),
  bank_ifsc          VARCHAR(20),
  bank_name          VARCHAR(100),
  commission_rate    DECIMAL(5,2) DEFAULT 10.00,
  status             VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','suspended')),
  rejection_reason   TEXT,
  admin_notes        TEXT,
  approved_by        INTEGER,
  approved_at        TIMESTAMP,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_documents (
  id          SERIAL PRIMARY KEY,
  seller_id   INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
  doc_type    VARCHAR(50),   -- pan_document / cancelled_cheque / gst_certificate / id_proof
  file_url    TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'
  CHECK (approval_status IN ('pending','approved','rejected'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(30) DEFAULT 'Pending'
  CHECK (fulfillment_status IN ('Pending','Processing','Shipped','Delivered','Cancelled'));
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'Paid';

CREATE TABLE IF NOT EXISTS seller_notifications (
  id         SERIAL PRIMARY KEY,
  seller_id  INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
  type       VARCHAR(50),   -- registration_status / product_status / new_order / payout / system
  title      VARCHAR(200),
  message    TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_payouts (
  id           SERIAL PRIMARY KEY,
  seller_id    INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
  amount       DECIMAL(10,2) NOT NULL,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  period_start DATE,
  period_end   DATE,
  paid_at      TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
