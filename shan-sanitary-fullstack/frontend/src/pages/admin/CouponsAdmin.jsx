import { useState, useEffect } from "react";
import api from "../../services/api";

const emptyState = {
  code: "", discountType: "percentage", discountValue: "", minimumOrderAmount: "",
  maximumDiscount: "", startDate: "", expiryDate: "", usageLimit: "",
};

const CouponsAdmin = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState(emptyState);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api.get("/coupons").then((res) => setCoupons(res.data.data));
  useEffect(load, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const startEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount || "",
      maximumDiscount: coupon.maximumDiscount ?? "",
      startDate: coupon.startDate?.slice(0, 10),
      expiryDate: coupon.expiryDate?.slice(0, 10),
      usageLimit: coupon.usageLimit ?? "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyState);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumOrderAmount: formData.minimumOrderAmount === "" ? 0 : Number(formData.minimumOrderAmount),
      maximumDiscount: formData.maximumDiscount === "" ? null : Number(formData.maximumDiscount),
      usageLimit: formData.usageLimit === "" ? null : Number(formData.usageLimit),
    };
    try {
      if (editingId) {
        await api.patch(`/coupons/${editingId}`, payload);
        setMessage("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        setMessage("Coupon created");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save coupon");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Deactivate coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      setMessage(`Coupon "${code}" deactivated`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not deactivate coupon");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const isExpired = (coupon) => new Date(coupon.expiryDate) < new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-wine text-white text-sm px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors"
        >
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      {message && <p className="text-sm text-wine mb-4">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <input name="code" placeholder="CODE" value={formData.code} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm uppercase" />
          <select name="discountType" value={formData.discountType} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" name="discountValue" placeholder="Discount Value" value={formData.discountValue} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <input type="number" name="minimumOrderAmount" placeholder="Min. Order Amount" value={formData.minimumOrderAmount} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <input type="number" name="maximumDiscount" placeholder="Max Discount (optional)" value={formData.maximumDiscount} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <input type="number" name="usageLimit" placeholder="Usage Limit (optional)" value={formData.usageLimit} onChange={handleChange} className="px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          <button className="col-span-2 md:col-span-4 bg-wine text-white text-sm py-2 rounded-lg hover:bg-wine-dark transition-colors">
            {editingId ? "Save Changes" : "Create Coupon"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min. Order</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-t border-carbon/10">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}
                </td>
                <td className="px-4 py-3 text-carbon/60">Rs. {c.minimumOrderAmount || 0}</td>
                <td className="px-4 py-3 text-carbon/60">
                  {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : "(unlimited)"}
                </td>
                <td className="px-4 py-3 text-carbon/60">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    !c.isActive ? "bg-red-100 text-red-700" : isExpired(c) ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}>
                    {!c.isActive ? "Deactivated" : isExpired(c) ? "Expired" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(c)} className="text-wine hover:underline">Edit</button>
                    {c.isActive && (
                      <button onClick={() => handleDelete(c._id, c.code)} className="text-red-600 hover:underline">
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponsAdmin;