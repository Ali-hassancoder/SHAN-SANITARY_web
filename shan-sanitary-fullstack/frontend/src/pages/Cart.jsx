import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, AlertTriangle } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const hasIssues = cart.removedItems.length > 0 || cart.adjustedItems.length > 0;

  if (loading && cart.items.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Loading your cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-carbon/50 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-wine font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {/* Self-healing notices from Phase 5 — surfaced honestly rather than
          silently correcting the cart behind the customer's back */}
      <AnimatePresence>
        {hasIssues && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
              <AlertTriangle size={18} />
              Your cart was updated
            </div>
            {cart.removedItems.map((item, i) => (
              <p key={i} className="text-sm text-amber-700">
                • {item.name || "An item"} was removed — {item.reason}
              </p>
            ))}
            {cart.adjustedItems.map((item, i) => (
              <p key={i} className="text-sm text-amber-700">
                • {item.name} quantity reduced from {item.requestedQuantity} to {item.adjustedQuantity} (limited stock)
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
              >
                <Link to={`/products/${item.product.slug}`}>
                  <img
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-carbon/5"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-wine">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-carbon/50">Rs. {item.unitPrice.toLocaleString()} each</p>
                </div>
                <div className="flex items-center gap-2 border border-carbon/15 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-2 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-2 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-medium w-24 text-right">Rs. {item.subtotal.toLocaleString()}</p>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="text-carbon/40 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-carbon/60">Subtotal ({cart.itemCount} items)</span>
            <span>Rs. {cart.subtotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-carbon/40 mb-4">Shipping and discounts calculated at checkout</p>
          <button
            onClick={() => navigate("/checkout")}
            disabled={hasIssues}
            className="w-full bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-50"
          >
            {hasIssues ? "Review cart changes above" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;