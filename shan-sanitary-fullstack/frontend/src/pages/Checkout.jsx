import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import AddressForm from "../components/checkout/AddressForm";
import api from "../services/api";

const PAYMENT_METHODS = ["Cash on Delivery", "Bank Transfer", "Online Payment"];

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    api.get("/addresses").then((res) => {
      setAddresses(res.data.data);
      const defaultAddr = res.data.data.find((a) => a.isDefault) || res.data.data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    });
  }, []);

  // Redirect away if the cart is empty or has unresolved issues — mirrors
  // the same guard Cart.jsx's disabled button provides, but enforced again
  // here in case someone navigates to /checkout directly by URL.
  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
  }, [cart.items.length, navigate]);

  const handleAddressSaved = (address) => {
    setAddresses((prev) => [address, ...prev]);
    setSelectedAddressId(address._id);
    setShowAddressForm(false);
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponResult(null);
    try {
      const res = await api.post("/orders/validate-coupon", { code: couponCode });
      setCouponResult(res.data.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
    }
  };

  const shippingFee = couponResult?.shippingFee ?? (cart.subtotal >= 10000 ? 0 : 250);
  const discount = couponResult?.discount ?? 0;
  const estimatedTotal = couponResult?.estimatedTotal ?? cart.subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError("Please select or add a shipping address");
      return;
    }
    setPlacingOrder(true);
    setCheckoutError("");
    try {
      const res = await api.post("/orders/checkout", {
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponResult ? couponCode : undefined,
      });
      await refreshCart(); // cart is now empty server-side — sync local state
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || "Checkout failed. Please try again.");
      if (err.response?.status === 409) {
        // Cart changed since it was last viewed — go back so the customer
        // sees the self-healing notice on the Cart page itself.
        await refreshCart();
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {checkoutError && (
        <p className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{checkoutError}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <div className="space-y-2 mb-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block border rounded-lg p-3 text-sm cursor-pointer ${
                    selectedAddressId === addr._id ? "border-wine bg-wine/5" : "border-carbon/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mr-2"
                  />
                  <span className="font-medium">{addr.fullName}</span> — {addr.addressLine1}, {addr.city}, {addr.phone}
                </label>
              ))}
            </div>
            {showAddressForm ? (
              <AddressForm onSaved={handleAddressSaved} onCancel={() => setShowAddressForm(false)} />
            ) : (
              <button onClick={() => setShowAddressForm(true)} className="text-sm text-wine font-medium">
                + Add New Address
              </button>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  {method}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-1 text-sm mb-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-carbon/70">
                <span>{item.product.name} × {item.quantity}</span>
                <span>Rs. {item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 px-3 py-1.5 border border-carbon/15 rounded-lg text-sm"
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-carbon text-white text-sm px-3 py-1.5 rounded-lg hover:bg-wine transition-colors"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-red-600 mb-3">{couponError}</p>}
          {couponResult && <p className="text-xs text-green-600 mb-3">Coupon applied!</p>}

          <div className="border-t border-carbon/10 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-carbon/60">Subtotal</span>
              <span>Rs. {cart.subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- Rs. {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-carbon/60">Shipping</span>
              <span>{shippingFee === 0 ? "Free" : `Rs. ${shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-carbon/10">
              <span>Total</span>
              <span>Rs. {estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || !selectedAddressId}
            className="w-full bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-50 mt-4"
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;