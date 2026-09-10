const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to load products.");
  }
  return data.products;
}

// formData carries: name, price, photo1, photo2, photo3 (Files).
export async function createProduct(token, formData) {
  const res = await fetch(`${API_BASE}/api/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to add product.");
  }
  return data.product;
}

export async function deleteProduct(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Unable to delete product.");
  }
  return data;
}
