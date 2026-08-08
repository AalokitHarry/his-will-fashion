import { Router } from "express";
import crypto from "crypto";
import { priceCart } from "../data/products.js";
import { saveOrder } from "../utils/orderStore.js";

const router = Router();

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
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `HWF-${stamp}-${random}`;
}

// Cash-on-Delivery order placement. No payment gateway is wired up yet —
// this validates the cart, prices it server-side, and logs the order.
router.post("/place", (req, res) => {
  try {
    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }
    const customerError = validateCustomer(customer);
    if (customerError) {
      return res.status(400).json({ error: customerError });
    }

    const { lines, subtotal, shipping, total } = priceCart(items);
    const orderId = generateOrderId();

    saveOrder({
      orderId,
      customer,
      items: lines,
      subtotal,
      shipping,
      total,
      paymentMethod: "cod",
      status: "pending_confirmation",
      createdAt: new Date().toISOString(),
    });

    res.json({ orderId, total });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Unable to place order." });
  }
});

export default router;
