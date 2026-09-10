import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/products";

const ProductsContext = createContext(null);

export const CATEGORIES = ["All", "Tees"];

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Lets the admin "add/edit/delete product" flows update immediately
  // without waiting on a full refetch.
  const addProductLocal = (product) => setProducts((prev) => [product, ...prev]);
  const removeProductLocal = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const updateProductLocal = (product) => setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));

  const getProductById = (id) => products.find((p) => p.id === id);

  const value = useMemo(
    () => ({ products, loading, error, reload: load, addProductLocal, removeProductLocal, updateProductLocal, getProductById }),
    [products, loading, error]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
