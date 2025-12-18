import { Calendar, Leaf, LogOut, Package, ShoppingBag, User, Warehouse, BarChart3 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FarmRequiredDialog } from "../FarmRequiredDialog";
import { useFarmCheck } from "../../../../hooks/useFarmCheck";

type Tab = "overview" | "orders" | "products" | "product-batches" | "seasons" | "farms";

export function FarmerLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasFarmId } = useFarmCheck();
    const [showFarmRequiredDialog, setShowFarmRequiredDialog] = useState(false);

    const userRole = localStorage.getItem("role");

    const segments = location.pathname.split("/");
    const activeTab = segments[segments.length - 1] as Tab;

    // Tabs that require a valid farm ID
    const farmRequiredTabs: Tab[] = ["overview", "orders", "products", "product-batches", "seasons"];

    function onNavigateToProfile() {
        navigate("/farmer/profile");
    }
    function onNavigateToTab(tab: Tab) {
        // Check if the tab requires farm ID
        if (farmRequiredTabs.includes(tab) && !hasFarmId()) {
            setShowFarmRequiredDialog(true);
            return;
        }
        navigate(`/farmer/${tab}`);
    }
    function onLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("farmId");
        navigate("/");
        window.location.reload();
    }

    const [navItems, setNavItems] = useState<any[]>([
        { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
        { id: "farms" as Tab, label: "Manage Farm", icon: Warehouse },
        { id: "seasons" as Tab, label: "Manage Season", icon: Calendar },
        { id: "product-batches" as Tab, label: "Manage Batches", icon: Warehouse },
        { id: "orders" as Tab, label: "Orders", icon: ShoppingBag },
    ]);

    useEffect(() => {
        const baseItems = [
            { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
            { id: "farms" as Tab, label: "Manage Farm", icon: Warehouse },
            { id: "seasons" as Tab, label: "Manage Season", icon: Calendar },
            { id: "product-batches" as Tab, label: "Manage Batches", icon: Warehouse },
            { id: "orders" as Tab, label: "Orders", icon: ShoppingBag },
        ];
        if(userRole === "Admin") {
            setNavItems([...baseItems, { id: "products" as Tab, label: "Products", icon: Package }]);
        } else {
            setNavItems(baseItems);
        }
    }, [userRole])

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
                            <h1 className="text-green-700">AgriConnect Farmer</h1>
                            <p className="text-sm text-muted-foreground">Farm Management Dashboard</p>
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
                                    onClick={() => onNavigateToTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
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
                {/* Main Content */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>

            {/* Farm Required Dialog */}
            <FarmRequiredDialog
                open={showFarmRequiredDialog}
                onOpenChange={setShowFarmRequiredDialog}
                onNavigateToFarmManagement={() => navigate("/farmer/farms")}
            />
        </div>
    );
}