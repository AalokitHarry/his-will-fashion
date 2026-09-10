CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
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
