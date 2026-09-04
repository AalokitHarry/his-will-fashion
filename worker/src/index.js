import { Hono } from "hono";
import { cors } from "hono/cors";
import { priceCart } from "./products.js";

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

    const { lines, subtotal, shipping, total } = priceCart(items);
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

    return c.json({ orderId, total });
  } catch (err) {
    return c.json({ error: err.message || "Unable to place order." }, err.status || 400);
  }
});

export default app;
