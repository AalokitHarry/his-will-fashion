import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "hwf_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lineKey(item) {
  return `${item.id}__${item.size}__${item.color}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, { size, color, qty = 1 }) => {
    setItems((prev) => {
      const key = lineKey({ id: product.id, size, color });
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          size,
          color,
          qty,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (item) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  };

  const updateQty = (item, qty) => {
    if (qty < 1) return removeItem(item);
    setItems((prev) => prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    subtotal,
    itemCount,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
