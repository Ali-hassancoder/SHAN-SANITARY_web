import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// requiredRoles is optional — omit it for "just needs to be logged in,
// any role" routes (cart, checkout, orders). Pass it for role-gated
// routes (admin dashboard, root-admin pages).
const ProtectedRoute = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-carbon/60">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Logged in, but wrong role — redirect home rather than to /login,
    // since sending an already-authenticated user back to a login page
    // would be confusing ("but I AM logged in").
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;