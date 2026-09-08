import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../services/api";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // don't navigate to the detail page when clicking the button
    if (!user) {
      setMessage("Please log in to add items to your cart");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product._id, 1);
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.post(`/wishlist/${product._id}`);
      setMessage("Added to wishlist");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to wishlist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden relative"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-carbon/5 overflow-hidden">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-wine text-white text-xs px-2 py-1 rounded-full">
              Sale
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:text-wine transition-colors"
          >
            <Heart size={16} />
          </button>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-carbon/70">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-wine font-medium mb-1">{product.category?.name}</p>
          <h3 className="text-sm font-medium text-carbon line-clamp-2 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-carbon">Rs. {displayPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-carbon/40 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full bg-carbon text-white text-sm py-2 rounded-lg hover:bg-wine transition-colors disabled:opacity-50"
        >
          {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
        {message && <p className="text-xs text-center mt-1 text-wine">{message}</p>}
      </div>
    </motion.div>
  );
};

export default ProductCard;