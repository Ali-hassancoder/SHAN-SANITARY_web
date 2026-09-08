import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

// Kept deliberately thin at this phase — full cart page logic (quantity
// editing, removed/adjusted-item notices from Phase 5's self-healing) comes
// in Phase 10. Right now this exists so the Navbar's cart icon and every
// "Add to Cart" button on this phase's pages can share one source of truth
// for the item count, instead of each page fetching and tracking it alone.
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItemCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      setItemCount(res.data.data.itemCount);
    } catch {
      setItemCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post("/cart", { productId, quantity });
    setItemCount(res.data.data.itemCount);
    return res.data.data;
  };

  return (
    <CartContext.Provider value={{ itemCount, addToCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);