import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import ProductForm from "./pages/admin/ProductForm";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import CustomersAdmin from "./pages/admin/CustomersAdmin";
import CouponsAdmin from "./pages/admin/CouponsAdmin";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";
import InventoryAdmin from "./pages/admin/InventoryAdmin";
import AdminsManagement from "./pages/admin/AdminsManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";

const ComingSoon = ({ title }) => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <p className="text-carbon/50">{title} — coming in the next phase</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/categories/:slug" element={<ProductListing />} />
              <Route path="/about" element={<ComingSoon title="About Us" />} />
              <Route path="/contact" element={<ComingSoon title="Contact" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={["admin", "root_admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="products/create" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="customers" element={<CustomersAdmin />} />
                <Route path="coupons" element={<CouponsAdmin />} />
                <Route path="reviews" element={<ReviewsAdmin />} />
                <Route path="inventory" element={<InventoryAdmin />} />

                {/* Root-admin-only nested routes — a SECOND ProtectedRoute
                    here, more restrictive than the outer one. A plain admin
                    passes the outer check (they ARE "admin" or "root_admin")
                    but fails this inner one, and is redirected to "/" —
                    same behavior as any other wrong-role access attempt. */}
                <Route
                  path="admins"
                  element={
                    <ProtectedRoute requiredRoles={["root_admin"]}>
                      <AdminsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="audit-logs"
                  element={
                    <ProtectedRoute requiredRoles={["root_admin"]}>
                      <AuditLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredRoles={["root_admin"]}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;