const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function fetchProductReviews(productId) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to load reviews.");
  return data.reviews;
}

export async function submitReview(productId, { customerName, email, rating, comment }) {
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName, email, rating, comment }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to submit your review.");
  return data;
}

export async function fetchAllReviews(token) {
  const res = await fetch(`${API_BASE}/api/admin/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to load reviews.");
  return data.reviews;
}

export async function setReviewApproved(token, id, approved) {
  const res = await fetch(`${API_BASE}/api/admin/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ approved }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to update review.");
  return data;
}

export async function deleteReview(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to delete review.");
  return data;
}
