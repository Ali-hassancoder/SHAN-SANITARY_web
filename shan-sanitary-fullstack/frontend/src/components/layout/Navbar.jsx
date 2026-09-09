import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SearchSidebar from "./SearchSidebar";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-carbon text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-heading font-extrabold text-xl tracking-wide">
            SHAN <span className="text-wine-light">SANITARY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-wine-light transition-colors">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="hover:text-wine-light transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>
            {user && (
              <>
                <Link to="/wishlist" aria-label="Wishlist">
                  <Heart size={20} />
                </Link>
                <Link to="/cart" aria-label="Cart">
                  <ShoppingCart size={20} />
                </Link>
              </>
            )}
            {user ? (
              <div className="hidden md:flex items-center gap-3 text-sm">
                <Link to="/orders" className="hover:text-wine-light transition-colors">
                  Orders
                </Link>
                <Link to="/profile" className="flex items-center gap-1">
                  <User size={18} /> {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-wine text-sm px-3 py-1.5 rounded-lg hover:bg-wine-dark transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block bg-wine text-sm px-3 py-1.5 rounded-lg hover:bg-wine-dark transition-colors"
              >
                Login
              </Link>
            )}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-carbon-light px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-sm"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm">
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block text-sm">
                Orders
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="block text-sm text-wine-light">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-wine-light">
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;