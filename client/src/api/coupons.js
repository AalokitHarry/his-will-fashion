const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export async function fetchCoupons(token) {
  const { coupons } = await request("/api/admin/coupons", token);
  return coupons;
}

export async function createCoupon(token, { code, type, value }) {
  const { coupon } = await request("/api/admin/coupons", token, {
    method: "POST",
    body: JSON.stringify({ code, type, value }),
  });
  return coupon;
}

export function setCouponActive(token, code, active) {
  return request(`/api/admin/coupons/${encodeURIComponent(code)}`, token, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export function deleteCoupon(token, code) {
  return request(`/api/admin/coupons/${encodeURIComponent(code)}`, token, { method: "DELETE" });
}
