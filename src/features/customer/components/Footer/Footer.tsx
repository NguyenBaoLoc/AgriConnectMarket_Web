export function Footer() {
  return (
    <footer className="bg-green-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">AgriConnect</h3>
            <p className="text-green-200">
              Your trusted source for organic fruits, vegetables, and leafy
              greens.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-green-200">
              <li>
                <a
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a href="/farms" className="hover:text-white transition-colors">
                  Farms
                </a>
              </li>
              <li>
                <a
                  href="/favorites"
                  className="hover:text-white transition-colors"
                >
                  Favorites
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Account</h4>
            <ul className="space-y-2 text-green-200">
              <li>
                <a
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Profile
                </a>
              </li>
              <li>
                <a
                  href="/orders"
                  className="hover:text-white transition-colors"
                >
                  My Orders
                </a>
              </li>

              <li>
                <a
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  Manage Addresses
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Help & Info</h4>
            <div className="space-y-4 text-green-200 text-sm">
              <div>
                <p className="font-semibold text-white mb-1">Contact Us</p>
                <p>Email: support@agriconnect.com</p>
                <p>Phone: +84 (0) 1234 567 890</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Hours</p>
                <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                <p>Sat - Sun: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-green-800 text-center text-green-200">
          <p>&copy; 2025 AgriConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
