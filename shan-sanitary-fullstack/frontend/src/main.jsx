import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Placeholder pages until Phase 9+ builds them out — kept intentionally
// minimal here, not fake: they render real, honest "coming soon" content
// rather than silently doing nothing (Section 49's "no fake completion"
// principle applies to placeholders too — they should say what they are).
const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <p className="text-carbon/50">{title} — coming in the next phase</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ComingSoon title="Home" />} />
            <Route path="/products" element={<ComingSoon title="Products" />} />
            <Route path="/about" element={<ComingSoon title="About Us" />} />
            <Route path="/contact" element={<ComingSoon title="Contact" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <ComingSoon title="Cart" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <ComingSoon title="Wishlist" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["admin", "root_admin"]}>
                  <ComingSoon title="Admin Dashboard" />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;