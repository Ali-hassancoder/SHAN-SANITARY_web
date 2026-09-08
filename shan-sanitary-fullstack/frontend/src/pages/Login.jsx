import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import RoleTabs from "../components/auth/RoleTabs";
import api from "../services/api";

const Login = () => {
  const [role, setRole] = useState("customer"); // UI-only, see RoleTabs note
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.data);
      // Send admins/root_admins to the dashboard, customers to the storefront
      const returnedRole = res.data.data.role;
      navigate(returnedRole === "customer" ? "/" : "/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold text-carbon mb-1">SHAN SANITARY</h1>
        <p className="text-carbon/60 mb-6">Sign in to your account</p>

        <RoleTabs selectedRole={role} onSelect={setRole} />

        {error && (
          <p className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-carbon/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/40"
            />
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-carbon/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine text-white py-2.5 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-carbon/60 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-wine font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;