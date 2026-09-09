import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Users, Ticket,
  Star, Boxes, ShieldCheck, ScrollText, Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
];

// Section 25: these three are root_admin ONLY, both in the route
// protection (App.jsx) and here in the sidebar itself — hiding the link
// entirely for a plain admin is a UX nicety (no dead-end clicks into a
// redirect), while App.jsx's ProtectedRoute is the actual enforcement.
const ROOT_ADMIN_NAV_ITEMS = [
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const AdminLayout = () => {
  const { isRootAdmin } = useAuth();
  const navItems = isRootAdmin ? [...ADMIN_NAV_ITEMS, ...ROOT_ADMIN_NAV_ITEMS] : ADMIN_NAV_ITEMS;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-56 bg-carbon text-white/80 flex-shrink-0 py-6">
        <p className="px-5 text-xs uppercase tracking-wider text-white/40 mb-3">Admin Panel</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-wine text-white" : "hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-offwhite p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;