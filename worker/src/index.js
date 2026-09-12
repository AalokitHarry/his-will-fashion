import { Hono } from "hono";
import { cors } from "hono/cors";
import { priceCart, previewCoupon } from "./products.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendNewsletterWelcomeEmail } from "./email.js";
import { runUptimeCheck } from "./uptime.js";

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

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, refreshed on every authenticated request

// Checks the bearer token against a real, revocable, expiring session --
// never the raw admin password itself. Sliding expiry: every valid request
// pushes the session's expiry another 30 days out, so an admin who checks
// in at least monthly never has to re-enter the password; anyone idle
// longer, or logged out, does.
async function requireAdminSession(c) {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;

  const session = await c.env.DB.prepare("SELECT expires_at FROM admin_sessions WHERE token = ?").bind(token).first();
  if (!session || new Date(session.expires_at) < new Date()) return false;

  const newExpiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await c.env.DB.prepare("UPDATE admin_sessions SET expires_at = ? WHERE token = ?").bind(newExpiry, token).run();
  return true;
}

// Admin: exchange the real password for a session token. This is the only
// place the raw password is ever checked or transmitted after the first
// login -- every other admin request uses the session token instead.
app.post("/api/admin/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const password = String(body.password || "");

  if (!c.env.ADMIN_TOKEN || password !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Incorrect password." }, 401);
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await c.env.DB.prepare("INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)")
    .bind(token, now, expiresAt)
    .run();

  return c.json({ token });
});

// Admin: log out this device only -- deletes just this session's token.
app.post("/api/admin/logout", async (c) => {
  const auth = c.req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token) await c.env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
  return c.json({ ok: true });
});

// Admin: log out every device at once -- e.g. if a session token may have
// leaked. Requires a currently-valid session to call.
app.post("/api/admin/logout-all", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await c.env.DB.prepare("DELETE FROM admin_sessions").run();
  return c.json({ ok: true });
});

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
  if (!(await requireAdminSession(c))) {
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
    const { items, customer, couponCode } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: "Your cart is empty." }, 400);
    }
    const customerError = validateCustomer(customer);
    if (customerError) {
      return c.json({ error: customerError }, 400);
    }

    const { lines, subtotal, shipping, discount, couponCode: appliedCoupon, total, stockDecrements } =
      await priceCart(c.env.DB, items, couponCode);
    const orderId = generateOrderId();

    const statements = [
      c.env.DB.prepare(
        `INSERT INTO orders (order_id, customer, items, subtotal, shipping, coupon_code, discount, total, payment_method, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        orderId,
        JSON.stringify(customer),
        JSON.stringify(lines),
        subtotal,
        shipping,
        appliedCoupon,
        discount,
        total,
        "cod",
        "pending_confirmation",
        new Date().toISOString()
      ),
      // Guarded by `AND stock >= ?` so a decrement never pushes stock
      // negative even if two checkouts race for the last unit.
      ...stockDecrements.map(({ id, qty }) =>
        c.env.DB.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?").bind(qty, id, qty)
      ),
    ];
    await c.env.DB.batch(statements);

    c.executionCtx.waitUntil(
      sendOrderConfirmationEmail(c.env, { orderId, customer, lines, subtotal, shipping, discount, couponCode: appliedCoupon, total })
    );

    return c.json({ orderId, total, discount });
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
    stock: row.stock,
  };
}

// Parses a stock field from form data: "" or missing = untracked/unlimited
// (null), otherwise a non-negative whole number. Returns { ok, stock, error }.
function parseStock(raw) {
  if (raw == null) return { ok: true, stock: undefined };
  const trimmed = String(raw).trim();
  if (trimmed === "") return { ok: true, stock: null };
  const stock = Number(trimmed);
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: "Stock must be a whole number (0 or more), or left blank for unlimited." };
  }
  return { ok: true, stock };
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
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.parseBody().catch(() => ({}));
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const description = String(body.description || "").trim();
  const verse = body.verse ? String(body.verse).trim() : null;
  const stockResult = parseStock(body.stock);
  const stock = stockResult.ok && stockResult.stock !== undefined ? stockResult.stock : null;
  const photos = [body.photo1, body.photo2, body.photo3];

  if (!name) return c.json({ error: "Product name is required." }, 400);
  if (!Number.isFinite(price) || price <= 0) return c.json({ error: "Enter a valid price." }, 400);
  if (!stockResult.ok) return c.json({ error: stockResult.error }, 400);
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
    `INSERT INTO products (id, name, category, price, compare_at, sizes, colors, verse, tagline, tag, description, images, stock, created_at)
     VALUES (?, ?, 'Tees', ?, NULL, ?, '[]', ?, NULL, 'New', ?, ?, ?, ?)`
  )
    .bind(id, name, price, JSON.stringify(["S", "M", "L", "XL", "XXL"]), verse, description, JSON.stringify(imageUrls), stock, now)
    .run();

  const row = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json({ product: rowToProduct(row) }, 201);
});

// Admin: edit a product — password-protected via ADMIN_TOKEN. Expects
// multipart/form-data with `name` and/or `price`. Photos are only replaced
// when all 3 are re-uploaded together; omit them to keep the existing ones.
app.patch("/api/admin/products/:id", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const existing = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Product not found" }, 404);

  const body = await c.req.parseBody().catch(() => ({}));
  const name = body.name != null ? String(body.name).trim() : existing.name;
  const price = body.price != null ? Number(body.price) : existing.price;
  const description = body.description != null ? String(body.description).trim() : existing.description;
  const verse = body.verse != null ? (String(body.verse).trim() || null) : existing.verse;
  const stockResult = parseStock(body.stock);
  const stock = stockResult.ok && stockResult.stock !== undefined ? stockResult.stock : existing.stock;
  const photos = [body.photo1, body.photo2, body.photo3];
  const hasNewPhotos = photos.some((p) => p instanceof File && p.size > 0);

  if (!name) return c.json({ error: "Product name is required." }, 400);
  if (!Number.isFinite(price) || price <= 0) return c.json({ error: "Enter a valid price." }, 400);
  if (!stockResult.ok) return c.json({ error: stockResult.error }, 400);

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
    await c.env.DB.prepare("UPDATE products SET name = ?, price = ?, description = ?, images = ?, stock = ?, verse = ? WHERE id = ?")
      .bind(name, price, description, JSON.stringify(imageUrls), stock, verse, id)
      .run();
  } else {
    await c.env.DB.prepare("UPDATE products SET name = ?, price = ?, description = ?, stock = ?, verse = ? WHERE id = ?")
      .bind(name, price, description, stock, verse, id)
      .run();
  }

  const row = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json({ product: rowToProduct(row) });
});

// Admin: delete a product — password-protected via ADMIN_TOKEN. Removes the
// product row and its stored photos.
app.delete("/api/admin/products/:id", async (c) => {
  if (!(await requireAdminSession(c))) {
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

// Checks real orders for one containing this product, placed with this
// email — never trust a client-supplied "verified" claim.
async function checkVerifiedPurchase(db, productId, email) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const { results } = await db.prepare("SELECT customer, items FROM orders").all();
  return results.some((row) => {
    const customer = JSON.parse(row.customer);
    if (String(customer.email || "").trim().toLowerCase() !== normalized) return false;
    const items = JSON.parse(row.items);
    return items.some((item) => item.id === productId);
  });
}

function rowToReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment,
    verifiedPurchase: !!row.verified_purchase,
    createdAt: row.created_at,
  };
}

// Public: submit a review — always starts unapproved (never shown live);
// an admin has to approve it before it appears on the product page.
app.post("/api/products/:id/reviews", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const customerName = String(body.customerName || "").trim();
  const email = body.email ? String(body.email).trim() : "";
  const rating = Number(body.rating);
  const comment = String(body.comment || "").trim();

  if (!customerName) return c.json({ error: "Enter your name." }, 400);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: "Rating must be between 1 and 5." }, 400);
  }
  if (!comment || comment.length < 10) {
    return c.json({ error: "Say a bit more — at least 10 characters." }, 400);
  }
  if (email && !EMAIL_RE.test(email)) {
    return c.json({ error: "Enter a valid email address, or leave it blank." }, 400);
  }

  const product = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(id).first();
  if (!product) return c.json({ error: "Product not found." }, 404);

  const verifiedPurchase = await checkVerifiedPurchase(c.env.DB, id, email);

  await c.env.DB.prepare(
    `INSERT INTO reviews (product_id, customer_name, email, rating, comment, verified_purchase, approved, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(id, customerName, email || null, rating, comment, verifiedPurchase ? 1 : 0, new Date().toISOString())
    .run();

  return c.json({ submitted: true }, 201);
});

// Public: approved reviews for one product.
app.get("/api/products/:id/reviews", async (c) => {
  const { id } = c.req.param();
  const { results } = await c.env.DB.prepare(
    "SELECT id, product_id, customer_name, rating, comment, verified_purchase, created_at FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC"
  )
    .bind(id)
    .all();
  return c.json({ reviews: results.map(rowToReview) });
});

// Admin: every review (pending + approved) — password-protected via ADMIN_TOKEN.
app.get("/api/admin/reviews", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT reviews.*, products.name AS product_name FROM reviews
     LEFT JOIN products ON products.id = reviews.product_id
     ORDER BY reviews.created_at DESC`
  ).all();

  return c.json({
    reviews: results.map((row) => ({
      ...rowToReview(row),
      productName: row.product_name || row.product_id,
      email: row.email,
      approved: !!row.approved,
    })),
  });
});

// Admin: approve/unapprove a review — password-protected via ADMIN_TOKEN.
app.patch("/api/admin/reviews/:id", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const result = await c.env.DB.prepare("UPDATE reviews SET approved = ? WHERE id = ?")
    .bind(body.approved ? 1 : 0, id)
    .run();

  if (!result.meta.changes) return c.json({ error: "Review not found" }, 404);
  return c.json({ id: Number(id), approved: !!body.approved });
});

// Admin: delete a review — password-protected via ADMIN_TOKEN.
app.delete("/api/admin/reviews/:id", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const result = await c.env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
  if (!result.meta.changes) return c.json({ error: "Review not found" }, 404);
  return c.json({ id: Number(id) });
});

const ORDER_STATUSES = ["pending_confirmation", "confirmed", "shipped", "delivered", "cancelled"];

// Admin: update an order's status — password-protected via ADMIN_TOKEN.
app.patch("/api/orders/:orderId/status", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { orderId } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { status } = body || {};

  if (!ORDER_STATUSES.includes(status)) {
    return c.json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT customer, items, status FROM orders WHERE order_id = ?")
    .bind(orderId)
    .first();
  if (!existing) {
    return c.json({ error: "Order not found" }, 404);
  }

  const statements = [c.env.DB.prepare("UPDATE orders SET status = ? WHERE order_id = ?").bind(status, orderId)];

  // Cancelling releases any stock that was reserved when the order was
  // placed. NULL (untracked) products are unaffected — NULL + n stays NULL.
  if (status === "cancelled" && existing.status !== "cancelled") {
    for (const line of JSON.parse(existing.items)) {
      statements.push(c.env.DB.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").bind(line.qty, line.id));
    }
  }

  await c.env.DB.batch(statements);

  c.executionCtx.waitUntil(
    sendOrderStatusUpdateEmail(c.env, { orderId, customer: JSON.parse(existing.customer), status })
  );

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
    "SELECT order_id, customer, items, subtotal, shipping, coupon_code, discount, total, payment_method, status, created_at FROM orders WHERE order_id = ?"
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
      couponCode: row.coupon_code,
      discount: row.discount,
      total: row.total,
      paymentMethod: row.payment_method,
      status: row.status,
      createdAt: row.created_at,
    },
  });
});

// Admin order list — password-protected via ADMIN_TOKEN.
app.get("/api/orders", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT order_id, customer, items, subtotal, shipping, coupon_code, discount, total, payment_method, status, created_at FROM orders ORDER BY created_at DESC"
  ).all();

  const orders = results.map((row) => ({
    orderId: row.order_id,
    customer: JSON.parse(row.customer),
    items: JSON.parse(row.items),
    subtotal: row.subtotal,
    shipping: row.shipping,
    couponCode: row.coupon_code,
    discount: row.discount,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  }));

  return c.json({ orders });
});

// Public: preview a coupon's discount before checkout, without placing an
// order. The real discount is always recomputed server-side again at
// order-placement time — this is just for live checkout feedback.
app.post("/api/coupons/validate", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const code = String(body.code || "").trim();
  const subtotal = Number(body.subtotal) || 0;

  if (!code) return c.json({ error: "Enter a coupon code." }, 400);

  try {
    const preview = await previewCoupon(c.env.DB, code, subtotal);
    return c.json(preview);
  } catch (err) {
    return c.json({ error: err.message || "Invalid or expired coupon code." }, 404);
  }
});

// Admin: list coupons — password-protected via ADMIN_TOKEN.
app.get("/api/admin/coupons", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // LEFT JOIN so a never-used coupon still shows up, with uses/discount at 0.
  const { results } = await c.env.DB.prepare(
    `SELECT coupons.code, coupons.type, coupons.value, coupons.active, coupons.created_at,
            COUNT(orders.id) AS uses, COALESCE(SUM(orders.discount), 0) AS total_discount
     FROM coupons
     LEFT JOIN orders ON orders.coupon_code = coupons.code
     GROUP BY coupons.code
     ORDER BY coupons.created_at DESC`
  ).all();

  return c.json({
    coupons: results.map((r) => ({
      code: r.code,
      type: r.type,
      value: r.value,
      active: !!r.active,
      uses: r.uses,
      totalDiscount: r.total_discount,
    })),
  });
});

// Admin: create a coupon — password-protected via ADMIN_TOKEN.
app.post("/api/admin/coupons", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const type = body.type === "flat" ? "flat" : body.type === "percent" ? "percent" : null;
  const value = Number(body.value);

  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
    return c.json({ error: "Code must be 3-20 characters: letters, numbers, - or _." }, 400);
  }
  if (!type) return c.json({ error: "Type must be percent or flat." }, 400);
  if (!Number.isInteger(value) || value <= 0 || (type === "percent" && value > 100)) {
    return c.json({ error: type === "percent" ? "Percent must be between 1 and 100." : "Enter a flat rupee amount greater than 0." }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT 1 FROM coupons WHERE code = ?").bind(code).first();
  if (existing) return c.json({ error: `"${code}" already exists.` }, 409);

  await c.env.DB.prepare("INSERT INTO coupons (code, type, value, active, created_at) VALUES (?, ?, ?, 1, ?)")
    .bind(code, type, value, new Date().toISOString())
    .run();

  return c.json({ coupon: { code, type, value, active: true, uses: 0, totalDiscount: 0 } }, 201);
});

// Admin: toggle a coupon active/inactive — password-protected via ADMIN_TOKEN.
app.patch("/api/admin/coupons/:code", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { code } = c.req.param();
  const body = await c.req.json().catch(() => ({}));

  const result = await c.env.DB.prepare("UPDATE coupons SET active = ? WHERE code = ?")
    .bind(body.active ? 1 : 0, code.toUpperCase())
    .run();

  if (!result.meta.changes) return c.json({ error: "Coupon not found" }, 404);
  return c.json({ code, active: !!body.active });
});

// Admin: delete a coupon — password-protected via ADMIN_TOKEN.
app.delete("/api/admin/coupons/:code", async (c) => {
  if (!(await requireAdminSession(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { code } = c.req.param();
  const result = await c.env.DB.prepare("DELETE FROM coupons WHERE code = ?").bind(code.toUpperCase()).run();
  if (!result.meta.changes) return c.json({ error: "Coupon not found" }, 404);
  return c.json({ code });
});

export default {
  fetch: app.fetch,
  scheduled: async (event, env, ctx) => {
    ctx.waitUntil(runUptimeCheck(env));
  },
};
