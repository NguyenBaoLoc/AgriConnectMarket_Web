import { useState } from "react";
import { Bell, Package, Truck, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Footer } from "../components";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: "order" | "delivery" | "promotion" | "system";
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export function NotificationPage() {
    const [filter, setFilter] = useState<string>("all");
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "delivery",
            title: "Order Delivered",
            message: "Your order #ORD-2025-1001 has been delivered successfully.",
            date: "2025-11-05",
            read: false,
        },
        {
            id: "2",
            type: "order",
            title: "Order Confirmed",
            message: "Your order #ORD-2025-1002 has been confirmed and is being prepared.",
            date: "2025-11-04",
            read: false,
        },
        {
            id: "3",
            type: "delivery",
            title: "Out for Delivery",
            message: "Your order #ORD-2025-0998 is out for delivery and will arrive soon.",
            date: "2025-11-03",
            read: true,
        },
        {
            id: "4",
            type: "promotion",
            title: "Special Offer",
            message: "Get 20% off on all organic vegetables this week!",
            date: "2025-11-02",
            read: true,
        },
        {
            id: "5",
            type: "system",
            title: "Profile Updated",
            message: "Your profile information has been updated successfully.",
            date: "2025-11-01",
            read: true,
        },
        {
            id: "6",
            type: "order",
            title: "Order Shipped",
            message: "Your order #ORD-2025-0995 has been shipped. Track your order for updates.",
            date: "2025-10-30",
            read: true,
        },
    ]);

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "order":
                return <Package className="h-5 w-5 text-blue-600" />;
            case "delivery":
                return <Truck className="h-5 w-5 text-green-600" />;
            case "promotion":
                return <Bell className="h-5 w-5 text-purple-600" />;
            case "system":
                return <AlertCircle className="h-5 w-5 text-orange-600" />;
        }
    };

    const getTypeColor = (type: Notification["type"]) => {
        switch (type) {
            case "order":
                return "bg-blue-100 text-blue-800";
            case "delivery":
                return "bg-green-100 text-green-800";
            case "promotion":
                return "bg-purple-100 text-purple-800";
            case "system":
                return "bg-orange-100 text-orange-800";
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        return notification.type === filter;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true }))
        );
        toast.success("All notifications marked as read");
    };

    const handleDelete = (id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        toast.success("Notification deleted");
    };

    const handleClearAll = () => {
        setNotifications([]);
        toast.success("All notifications cleared");
    };

    return (
        <div>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Headline */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-gray-900 mb-2">Notifications</h1>
                        <p className="text-muted-foreground">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                                : "You're all caught up!"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" onClick={handleMarkAllAsRead}>
                                Mark All as Read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="outline" onClick={handleClearAll}>
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter notifications" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Notifications</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="order">Orders</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="promotion">Promotions</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`p-4 ${!notification.read ? "bg-green-50 border-green-200" : ""}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p>{notification.title}</p>
                                                    {!notification.read && (
                                                        <div className="h-2 w-2 rounded-full bg-green-600" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                            </div>
                                            <Badge className={getTypeColor(notification.type)} variant="secondary">
                                                {notification.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">{notification.date}</p>
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No notifications to display</p>
                    </Card>
                )}
            </div>
            <Footer />
        </div>
    );
}
