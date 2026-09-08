import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductGallery from "../components/product/ProductGallery";
import ProductGrid from "../components/product/ProductGrid";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [eligible, setEligible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        setProduct(res.data.data);

        const [relatedRes, reviewsRes] = await Promise.all([
          api.get(`/products/slug/${slug}/related`),
          api.get(`/reviews/product/${res.data.data._id}`),
        ]);
        setRelated(relatedRes.data.data);
        setReviews(reviewsRes.data.data.reviews);

        if (user) {
          const eligRes = await api.get(`/reviews/mine/eligible/${res.data.data._id}`);
          setEligible(eligRes.data.data.eligible);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleWishlist = async () => {
    try {
      await api.post(`/wishlist/${product._id}`);
      setMessage("Added to wishlist");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to wishlist");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/product/${product._id}`, reviewForm);
      setMessage("Review submitted — thank you!");
      setEligible(false);
      const reviewsRes = await api.get(`/reviews/product/${product._id}`);
      setReviews(reviewsRes.data.data.reviews);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit review");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Product not found.</div>;

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const specs = product.specifications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery images={product.images} />

        <div>
          <p className="text-sm text-wine font-medium mb-1">{product.category?.name}</p>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          {product.reviewCount > 0 && (
            <p className="text-sm text-carbon/60 mb-4">
              ★ {product.ratings.toFixed(1)} ({product.reviewCount} reviews)
            </p>
          )}

          {/* Pricing block — clearly labeled tiers, per the spec fix at the top of this phase */}
          <div className="bg-carbon/5 rounded-xl p-4 mb-5 space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-carbon">Rs. {displayPrice.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-sm text-carbon/40 line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-carbon/50">Retail Price</span>
            </div>
            {product.wholesalePrice != null && (
              <p className="text-sm text-carbon/70">
                Wholesale Price: <span className="font-medium">Rs. {product.wholesalePrice.toLocaleString()}</span>
              </p>
            )}
            {product.marketRate != null && (
              <p className="text-sm text-carbon/50">
                Market Rate: Rs. {product.marketRate.toLocaleString()}
              </p>
            )}
          </div>

          <p className={`text-sm mb-4 ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-50"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleWishlist}
              className="p-3 border border-carbon/15 rounded-lg hover:text-wine transition-colors"
            >
              <Heart size={20} />
            </button>
          </div>
          {message && <p className="text-sm text-wine mb-4">{message}</p>}

          <div className="space-y-2 text-sm border-t border-carbon/10 pt-4">
            {specs.quality && (
              <p><span className="text-carbon/50">Quality:</span> {specs.quality}</p>
            )}
            {specs.material && (
              <p><span className="text-carbon/50">Material:</span> {specs.material}</p>
            )}
            {specs.usage && (
              <p><span className="text-carbon/50">Usage:</span> {specs.usage}</p>
            )}
          </div>

          <p className="text-sm text-carbon/70 mt-4 leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

        {eligible && (
          <form onSubmit={handleReviewSubmit} className="bg-carbon/5 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium mb-2">Write a review</p>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              className="mb-2 px-3 py-1.5 border border-carbon/15 rounded-lg text-sm"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm mb-2"
              rows={3}
            />
            <button className="bg-wine text-white text-sm px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors">
              Submit Review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-carbon/50">No reviews yet for this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-carbon/10 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{r.customer?.name}</p>
                  <p className="text-sm text-wine">★ {r.rating}</p>
                </div>
                <p className="text-sm text-carbon/70">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={related} loading={false} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;