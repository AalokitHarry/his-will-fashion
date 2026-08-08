const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export function createRazorpayOrder({ items, customer }) {
  return request("/api/orders/create", {
    method: "POST",
    body: JSON.stringify({ items, customer }),
  });
}

export function verifyRazorpayPayment(payload) {
  return request("/api/orders/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
