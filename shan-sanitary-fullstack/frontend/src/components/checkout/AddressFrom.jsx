import { useState } from "react";
import api from "../../services/api";

const initialState = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
  isDefault: false,
};

// Reusable — used here in Checkout, could be reused later for a
// "Manage Addresses" profile page without duplicating this form.
const AddressForm = ({ onSaved, onCancel }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await api.post("/addresses", formData);
      onSaved(res.data.data);
    } catch (err) {
      setErrors(err.response?.data?.error || { general: err.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm";

  return (
    <form onSubmit={handleSubmit} className="bg-carbon/5 rounded-xl p-4 space-y-3">
      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputClass} />
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClass} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div>
        <input name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} onChange={handleChange} className={inputClass} />
        {errors.addressLine1 && <p className="text-xs text-red-600 mt-1">{errors.addressLine1}</p>}
      </div>
      <input name="addressLine2" placeholder="Address Line 2 (optional)" value={formData.addressLine2} onChange={handleChange} className={inputClass} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClass} />
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>
        <input name="state" placeholder="State/Province" value={formData.state} onChange={handleChange} className={inputClass} />
        <input name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
        Set as default address
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-wine text-white text-sm px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-carbon/50 px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;