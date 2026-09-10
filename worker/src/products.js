// Server-side pricing — the worker never trusts prices sent from the
// browser, only product ids and quantities, and always re-prices against D1.

export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

// Fetches only the rows needed to price this cart, keyed by id.
async function loadProductsByIds(db, ids) {
  if (ids.length === 0) return {};
  const placeholders = ids.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`)
    .bind(...ids)
    .all();
  const byId = {};
  for (const row of results) byId[row.id] = row;
  return byId;
}

async function loadCoupon(db, code) {
  const coupon = await db
    .prepare("SELECT code, type, value FROM coupons WHERE code = ? AND active = 1")
    .bind(String(code).trim().toUpperCase())
    .first();
  if (!coupon) throw new Error("Invalid or expired coupon code.");
  return coupon;
}

export function computeDiscount(coupon, subtotal) {
  const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(raw, subtotal));
}

// Server-authoritative pricing AND stock check in one pass — the browser's
// cart is never trusted for price, discount, or availability.
export async function priceCart(db, items, couponCode) {
  const ids = [...new Set(items.map((i) => i.id))];
  const products = await loadProductsByIds(db, ids);

  let subtotal = 0;
  const lines = [];
  const qtyById = {};

  for (const { id, qty, size, color } of items) {
    const product = products[id];
    if (!product) throw new Error(`Unknown product: ${id}`);
    const quantity = Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error(`Invalid quantity for ${id}`);
    }
    qtyById[id] = (qtyById[id] || 0) + quantity;
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    lines.push({ id, name: product.name, price: product.price, qty: quantity, lineTotal, size, color });
  }

  // Stock is only enforced for products the admin has actually set a count
  // on — NULL stock means untracked/unlimited, unchanged from before.
  const stockDecrements = [];
  for (const [id, quantity] of Object.entries(qtyById)) {
    const product = products[id];
    if (product.stock !== null && product.stock < quantity) {
      throw new Error(`Only ${product.stock} left of ${product.name}.`);
    }
    if (product.stock !== null) {
      stockDecrements.push({ id, qty: quantity });
    }
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await loadCoupon(db, couponCode);
    discount = computeDiscount(coupon, subtotal);
    appliedCoupon = coupon.code;
  }

  const total = subtotal - discount + shipping;

  return { lines, subtotal, shipping, discount, couponCode: appliedCoupon, total, stockDecrements };
}

export async function previewCoupon(db, code, subtotal) {
  const coupon = await loadCoupon(db, code);
  const discount = computeDiscount(coupon, subtotal);
  return { code: coupon.code, type: coupon.type, value: coupon.value, discount };
}
