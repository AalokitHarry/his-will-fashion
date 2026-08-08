import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { priceCart } from "../data/products.js";
import { saveOrder } from "../utils/orderStore.js";

const router = Router();

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error(
      "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env (see .env.example)."
    );
    err.status = 500;
    throw err;
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

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

router.post("/create", async (req, res) => {
  try {
    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }
    const customerError = validateCustomer(customer);
    if (customerError) {
      return res.status(400).json({ error: customerError });
    }

    const { total, subtotal, shipping } = priceCart(items);
    const { client, keyId } = getRazorpayClient();

    const order = await client.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `hwf_${Date.now()}`,
      notes: {
        customer_name: customer.fullName,
        customer_phone: customer.phone,
        subtotal: String(subtotal),
        shipping: String(shipping),
      },
    });

    res.json({ order, keyId });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Unable to create order." });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, items } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification details." });
    }

    const { keySecret } = getRazorpayClient();

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!isValid) {
      return res.status(400).json({ error: "Payment verification failed. Please contact support." });
    }

    const pricing = Array.isArray(items) ? priceCart(items) : null;

    saveOrder({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      customer,
      items: pricing?.lines || items,
      subtotal: pricing?.subtotal,
      shipping: pricing?.shipping,
      total: pricing?.total,
      status: "paid",
      createdAt: new Date().toISOString(),
    });

    res.json({ verified: true, orderId: razorpay_order_id });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Unable to verify payment." });
  }
});

export default router;
