import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-carbon text-white/80 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="font-heading font-bold text-white text-lg mb-3">SHAN SANITARY</h3>
        <p className="text-sm">Premium sanitary and bathroom solutions for modern homes.</p>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-wine-light">Home</Link></li>
          <li><Link to="/products" className="hover:text-wine-light">Products</Link></li>
          <li><Link to="/about" className="hover:text-wine-light">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-wine-light">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-3">Contact</h4>
        <ul className="space-y-2 text-sm">
          <li>123 Sanitary Plaza, Karachi</li>
          <li>+92 300 1234567</li>
          <li>info@shansanitary.com</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-3">Follow Us</h4>
        <p className="text-sm">Social links coming soon.</p>
      </div>
    </div>
    <div className="border-t border-white/10 text-center text-xs py-4">
      © {new Date().getFullYear()} SHAN SANITARY. All rights reserved.
    </div>
  </footer>
);

export default Footer;