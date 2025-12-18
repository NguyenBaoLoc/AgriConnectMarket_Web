import {
  ShoppingCart,
  Search,
  Leaf,
  User,
  LogOut,
  Heart,
  LogIn,
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { NavigationButton } from './Header/components/NavigationButton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCartItems } from '../CartPage/api';
export { Footer } from './Footer/Footer';

interface HeaderProps {
  notificationCount: number;
  cartItemsCount?: number;
}

export function Header({
  notificationCount = 0,
  cartItemsCount = 0,
}: HeaderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const [cartCount, setCartCount] = useState(cartItemsCount);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isLoggedIn) {
        setCartCount(0);
        return;
      }
      try {
        const response = await getCartItems();
        if (response.success && response.data) {
          const count = response.data.cartItems.reduce(
            (sum, farm) => sum + farm.items.length,
            0
          );
          setCartCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };
    fetchCartCount();
  }, [isLoggedIn]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchInput.trim()) {
        navigate(`/products?q=${encodeURIComponent(searchInput)}`);
      } else {
        navigate('/products');
      }
    }
  };

  function onNavigateToAuth() {
    navigate('/auth');
  }
  function onNavigateHome() {
    navigate('/');
  }
  function onNavigateToProducts() {
    navigate('/products');
  }
  function onNavigateToProfile() {
    navigate('/profile');
  }
  function onNavigateToFavorites() {
    navigate('/favorites');
  }
  function onNavigateToCart() {
    navigate('/cart');
  }
  function onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-green-700">AgriConnect</span>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={onNavigateHome}
            className="text-foreground hover:text-green-600 transition-colors"
          >
            Home
          </button>
          <button
            onClick={onNavigateToProducts}
            className="text-foreground hover:text-green-600 transition-colors"
          >
            Shop All
          </button>
          <button
            onClick={() => navigate('/farms')}
            className="text-foreground hover:text-green-600 transition-colors"
          >
            Farms
          </button>
        </nav>

        {/* Functions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 w-64 bg-input-background border-border"
            />
          </div>
          {isLoggedIn ? (
            <>
              <NavigationButton icon={User} onClick={onNavigateToProfile} />

              <NavigationButton icon={Heart} onClick={onNavigateToFavorites} />
              <NavigationButton
                icon={ShoppingCart}
                onClick={onNavigateToCart}
                count={cartCount}
                badgeColor="green"
              />
              <NavigationButton icon={LogOut} onClick={onLogout} />
            </>
          ) : (
            <NavigationButton icon={LogIn} onClick={onNavigateToAuth} />
          )}
        </div>
      </div>
    </header>
  );
}
