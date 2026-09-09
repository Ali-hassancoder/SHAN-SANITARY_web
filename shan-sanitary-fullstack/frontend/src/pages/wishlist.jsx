import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { refreshCart } = useCart();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/wishlist");
      setItems(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    setItems((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleMoveToCart = async (productId) => {
    try {
      await api.post(`/wishlist/${productId}/move-to-cart`);
      setItems((prev) => prev.filter((p) => p._id !== productId));
      await refreshCart(); // Navbar badge + Cart page reflect the move immediately
      setMessage("Moved to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not move to cart");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center">Loading wishlist...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-carbon/50 mb-4">Your wishlist is empty.</p>
        <Link to="/products" className="text-wine font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((product) => (
          <div key={product._id} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
            <Link to={`/products/${product.slug}`}>
              <img
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg bg-carbon/5"
              />
            </Link>
            <div className="flex-1">
              <Link to={`/products/${product.slug}`} className="text-sm font-medium hover:text-wine">
                {product.name}
              </Link>
              <p className="text-sm text-carbon/50">
                Rs. {(product.salePrice ?? product.price).toLocaleString()}
              </p>
              {product.stock === 0 && <p className="text-xs text-red-600">Out of stock</p>}
            </div>
            <button
              onClick={() => handleMoveToCart(product._id)}
              disabled={product.stock === 0}
              className="p-2 text-carbon/50 hover:text-wine disabled:opacity-30"
              title="Move to cart"
            >
              <ShoppingCart size={18} />
            </button>
            <button
              onClick={() => handleRemove(product._id)}
              className="p-2 text-carbon/40 hover:text-red-600"
              title="Remove"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;