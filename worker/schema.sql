-- Server-issued session tokens replace using the raw admin password as the
-- bearer token forever. A login exchanges the password for one of these,
-- valid for 30 days and refreshed on every use (sliding window) -- deleting
-- a row (or all rows, via "log out everywhere") forces a real re-login,
-- which a stored password never allowed.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  coupon_code TEXT,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Tees',
  price INTEGER NOT NULL,
  compare_at INTEGER,
  sizes TEXT NOT NULL,
  colors TEXT NOT NULL,
  verse TEXT,
  tagline TEXT,
  tag TEXT,
  description TEXT,
  images TEXT NOT NULL,
  -- NULL = unlimited/untracked (default, preserves prior behavior for
  -- existing products). A real number is enforced at checkout and
  -- decremented per order.
  stock INTEGER,
  created_at TEXT NOT NULL
);

-- code is stored uppercase. type is 'percent' (value = % off, 1-100) or
-- 'flat' (value = flat rupee amount off). Deactivate a code by flipping
-- `active` rather than deleting it, so past orders keep their reference.
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Product photos, stored as raw bytes in D1 (no R2/object-storage account
-- required). One row per photo, keyed by product id + slot (1-3).
CREATE TABLE IF NOT EXISTS product_photos (
  product_id TEXT NOT NULL,
  slot INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (product_id, slot)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

-- Single-row table tracking the last known up/down state per checked
-- target, so the uptime cron only emails on a state transition, not on
-- every 15-minute check while something stays down.
CREATE TABLE IF NOT EXISTS uptime_status (
  target TEXT PRIMARY KEY,
  is_up INTEGER NOT NULL DEFAULT 1,
  changed_at TEXT NOT NULL
);

-- Reviews start unapproved (approved = 0) and only appear on the product
-- page once an admin approves them — never shown live on submission.
-- verified_purchase is set server-side by matching the submitted email
-- against a real order containing this product; never trust a client claim.
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase INTEGER NOT NULL DEFAULT 0,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
