import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import Pagination from "../../components/product/Pagination";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs", {
        params: { page, limit: 25, action: actionFilter || undefined },
      });
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <p className="text-xs text-carbon/50 mb-4">
        A permanent, read-only record of administrative and security-relevant actions. Entries here
        cannot be edited or deleted from anywhere in the system.
      </p>

      <input
        value={actionFilter}
        onChange={(e) => {
          setActionFilter(e.target.value);
          setPage(1);
        }}
        placeholder="Filter by action (e.g. PRODUCT_DELETED, ADMIN_CREATED)..."
        className="w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm mb-4"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-carbon/5 text-left text-carbon/60">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target Model</th>
              <th className="px-4 py-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-carbon/50">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-carbon/50">No matching audit logs.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-t border-carbon/10 align-top">
                  <td className="px-4 py-3 text-carbon/60 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {log.actor ? (
                      <>
                        <p>{log.actor.name}</p>
                        <p className="text-xs text-carbon/50">{log.actor.role}</p>
                      </>
                    ) : (
                      <span className="text-carbon/40">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-carbon/60">{log.targetModel || "—"}</td>
                  <td className="px-4 py-3 text-xs text-carbon/50 max-w-xs">
                    <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(log.metadata, null, 0)}</pre>
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

export default AuditLogs;