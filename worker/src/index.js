import { Hono } from "hono";
import { cors } from "hono/cors";
import { priceCart } from "./products.js";
import { sendOrderConfirmationEmail } from "./email.js";

const app = new Hono();

app.use("/api/*", async (c, next) => {
  const allowedOrigins = (c.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim());
  const middleware = cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
  });
  return middleware(c, next);
});

app.get("/api/health", (c) => c.json({ ok: true }));

function validateCustomer(customer) {
  if (!customer || typeof customer !== "object") return "Missing customer details";
  const required = ["fullName", "email", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of required) {
    if (!customer[field] || String(customer[field]).trim() === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `HWF-${stamp}-${random}`;
}

// Cash-on-Delivery order placement — the only payment method this store supports.
// Validates the cart, prices it server-side, and logs the order to D1.
app.post("/api/orders/place", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { items, customer } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: "Your cart is empty." }, 400);
    }
    const customerError = validateCustomer(customer);
    if (customerError) {
      return c.json({ error: customerError }, 400);
    }

    const { lines, subtotal, shipping, total } = await priceCart(c.env.DB, items);
    const orderId = generateOrderId();

    await c.env.DB.prepare(
      `INSERT INTO orders (order_id, customer, items, subtotal, shipping, total, payment_method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        orderId,
        JSON.stringify(customer),
        JSON.stringify(lines),
        subtotal,
        shipping,
        total,
        "cod",
        "pending_confirmation",
        new Date().toISOString()
      )
      .run();

    c.executionCtx.waitUntil(
      sendOrderConfirmationEmail(c.env, { orderId, customer, lines, subtotal, shipping, total })
    );

    return c.json({ orderId, total });
  } catch (err) {
    return c.json({ error: err.message || "Unable to place order." }, err.status || 400);
  }
});

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    compareAt: row.compare_at,
    sizes: JSON.parse(row.sizes),
    colors: JSON.parse(row.colors),
    verse: row.verse || null,
    tagline: row.tagline || null,
    tag: row.tag || null,
    description: row.description || "",
    image: JSON.parse(row.images)[0],
    images: JSON.parse(row.images),
  };
}

// Public product catalog — this is the single source of truth the storefront
// reads from, replacing the old hardcoded client/src/data/products.js file.
app.get("/api/products", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  return c.json({ products: results.map(rowToProduct) });
});

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueProductId(db, baseSlug) {
  let id = baseSlug || "product";
  let suffix = 2;
  while (true) {
    const existing = await db.prepare("SELECT 1 FROM products WHERE id = ?").bind(id).first();
    if (!existing) return id;
    id = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Admin: add a new product — password-protected via ADMIN_TOKEN. Expects
// multipart/form-data with `name`, `price`, and exactly 3 photo files
// (`photo1` = the on-model shot shown first, `photo2`/`photo3` = the rest).
app.post("/api/admin/products", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (!c.env.PRODUCT_IMAGES || !c.env.R2_PUBLIC_URL) {
    return c.json({ error: "Photo storage isn't configured yet." }, 503);
  }

  const body = await c.req.parseBody().catch(() => ({}));
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const photos = [body.photo1, body.photo2, body.photo3];

  if (!name) return c.json({ error: "Product name is required." }, 400);
  if (!Number.isFinite(price) || price <= 0) return c.json({ error: "Enter a valid price." }, 400);
  if (photos.some((p) => !(p instanceof File) || p.size === 0)) {
    return c.json({ error: "All 3 photos are required." }, 400);
  }
  for (const photo of photos) {
    if (!IMAGE_TYPES[photo.type]) {
      return c.json({ error: `Unsupported photo type: ${photo.type || "unknown"}. Use JPG, PNG, or WebP.` }, 400);
    }
  }

  const id = await uniqueProductId(c.env.DB, slugify(name));
  const imageUrls = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = IMAGE_TYPES[photo.type];
    const key = `products/${id}-${i + 1}.${ext}`;
    await c.env.PRODUCT_IMAGES.put(key, await photo.arrayBuffer(), {
      httpMetadata: { contentType: photo.type },
    });
    imageUrls.push(`${c.env.R2_PUBLIC_URL}/${key}`);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO products (id, name, category, price, compare_at, sizes, colors, verse, tagline, tag, description, images, created_at)
     VALUES (?, ?, 'Tees', ?, NULL, ?, '[]', NULL, NULL, 'New', '', ?, ?)`
  )
    .bind(id, name, price, JSON.stringify(["S", "M", "L", "XL", "XXL"]), JSON.stringify(imageUrls), now)
    .run();

  const row = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json({ product: rowToProduct(row) }, 201);
});

const ORDER_STATUSES = ["pending_confirmation", "confirmed", "shipped", "delivered", "cancelled"];

// Admin: update an order's status — password-protected via ADMIN_TOKEN.
app.patch("/api/orders/:orderId/status", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { orderId } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { status } = body || {};

  if (!ORDER_STATUSES.includes(status)) {
    return c.json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` }, 400);
  }

  const result = await c.env.DB.prepare("UPDATE orders SET status = ? WHERE order_id = ?")
    .bind(status, orderId)
    .run();

  if (!result.meta.changes) {
    return c.json({ error: "Order not found" }, 404);
  }

  return c.json({ orderId, status });
});

// Admin order list — password-protected via ADMIN_TOKEN.
app.get("/api/orders", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT order_id, customer, items, subtotal, shipping, total, payment_method, status, created_at FROM orders ORDER BY created_at DESC"
  ).all();

  const orders = results.map((row) => ({
    orderId: row.order_id,
    customer: JSON.parse(row.customer),
    items: JSON.parse(row.items),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  }));

  return c.json({ orders });
});

export default app;
