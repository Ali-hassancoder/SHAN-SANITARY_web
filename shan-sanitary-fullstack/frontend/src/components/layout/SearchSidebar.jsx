import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const TRENDING_SEARCHES = [
  "Wall Hung Commode",
  "Kitchen Sink Mixer",
  "Shower Panel",
  "Bathroom Fittings",
  "Wash Basin",
];

const SearchSidebar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", { params: { search: query, limit: 6 } });
        setResults(res.data.data.products);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350); // debounce — avoids firing a request on every keystroke

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading font-semibold text-lg">Search Products</h2>
              <button onClick={onClose} className="text-carbon/60 hover:text-carbon">
                <X size={22} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2.5 border border-carbon/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/40"
              />
            </div>

            {!query.trim() && (
              <div>
                <p className="text-sm font-medium text-carbon/60 mb-3">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-carbon/5 hover:bg-wine/10 hover:text-wine text-sm rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && (
              <div className="space-y-3">
                {loading && <p className="text-sm text-carbon/50">Searching...</p>}
                {!loading && results.length === 0 && (
                  <p className="text-sm text-carbon/50">No products found for "{query}"</p>
                )}
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-carbon/5 transition-colors"
                  >
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md bg-carbon/5"
                    />
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-carbon/50">Rs. {product.salePrice || product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchSidebar;