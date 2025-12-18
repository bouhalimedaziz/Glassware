import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">GLASSWARE</h3>
            <p className="text-sm">
              Leading Tunisian e-commerce platform for premium technology products. Quality, innovation, and excellence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="hover:text-purple-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=phones" className="hover:text-purple-400 transition-colors">
                  Phones
                </Link>
              </li>
              <li>
                <Link to="/shop?category=laptops" className="hover:text-purple-400 transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/shop?category=headsets" className="hover:text-purple-400 transition-colors">
                  Audio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="hover:text-purple-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white pt-8 text-center text-sm">
          <p>
            &copy; 2025 GLASSWARE. All rights reserved.{" "}
            <span className="text-purple-600">Leading Tech Commerce in Tunisia</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
