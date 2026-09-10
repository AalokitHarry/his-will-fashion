import { Hono } from "hono";
import { cors } from "hono/cors";
import { priceCart } from "./products.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendNewsletterWelcomeEmail } from "./email.js";

const app = new Hono();

app.use("/api/*", async (c, next) => {
  const allowedOrigins = (c.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim());
  const middleware = cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
  });
  return middleware(c, next);
});

app.get("/api/health", (c) => c.json({ ok: true }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: newsletter signup. Idempotent — resubscribing an existing address
// is a no-op, not an error.
app.post("/api/newsletter/subscribe", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return c.json({ error: "Enter a valid email address." }, 400);
  }

  const result = await c.env.DB.prepare(
    "INSERT OR IGNORE INTO newsletter_subscribers (email, created_at) VALUES (?, ?)"
  )
    .bind(email, new Date().toISOString())
    .run();

  if (result.meta.changes) {
    c.executionCtx.waitUntil(sendNewsletterWelcomeEmail(c.env, email));
  }

  return c.json({ subscribed: true });
});

// Admin: list newsletter subscribers — password-protected via ADMIN_TOKEN.
app.get("/api/admin/newsletter", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT email, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
  ).all();

  return c.json({ subscribers: results });
});

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
const MAX_PHOTO_BYTES = 1_000_000; // ~1MB — keeps each photo well inside D1's per-row size limit.

// Serves a product photo stored as a blob in D1 (no object-storage account
// needed). Cached for a day — product photos aren't edited after upload.
app.get("/api/products/image/:id/:slot", async (c) => {
  const { id, slot } = c.req.param();
  const row = await c.env.DB.prepare("SELECT content_type, data FROM product_photos WHERE product_id = ? AND slot = ?")
    .bind(id, Number(slot))
    .first();
  if (!row) return c.notFound();
  // D1 hands back a BLOB column as a plain array of byte values, not an
  // ArrayBuffer — Response() needs a real typed array to serialize it.
  return new Response(new Uint8Array(row.data), {
    headers: { "Content-Type": row.content_type, "Cache-Control": "public, max-age=86400" },
  });
});

// Admin: add a new product — password-protected via ADMIN_TOKEN. Expects
// multipart/form-data with `name`, `price`, and exactly 3 photo files
// (`photo1` = the on-model shot shown first, `photo2`/`photo3` = the rest).
// Photos are stored as blobs in D1 — no object-storage account required.
app.post("/api/admin/products", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.parseBody().catch(() => ({}));
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const description = String(body.description || "").trim();
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
    if (photo.size > MAX_PHOTO_BYTES) {
      return c.json(
        { error: `"${photo.name}" is too large (${Math.round(photo.size / 1024)}KB). Use a photo under 1MB — most phones can export a smaller/"web size" version.` },
        400
      );
    }
  }

  const id = await uniqueProductId(c.env.DB, slugify(name));
  const origin = new URL(c.req.url).origin;
  const imageUrls = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const slot = i + 1;
    await c.env.DB.prepare(
      "INSERT INTO product_photos (product_id, slot, content_type, data) VALUES (?, ?, ?, ?)"
    )
      .bind(id, slot, photo.type, await photo.arrayBuffer())
      .run();
    imageUrls.push(`${origin}/api/products/image/${id}/${slot}`);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO products (id, name, category, price, compare_at, sizes, colors, verse, tagline, tag, description, images, created_at)
     VALUES (?, ?, 'Tees', ?, NULL, ?, '[]', NULL, NULL, 'New', ?, ?, ?)`
  )
    .bind(id, name, price, JSON.stringify(["S", "M", "L", "XL", "XXL"]), description, JSON.stringify(imageUrls), now)
    .run();

  const row = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json({ product: rowToProduct(row) }, 201);
});

// Admin: edit a product — password-protected via ADMIN_TOKEN. Expects
// multipart/form-data with `name` and/or `price`. Photos are only replaced
// when all 3 are re-uploaded together; omit them to keep the existing ones.
app.patch("/api/admin/products/:id", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const existing = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Product not found" }, 404);

  const body = await c.req.parseBody().catch(() => ({}));
  const name = body.name != null ? String(body.name).trim() : existing.name;
  const price = body.price != null ? Number(body.price) : existing.price;
  const description = body.description != null ? String(body.description).trim() : existing.description;
  const photos = [body.photo1, body.photo2, body.photo3];
  const hasNewPhotos = photos.some((p) => p instanceof File && p.size > 0);

  if (!name) return c.json({ error: "Product name is required." }, 400);
  if (!Number.isFinite(price) || price <= 0) return c.json({ error: "Enter a valid price." }, 400);

  if (hasNewPhotos) {
    if (photos.some((p) => !(p instanceof File) || p.size === 0)) {
      return c.json({ error: "To replace photos, upload all 3 together." }, 400);
    }
    for (const photo of photos) {
      if (!IMAGE_TYPES[photo.type]) {
        return c.json({ error: `Unsupported photo type: ${photo.type || "unknown"}. Use JPG, PNG, or WebP.` }, 400);
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return c.json(
          { error: `"${photo.name}" is too large (${Math.round(photo.size / 1024)}KB). Use a photo under 1MB.` },
          400
        );
      }
    }

    const origin = new URL(c.req.url).origin;
    const imageUrls = [];
    await c.env.DB.prepare("DELETE FROM product_photos WHERE product_id = ?").bind(id).run();
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const slot = i + 1;
      await c.env.DB.prepare(
        "INSERT INTO product_photos (product_id, slot, content_type, data) VALUES (?, ?, ?, ?)"
      )
        .bind(id, slot, photo.type, await photo.arrayBuffer())
        .run();
      imageUrls.push(`${origin}/api/products/image/${id}/${slot}`);
    }
    await c.env.DB.prepare("UPDATE products SET name = ?, price = ?, description = ?, images = ? WHERE id = ?")
      .bind(name, price, description, JSON.stringify(imageUrls), id)
      .run();
  } else {
    await c.env.DB.prepare("UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?")
      .bind(name, price, description, id)
      .run();
  }

  const row = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json({ product: rowToProduct(row) });
});

// Admin: delete a product — password-protected via ADMIN_TOKEN. Removes the
// product row and its stored photos.
app.delete("/api/admin/products/:id", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  await c.env.DB.prepare("DELETE FROM product_photos WHERE product_id = ?").bind(id).run();
  const result = await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

  if (!result.meta.changes) {
    return c.json({ error: "Product not found" }, 404);
  }
  return c.json({ id });
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

  const row = await c.env.DB.prepare("SELECT customer FROM orders WHERE order_id = ?").bind(orderId).first();
  if (row) {
    c.executionCtx.waitUntil(
      sendOrderStatusUpdateEmail(c.env, { orderId, customer: JSON.parse(row.customer), status })
    );
  }

  return c.json({ orderId, status });
});

// Public: track an order by id + phone (the phone acts as a shared secret
// so order ids — only mildly obfuscated — can't be enumerated to read a
// stranger's order/address).
app.get("/api/orders/:orderId/track", async (c) => {
  const { orderId } = c.req.param();
  const phone = (c.req.query("phone") || "").replace(/\D/g, "");

  if (!phone) {
    return c.json({ error: "Enter the phone number used for this order." }, 400);
  }

  const row = await c.env.DB.prepare(
    "SELECT order_id, customer, items, subtotal, shipping, total, payment_method, status, created_at FROM orders WHERE order_id = ?"
  )
    .bind(orderId)
    .first();

  if (!row) {
    return c.json({ error: "We couldn't find an order with that reference." }, 404);
  }

  const customer = JSON.parse(row.customer);
  const orderPhone = String(customer.phone || "").replace(/\D/g, "");
  if (!orderPhone || !orderPhone.endsWith(phone.slice(-10))) {
    return c.json({ error: "That phone number doesn't match this order." }, 403);
  }

  return c.json({
    order: {
      orderId: row.order_id,
      customer,
      items: JSON.parse(row.items),
      subtotal: row.subtotal,
      shipping: row.shipping,
      total: row.total,
      paymentMethod: row.payment_method,
      status: row.status,
      createdAt: row.created_at,
    },
  });
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
