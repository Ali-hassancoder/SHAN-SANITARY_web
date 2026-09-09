import { useState, useEffect } from "react";
import api from "../../services/api";

const Settings = () => {
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/settings").then((res) => {
      setLowStockThreshold(res.data.data.lowStockThreshold);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/settings", { lowStockThreshold: Number(lowStockThreshold) });
      setMessage("Settings updated successfully — the new threshold applies immediately across the Inventory dashboard.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update settings");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) return <p className="text-carbon/50">Loading settings...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm text-carbon/70 mb-1">Low Stock Threshold</label>
          <input
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm"
          />
          <p className="text-xs text-carbon/50 mt-1">
            Products with stock at or below this number appear under "Low Stock" on the Inventory
            dashboard and admin analytics.
          </p>
        </div>
        <button
          disabled={saving}
          className="bg-wine text-white text-sm px-5 py-2.5 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default Settings;