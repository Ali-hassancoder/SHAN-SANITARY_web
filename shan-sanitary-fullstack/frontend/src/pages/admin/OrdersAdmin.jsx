import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Pagination from "../../components/product/Pagination";

const ALL_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];

// Mirrors orderService.js's STATUS_TRANSITIONS map (Phase 6) — kept here
// purely so the dropdown only OFFERS legal next steps, matching the same
// "UI convenience, backend is the real enforcement" pattern used
// throughout this project. If this ever drifts from the backend map,
// nothing breaks — the backend would just reject an illegal choice with
// its own clear error message.
const NEXT_STATUSES = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Returned"],
  Delivered: ["Returned"],
  Cancelled: [],
  Returned: [],
};

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-red-100 text-red-700",
};

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", {
        params: { page, limit: 15, status: statusFilter || undefined },
      });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setMessage(`Order status updated to ${newStatus}`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update status");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        className="px-3 py-2 border border-carbon/15 rounded-lg text-sm mb-4"
      >
        <option value="">All Statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-carbon/50">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-carbon/50">No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t border-carbon/10">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order._id}`} className="text-wine hover:underline">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customer?.name}</p>
                    <p className="text-xs text-carbon/50">{order.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-carbon/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3">Rs. {order.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-carbon/60">{order.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {NEXT_STATUSES[order.orderStatus]?.length > 0 ? (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(order._id, e.target.value);
                        }}
                        className="px-2 py-1 border border-carbon/15 rounded-lg text-xs"
                      >
                        <option value="">Change to...</option>
                        {NEXT_STATUSES[order.orderStatus].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-carbon/40">Final</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default OrdersAdmin;