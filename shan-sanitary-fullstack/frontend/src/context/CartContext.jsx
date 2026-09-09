import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], subtotal: 0, itemCount: 0, removedItems: [], adjustedItems: [] };

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post("/cart", { productId, quantity });
    setCart(res.data.data);
    return res.data.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.patch(`/cart/${productId}`, { quantity });
    setCart(res.data.data);
  };

  const removeItem = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.data);
  };

  const clearCart = async () => {
    const res = await api.delete("/cart");
    setCart(res.data.data);
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);