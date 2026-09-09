import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "../../services/api";

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-carbon/50 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryPerf, setCategoryPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, salesRes, topRes, catRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/sales-over-time", { params: { days: 30 } }),
          api.get("/dashboard/top-products", { params: { limit: 5 } }),
          api.get("/dashboard/category-performance"),
        ]);
        setSummary(summaryRes.data.data);
        setSales(salesRes.data.data);
        setTopProducts(topRes.data.data);
        setCategoryPerf(catRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-carbon/50">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`Rs. ${summary.totalRevenue.toLocaleString()}`} />
        <StatCard label="Total Orders" value={summary.totalOrders} />
        <StatCard label="Total Customers" value={summary.totalCustomers} />
        <StatCard label="Total Products" value={summary.totalProducts} />
        <StatCard label="Pending Orders" value={summary.pendingOrders} />
        <StatCard label="Processing Orders" value={summary.processingOrders} />
        <StatCard label="Delivered Orders" value={summary.deliveredOrders} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Sales Over Time (30 days)</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-carbon/50">No sales data in this period yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#722F37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-carbon/50">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#722F37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Category Performance</h2>
        {categoryPerf.length === 0 ? (
          <p className="text-sm text-carbon/50">No sales data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;