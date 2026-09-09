import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Pagination from "../components/product/Pagination";

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/orders/my-orders", { params: { page, limit: 10 } }).then((res) => {
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
      setLoading(false);
    });
  }, [page]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-carbon/50 mb-4">You haven't placed any orders yet.</p>
        <Link to="/products" className="text-wine font-medium">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-sm font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-carbon/50">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Rs. {order.total.toLocaleString()}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Orders;