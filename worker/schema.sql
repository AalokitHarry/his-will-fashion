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
