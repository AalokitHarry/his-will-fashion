const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to subscribe right now.");
  }
  return data;
}

export async function fetchSubscribers(token) {
  const res = await fetch(`${API_BASE}/api/admin/newsletter`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to load subscribers.");
  }
  return data.subscribers;
}
