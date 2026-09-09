import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const InventoryAdmin = () => {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [tab, setTab] = useState("low");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, lowRes, outRes] = await Promise.all([
          api.get("/inventory/summary"),
          api.get("/inventory/low-stock", { params: { limit: 50 } }),
          api.get("/inventory/out-of-stock", { params: { limit: 50 } }),
        ]);
        setSummary(summaryRes.data.data);
        setLowStock(lowRes.data.data.products);
        setOutOfStock(outRes.data.data.products);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-carbon/50">Loading inventory...</p>;

  const activeList = tab === "low" ? lowStock : outOfStock;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-carbon/50">Total Products</p>
          <p className="text-xl font-bold">{summary.totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-carbon/50">In Stock</p>
          <p className="text-xl font-bold text-green-600">{summary.inStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-carbon/50">Low Stock (≤ {summary.lowStockThreshold})</p>
          <p className="text-xl font-bold text-amber-600">{summary.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-carbon/50">Out of Stock</p>
          <p className="text-xl font-bold text-red-600">{summary.outOfStock}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("low")}
          className={`px-4 py-2 text-sm rounded-lg ${tab === "low" ? "bg-wine text-white" : "bg-white border border-carbon/15"}`}
        >
          Low Stock ({lowStock.length})
        </button>
        <button
          onClick={() => setTab("out")}
          className={`px-4 py-2 text-sm rounded-lg ${tab === "out" ? "bg-wine text-white" : "bg-white border border-carbon/15"}`}
        >
          Out of Stock ({outOfStock.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeList.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-carbon/50">Nothing here.</td></tr>
            ) : (
              activeList.map((p) => (
                <tr key={p._id} className="border-t border-carbon/10">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-carbon/60">{p.sku}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${p._id}/edit`} className="text-wine hover:underline">
                      Update Stock
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryAdmin;