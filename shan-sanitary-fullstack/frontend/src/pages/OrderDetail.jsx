import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const CANCELLABLE_STATUSES = ["Pending", "Confirmed"];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${id}/cancel`);
      await load();
      setMessage("Order cancelled successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center">Loading order...</div>;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-16 text-center">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="text-sm text-carbon/50 mb-6">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Status: {order.orderStatus}</span>
          {CANCELLABLE_STATUSES.includes(order.orderStatus) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>Rs. {item.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-carbon/10 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-carbon/60">Subtotal</span><span>Rs. {order.subtotal.toLocaleString()}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>- Rs. {order.discount.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between"><span className="text-carbon/60">Shipping</span><span>{order.shippingFee === 0 ? "Free" : `Rs. ${order.shippingFee.toLocaleString()}`}</span></div>
          <div className="flex justify-between font-semibold pt-2 border-t border-carbon/10"><span>Total</span><span>Rs. {order.total.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-medium mb-2">Shipping Address</h2>
        <p className="text-sm text-carbon/70">
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
          {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.country}
        </p>
        <p className="text-sm text-carbon/50 mt-3">Payment Method: {order.paymentMethod}</p>
        <p className="text-sm text-carbon/50">Payment Status: {order.paymentStatus}</p>
      </div>
    </div>
  );
};

export default OrderDetail;