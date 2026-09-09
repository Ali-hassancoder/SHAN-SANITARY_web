import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import Pagination from "../../components/product/Pagination";

const CustomersAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", {
        params: { page, limit: 15, search: search || undefined, status: statusFilter || undefined },
      });
      setCustomers(res.data.data.customers);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleStatus = async (id, name, currentStatus) => {
    const action = currentStatus ? "disable" : "enable";
    if (!window.confirm(`Are you sure you want to ${action} "${name}"'s account?`)) return;
    try {
      await api.patch(`/customers/${id}/status`, { isActive: !currentStatus });
      setMessage(`"${name}"'s account ${action}d`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || `Could not ${action} account`);
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      {message && <p className="text-sm text-wine mb-4">{message}</p>}

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email..."
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
          <option value="inactive">Disabled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-carbon/50">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-carbon/50">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="border-t border-carbon/10">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-carbon/60">{c.email}</td>
                  <td className="px-4 py-3 text-carbon/60">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3">Rs. {c.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-carbon/50">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(c._id, c.name, c.isActive)}
                      className={c.isActive ? "text-red-600 hover:underline" : "text-green-600 hover:underline"}
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
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

export default CustomersAdmin;
