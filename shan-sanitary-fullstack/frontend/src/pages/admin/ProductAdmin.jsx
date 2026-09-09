import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Pagination from "../../components/product/Pagination";

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/admin", {
        params: { page, limit: 15, search: search || undefined, status: statusFilter || undefined },
      });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will be hidden from the storefront.`)) return;
    try {
      await api.delete(`/products/${id}`);
      setActionMessage(`"${name}" deactivated`);
      load();
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Could not deactivate product");
    } finally {
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const handleReactivate = async (id, name) => {
    try {
      await api.patch(`/products/${id}/reactivate`);
      setActionMessage(`"${name}" reactivated`);
      load();
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Could not reactivate product");
    } finally {
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          to="/admin/products/create"
          className="bg-wine text-white text-sm px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {actionMessage && <p className="text-sm text-wine mb-4">{actionMessage}</p>}

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
          className="flex-1 px-3 py-2 border border-carbon/15 rounded-lg text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-carbon/15 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-carbon/50">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-carbon/50">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-t border-carbon/10">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-carbon/60">{p.sku}</td>
                  <td className="px-4 py-3 text-carbon/60">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">Rs. {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-wine hover:underline">
                        Edit
                      </Link>
                      {p.isActive ? (
                        <button onClick={() => handleDelete(p._id, p.name)} className="text-red-600 hover:underline">
                          Deactivate
                        </button>
                      ) : (
                        <button onClick={() => handleReactivate(p._id, p.name)} className="text-green-600 hover:underline">
                          Reactivate
                        </button>
                      )}
                    </div>
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

export default ProductsAdmin;