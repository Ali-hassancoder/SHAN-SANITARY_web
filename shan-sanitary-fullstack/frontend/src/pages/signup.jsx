import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import RoleTabs from "../components/auth/RoleTabs";
import api from "../services/api";

const initialState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  cnic: "",
  city: "",
  address: "",
  adminKey: "",
};

const Signup = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.username.trim()) e.username = "Username is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = "Enter a valid email";
    if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!formData.gender) e.gender = "Gender is required";
    if (!formData.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!/^\d{10,11}$/.test(formData.phone)) e.phone = "Enter a valid phone number";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) e.cnic = "Format must be 12345-1234567-1";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.address.trim()) e.address = "Address is required";
    // Admin key is a UI-only field with no real backend meaning yet (see note below) —
    // we still require it to be non-empty when the Admin tab is selected, purely
    // so the form behaves consistently. It is NEVER sent to the backend.
    if (role === "admin" && !formData.adminKey.trim()) e.adminKey = "Admin key is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // SECURITY NOTE, made explicit rather than silently done: we intentionally
      // do NOT send `role` or `adminKey` to the backend. Our register endpoint
      // (Phase 3) ignores any role field anyway and always creates a "customer"
      // account — there is currently no public path to create an admin account,
      // by design (Section 5 of the platform spec: root admin only, never
      // public registration). The Admin tab here is a UI affordance matching
      // the original design spec; making it actually create an admin account
      // would require a genuinely different, root-admin-only flow, which is
      // covered later in the root-admin management phase.
      const res = await api.post("/auth/register", {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
      });

      login(res.data.data);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-carbon/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine/40";
  const errorClass = "text-red-600 text-xs mt-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold text-carbon mb-1">SHAN SANITARY</h1>
        <p className="text-carbon/60 mb-6">Create your account</p>

        <RoleTabs selectedRole={role} onSelect={setRole} />

        {serverError && (
          <p className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{serverError}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-carbon/70 mb-1">First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} />
            {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} />
            {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Username</label>
            <input name="username" value={formData.username} onChange={handleChange} className={inputClass} />
            {errors.username && <p className={errorClass}>{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass} />
            {errors.password && <p className={errorClass}>{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={inputClass} />
            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className={errorClass}>{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
            {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">Phone Number</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">CNIC Number</label>
            <input name="cnic" placeholder="12345-1234567-1" value={formData.cnic} onChange={handleChange} className={inputClass} />
            {errors.cnic && <p className={errorClass}>{errors.cnic}</p>}
          </div>
          <div>
            <label className="block text-sm text-carbon/70 mb-1">City</label>
            <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-carbon/70 mb-1">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className={inputClass} />
            {errors.address && <p className={errorClass}>{errors.address}</p>}
          </div>

          <AnimatePresence>
            {role === "admin" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:col-span-2 overflow-hidden"
              >
                <label className="block text-sm text-carbon/70 mb-1">Admin Key</label>
                <input
                  name="adminKey"
                  type="password"
                  placeholder="Enter admin access key"
                  value={formData.adminKey}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.adminKey && <p className={errorClass}>{errors.adminKey}</p>}
                <p className="text-xs text-carbon/50 mt-1">
                  Admin accounts are provisioned by SHAN SANITARY's system administrators and are not created through public signup.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-wine text-white py-2.5 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-carbon/60 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-wine font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;