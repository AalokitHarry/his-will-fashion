const API_BASE = import.meta.env.VITE_API_BASE || "";

// Exchanges the admin password for a session token. The password itself is
// never stored or reused after this call — only the returned token is.
export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Incorrect password.");
  }
  return data.token;
}

// Logs out this device only.
export async function adminLogout(token) {
  await fetch(`${API_BASE}/api/admin/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

// Logs out every device using this admin login at once — e.g. if a session
// token may have leaked.
export async function adminLogoutAll(token) {
  const res = await fetch(`${API_BASE}/api/admin/logout-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to log out all devices.");
  }
  return data;
}
