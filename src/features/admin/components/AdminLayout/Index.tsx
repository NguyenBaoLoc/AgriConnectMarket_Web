import {
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  User,
  Users,
  Warehouse,
  Tag,
  Package,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { use, useState } from "react";

type Tab = "overview" | "farms" | "users" | "categories" | "products" | "reports" | "event-types";

export const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const navigate = useNavigate();

  const onNavigateToProfile = () => {
    navigate("/admin/profile");
  };

  const onNavigateToPage = (id: Tab) => {
    if (id === "overview") {
      navigate("/admin");
    } else if (id === "farms") {
      navigate("/admin/farms");
    } else if (id === "users") {
      navigate("/admin/users");
    } else if (id === "categories") {
      navigate("/admin/categories");
    } else if (id === "products") {
      navigate("/admin/products");
    } else if (id === "reports") {
      navigate("/admin/reports");
    } else if (id === "event-types") {
      navigate("/admin/event-types");
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };

  const navItems = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "farms" as Tab, label: "Farms", icon: Warehouse },
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "event-types" as Tab, label: "Event Types", icon: Calendar },
    { id: "categories" as Tab, label: "Categories", icon: Tag },
    { id: "products" as Tab, label: "Products", icon: Package },
    { id: "reports" as Tab, label: "Reports", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-green-700">AgriConnect Market Admin</h1>
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
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateToPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
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
