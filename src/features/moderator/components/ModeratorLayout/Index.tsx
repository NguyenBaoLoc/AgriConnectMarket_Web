import {
  Warehouse,
  AlertTriangle,
  DollarSign,
  LogOut,
  User,
  Leaf,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { removeCredentials } from '../../../../utils/credentialsSettings';

type Tab = 'farms' | 'reports' | 'transactions';

export const ModeratorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ derive active tab from URL
  const activeTab: Tab = location.pathname.includes('reports')
    ? 'reports'
    : location.pathname.includes('transactions')
    ? 'transactions'
    : 'farms';

  const onNavigateToProfile = () => {
    navigate('/moderator/profile');
  };

  const onNavigateToPage = (id: Tab) => {
    navigate(`/moderator/${id}`);
  };

  const onLogout = () => {
    removeCredentials();
    navigate('/');
  };

  const navItems = [
    { id: 'farms' as Tab, label: 'Farm Management', icon: Warehouse },
    { id: 'reports' as Tab, label: 'Report Management', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-green-700">AgriConnect Market Moderator</h1>
              <p className="text-sm text-muted-foreground">
                Management Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onNavigateToProfile}>
              <User className="h-5 w-5 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
