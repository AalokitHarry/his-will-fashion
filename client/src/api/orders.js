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

export function placeOrder({ items, customer, couponCode }) {
  return request("/api/orders/place", {
    method: "POST",
    body: JSON.stringify({ items, customer, couponCode }),
  });
}

export function validateCoupon(code, subtotal) {
  return request("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
}

export function fetchOrders(token) {
  return request("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function trackOrder(orderId, phone) {
  const { order } = await request(`/api/orders/${encodeURIComponent(orderId)}/track?phone=${encodeURIComponent(phone)}`);
  return order;
}

export function updateOrderStatus(token, orderId, status) {
  return request(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}
