import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from '../features/customer/HomePage/Index';
import { Auth } from '../features/Auth/Index';
import { ForgotPassword } from '../features/Auth/components/ForgotPassword';
import { UserProfile } from '../features/customer/UserProfile/Index';
import { ProductPage } from '../features/customer/ProductPage/Index';
import { CartPage } from '../features/customer/CartPage/Index';
import { CheckoutPage } from '../features/customer/CheckoutPage/Index';
import { OrdersPage } from '../features/customer/OrdersPage/Index';
import { FarmDetail as AdminFarmDetail } from '../features/admin/FarmDetail/FarmDetail';
import { UserDetail } from '../features/admin/UserDetail/UserDetail';
import { AdminProfile } from '../features/admin/AdminProfile/AdminProfile';
import { OrderDetail } from '../features/farmer/OrderDetail/OrderDetail';
import { SeasonDetail } from '../features/farmer/SeasonDetail/SeasonDetail';
import { FarmDetail as FarmerFarmDetail } from '../features/farmer/FarmDetail/FarmDetail';
import { FarmerProfile } from '../features/farmer/FarmerProfile/FarmerProfile';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import type { UserRole } from '../types';
import { OrderConfirmation } from '../features/customer/OrderConfirmationPage/Index';
import { OrderDetailPage } from '../features/customer/OrderDetailPage/Index';
import { OrderPaymentPage } from '../features/customer/OrderPaymentPage/Index';
import { VNPayReturnPage } from '../features/customer/VNPayReturnPage/Index';
import { FavoriteListPage } from '../features/customer/FavoriteListPage/Index';
import { ProductDetail } from '../features/customer/ProductDetail/Index';
import { TraceabilityView } from '../features/customer/TraceabilityViewPage/Index';
import { FarmDetail } from '../features/customer/FarmDetail/Index';
import { NotificationPage } from '../features/customer/NotificationPage/Index';
import { NotificationPage as FarmerNotificationPage } from '../features/farmer/NotificationPage/Index';
import { FeedbackPage } from '../features/customer/FeedbackPage/Index';
import { Header } from '../features/customer/components';
import { ErrorPage } from '../components/ErrorPage';
import type { CartItem } from '../features/customer/CartPage/types';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { FarmerLayout } from '../features/farmer/components/FarmerLayout/Index';
import { FarmerOverview } from '../features/farmer/FarmerOverview/FarmerOverview';
import { OrderList } from '../features/farmer/OrderList/OrderList';
import { ProductList } from '../features/farmer/ProductList/ProductList';
import { SeasonList } from '../features/farmer/SeasonList/SeasonList';
import { FarmManage } from '../features/farmer/FarmManage/FarmManage';
import { AdminLayout } from '../features/admin/components/AdminLayout/Index';
import { AdminStats } from '../features/admin/Overview/AdminStats';
import { FarmList } from '../features/admin/FarmList/FarmList';
import { UserList } from '../features/admin/UserList/UserList';
import { CategoryList } from '../features/admin/CategoryList/CategoryList';
import { ProductList as AdminProductList } from '../features/admin/ProductList/ProductList';
import { ViolationReportList } from '../features/admin/ReportList/ViolationReportList';
import { CareEventTypeList } from '../features/admin/CareEventTypeList/CareEventTypeList';
import { TransactionList } from '../features/admin/TransactionList/TransactionList';
import { ModeratorLayout } from '../features/moderator/components/ModeratorLayout/Index';
import { FarmDetail as ModeratorFarmDetail } from '../features/moderator/FarmDetail/FarmDetail';
import { ModeratorFarmDetailView } from '../features/moderator/FarmDetail/FarmDetailView';
import { ReportList as ModeratorReportList } from '../features/moderator/ReportList/ReportList';
import { TransactionList as ModeratorTransactionList } from '../features/moderator/TransactionList/TransactionList';
import { EmailVerifiedPage } from '../features/customer/EmailVerifiedPage/Index';
import { PaymentResultPage } from '../features/customer/PaymentResultPage/Index';
import { ProductBatchList } from '../features/farmer/ProductBatchList/ProductBatchList';
import { ProductBatchDetail } from '../features/farmer/ProductBatchDetail/ProductBatchDetail';
import FarmsPage from '../features/customer/FarmsPage/Index';
import { AddressesPage } from '../features/customer/Addresses/Index';
import { PreOrderPage } from '../features/customer/PreOrderPage/Index';
import { PreOrderConfirmationPage } from '../features/customer/PreOrderConfirmationPage/Index';

import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

type Page =
  | 'home'
  | 'auth'
  | 'profile'
  | 'products'
  | 'product-detail'
  | 'farm-detail'
  | 'traceability'
  | 'cart'
  | 'checkout'
  | 'order-payment'
  | 'order-confirmation'
  | 'orders'
  | 'feedback'
  | 'notifications'
  | 'favorites'
  | 'admin-dashboard'
  | 'admin-farm-detail'
  | 'admin-user-detail'
  | 'admin-profile'
  | 'moderator-dashboard'
  | 'moderator-farm-detail'
  | 'moderator-profile'
  | 'farmer-dashboard'
  | 'farmer-order-detail'
  | 'farmer-season-detail'
  | 'farmer-farm-detail'
  | 'farmer-profile'
  | 'error';

export default function App() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [userRole, setUserRole] = useState<UserRole>('Guest');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartRefreshKey, setCartRefreshKey] = useState(0);
  const [careEvents, setCareEvents] = useState<any[]>([]);
  const [traceabilityErrorMessage, setTraceabilityErrorMessage] =
    useState<string>('');

  const handleLogin = () => {
    if (userRole === ('Admin' as UserRole)) {
      setCurrentPage('admin-dashboard');
    } else if (userRole === ('Moderator' as UserRole)) {
      setCurrentPage('moderator-dashboard');
    } else if (userRole === ('Farmer' as UserRole)) {
      setCurrentPage('farmer-dashboard');
    } else if (
      userRole === ('Buyer' as UserRole) ||
      userRole === ('Guest' as UserRole)
    ) {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setUserRole('Guest');
    setCurrentPage('home');
  };

  const navigateToProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    navigate(`/product/${productId}`);
  };

  const navigateToFarmDetail = (farmId: string) => {
    navigate(`/farm/${farmId}`);
  };

  // Cart handlers
  const handleAddToCart = (product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
  }) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        toast.success(`Added another ${product.name} to cart`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = () => {
    // Clear cart and navigate to order confirmation page
    setCartItems([]);
    setCurrentPage('order-confirmation');
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    handleLogin();
  }, [userRole]);

  function MainLayout() {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
        <Toaster />
      </div>
    );
  }

  const [headerCartCount, setHeaderCartCount] = useState(0);

  function CustomerLayout() {
    useEffect(() => {
      createChat({
        webhookUrl:
          'http://localhost:5678/webhook/c3db0cb8-e8a6-4605-b7a3-5231ef700d4d/chat',
      });
    }, []);
    return (
      <>
        <Header cartItemsCount={headerCartCount} />
        <Outlet context={{ setHeaderCartCount }} />
      </>
    );
  }

  function AuthRedirect() {
    const role = localStorage.getItem('role');
    if (role === 'customer') return <Navigate to="/" replace />;
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'moderator') return <Navigate to="/moderator" replace />;
    return <Outlet />;
  }
  function CustomerRedirect() {
    const role = localStorage.getItem('role');
    if (!role) return <Navigate to="/auth" replace />;
    return <Outlet />;
  }
  function FarmerRedirect() {
    const role = localStorage.getItem('role');
    if (!role) return <Navigate to="/auth" replace />;
    return <Outlet />;
  }
  function AdminRedirect() {
    const role = localStorage.getItem('role');
    if (!role) return <Navigate to="/auth" replace />;
    return <Outlet />;
  }
  function ModeratorRedirect() {
    const role = localStorage.getItem('role');
    if (!role) return <Navigate to="/auth" replace />;
    return <Outlet />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Auth Routes */}
        <Route element={<AuthRedirect />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
        </Route>
        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route
            path="/"
            element={
              <HomePage
                onNavigateToProducts={() => {
                  setCurrentPage('products');
                  navigate('/products');
                }}
                onNavigateToProductDetails={navigateToProductDetail}
                onNavigateToFarmDetails={navigateToFarmDetail}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductPage
                onNavigateToProductDetails={navigateToProductDetail}
              />
            }
          />
          <Route path="/farms" element={<FarmsPage />} />
          <Route
            path="/product/:productId"
            element={
              <ProductDetail
                productId={selectedProductId}
                onNavigateToProducts={() => setCurrentPage('products')}
                onNavigateToTraceability={(events, errorMessage) => {
                  setCareEvents(events);
                  setTraceabilityErrorMessage(errorMessage || '');
                  setCurrentPage('traceability');
                  navigate('/traceability');
                }}
                onNavigateToError={() => {
                  setCurrentPage('error');
                  navigate('/error');
                }}
                onNavigateToFarmDetail={navigateToFarmDetail}
              />
            }
          />
          <Route path="/farm/:farmId" element={<FarmDetail />} />
          <Route
            path="/traceability"
            element={
              <TraceabilityView
                careEvents={careEvents}
                onBack={() => navigate(-1)}
                errorMessage={traceabilityErrorMessage}
              />
            }
          />
          <Route element={<CustomerRedirect />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route
              path="/orders"
              element={<OrdersPage onNavigateToFeedback={() => { }} />}
            />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route
              path="/cart"
              element={
                <CartPage
                  onNavigateHome={() => navigate('/')}
                  onNavigateToCheckout={() => navigate('/checkout')}
                />
              }
            />
            <Route
              path="/checkout"
              element={<CheckoutPage onBack={() => navigate('/cart')} />}
            />
            <Route path="/pre-order/:batchId" element={<PreOrderPage />} />
            <Route
              path="/pre-order-confirmation/:orderCode"
              element={<PreOrderConfirmationPage />}
            />
            <Route path="/order-payment" element={<OrderPaymentPage />} />
            <Route
              path="/payments/vnpay-return"
              element={<VNPayReturnPage />}
            />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route
              path="/order-confirmation"
              element={
                <OrderConfirmation
                  onViewOrders={() => setCurrentPage('orders')}
                  onContinueShopping={() => setCurrentPage('home')}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoriteListPage
                  onNavigateToProducts={() => setCurrentPage('products')}
                />
              }
            />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route
              path="/feedback"
              element={<FeedbackPage onBack={() => setCurrentPage('orders')} />}
            />
          </Route>
        </Route>
        {/* Farmer Routes */}
        <Route element={<FarmerLayout />}>
          <Route path="/farmer" element={<FarmerOverview />} />
          <Route path="/farmer/overview" element={<FarmerOverview />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
          <Route path="/farmer/orders" element={<OrderList />} />
          <Route path="/farmer/orders/:orderId" element={<OrderDetail />} />
          <Route path="/farmer/products" element={<ProductList />} />
          <Route
            path="/farmer/product-batches"
            element={<ProductBatchList />}
          />
          <Route
            path="/farmer/product-batches/:batchId"
            element={<ProductBatchDetail />}
          />
          <Route path="/farmer/seasons" element={<SeasonList />} />
          <Route path="/farmer/farms" element={<FarmManage />} />
          <Route path="/farmer/seasons/:seasonId" element={<SeasonDetail />} />
          <Route path="/farmer/farms/:farmId" element={<FarmerFarmDetail />} />
          <Route path="/farmer/notifications" element={<FarmerNotificationPage />} />
        </Route>
        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminStats />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/farms" element={<FarmList />} />
          <Route path="/admin/farms/:farmId" element={<AdminFarmDetail />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/users/:userId" element={<UserDetail />} />
          <Route path="/admin/categories" element={<CategoryList />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/event-types" element={<CareEventTypeList />} />
          <Route path="/admin/transactions" element={<TransactionList />} />
          <Route path="/admin/reports" element={<ViolationReportList />} />
        </Route>
        {/* Moderator Routes */}
        <Route element={<ModeratorLayout />}>
          <Route element={<ModeratorRedirect />}>
            <Route path="/moderator" element={<ModeratorFarmDetail />} />
            <Route path="/moderator/farms" element={<ModeratorFarmDetail />} />
            <Route
              path="/moderator/farms/:farmId"
              element={<ModeratorFarmDetailView />}
            />
            <Route
              path="/moderator/reports"
              element={<ViolationReportList />}
            />
            <Route
              path="/moderator/transactions"
              element={<TransactionList />}
            />
            <Route path="/moderator/profile" element={<AdminProfile />} />
          </Route>
        </Route>
        {/* Error Route */}
        <Route
          path="/error"
          element={
            <ErrorPage
              errorMessage="Failed to verify traceability information. Please check if the product batch is valid and try again."
              onNavigateHome={() => {
                setCurrentPage('products');
                navigate('/products');
              }}
              onRetry={() => navigate(-1)}
            />
          }
        />
        {/* Fallback Route */}
        <Route path="*" element={<ErrorPage />}></Route>
      </Route>
    </Routes>
  );
}
