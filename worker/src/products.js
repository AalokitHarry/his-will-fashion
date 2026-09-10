// Server-side pricing — the worker never trusts prices sent from the
// browser, only product ids and quantities, and always re-prices against D1.

export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

// Fetches only the rows needed to price this cart, keyed by id.
async function loadProductsByIds(db, ids) {
  if (ids.length === 0) return {};
  const placeholders = ids.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT id, name, price FROM products WHERE id IN (${placeholders})`)
    .bind(...ids)
    .all();
  const byId = {};
  for (const row of results) byId[row.id] = row;
  return byId;
}

export async function priceCart(db, items) {
  const ids = [...new Set(items.map((i) => i.id))];
  const products = await loadProductsByIds(db, ids);

  let subtotal = 0;
  const lines = [];

  for (const { id, qty, size, color } of items) {
    const product = products[id];
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
