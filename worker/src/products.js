// Server-side source of truth for pricing.
// Keep ids/prices in sync with client/src/data/products.js — the worker
// never trusts prices sent from the browser, only ids and quantities.

export const PRODUCTS = {
  "lion-of-judah-tee": { name: "Lion of Judah Tee", price: 1299 },
  "heavenly-influencer-tee": { name: "Heavenly Influencer Tee", price: 1299 },
  "kingdom-mindset-tee": { name: "Kingdom Mindset Tee", price: 1299 },
  "grace-changed-my-story-tee": { name: "Grace Changed My Story Tee", price: 1299 },
  "jesus-little-princess-tee": { name: "Jesus' Little Princess Tee", price: 1199 },
  "philippians-4-7-tee": { name: "Philippians 4:7 Tee", price: 1199 },
  "i-ace-my-race-tee": { name: "I Ace My Race Tee", price: 1299 },
  "plain-eggplant-tee": { name: "The Essentials Tee — Eggplant", price: 899 },
};

export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

export function priceCart(items) {
  let subtotal = 0;
  const lines = [];

  for (const { id, qty, size, color } of items) {
    const product = PRODUCTS[id];
    if (!product) throw new Error(`Unknown product: ${id}`);
    const quantity = Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error(`Invalid quantity for ${id}`);
    }
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    lines.push({ id, name: product.name, price: product.price, qty: quantity, lineTotal, size, color });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  return { lines, subtotal, shipping, total };
}
