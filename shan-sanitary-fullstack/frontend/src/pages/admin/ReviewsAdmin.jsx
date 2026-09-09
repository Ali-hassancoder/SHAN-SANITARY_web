import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Pagination from "../../components/product/Pagination";

const ReviewsAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/reviews/admin", {
        params: { page, limit: 15, status: statusFilter || undefined },
      });
      setReviews(res.data.data.reviews);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleModerate = async (id, isApproved) => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { isApproved });
      setMessage(isApproved ? "Review approved" : "Review hidden");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update review");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this review? This cannot be undone.")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setMessage("Review deleted");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete review");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>
      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        className="px-3 py-2 border border-carbon/15 rounded-lg text-sm mb-4"
      >
        <option value="">All Reviews</option>
        <option value="approved">Approved (visible)</option>
        <option value="hidden">Hidden</option>
      </select>

      <div className="space-y-3">
        {loading ? (
          <p className="text-carbon/50">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-carbon/50">No reviews found.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link to={`/products/${r.product?.slug}`} className="font-medium text-sm hover:text-wine">
                    {r.product?.name}
                  </Link>
                  <p className="text-xs text-carbon/50">
                    {r.customer?.name} ({r.customer?.email}) · ★ {r.rating}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {r.isApproved ? "Visible" : "Hidden"}
                </span>
              </div>
              <p className="text-sm text-carbon/70 mb-3">{r.comment}</p>
              <div className="flex gap-3 text-sm">
                {r.isApproved ? (
                  <button onClick={() => handleModerate(r._id, false)} className="text-amber-600 hover:underline">
                    Hide
                  </button>
                ) : (
                  <button onClick={() => handleModerate(r._id, true)} className="text-green-600 hover:underline">
                    Approve
                  </button>
                )}
                <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:underline">
                  Delete Permanently
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default ReviewsAdmin;