import { useEffect, useState } from "react";
import { Card } from "../../../components/ui/card";
import { Pagination } from "../../../components/Pagination";
import { toast } from "sonner";
import { getOrderList } from "./api";
import { Footer } from "../components";
import type { Order } from "./types";
import { Order as OrderComponent } from "./components/Order";

interface OrdersPageProps {
  onNavigateToFeedback: (orderId: string) => void;
}

const getStatusColor = (status: Order["orderStatus"]) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "In Transit":
      return "bg-blue-100 text-blue-700";
    case "Processing":
      return "bg-yellow-100 text-yellow-700";
    case "Pending":
      return "bg-gray-100 text-gray-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Failed":
      return "bg-red-100 text-red-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function OrdersPage({ onNavigateToFeedback }: OrdersPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination logic
  const totalOrders = orderList.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orderList.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getOrderList();
        console.log("Order response:", response);
        if (response.success) {
          setOrderList(response.data || []);
        } else {
          toast.error(`Get order list failed: ${response.message}`);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">My Orders</h2>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8">
              <p className="text-center text-gray-500">Loading orders...</p>
            </Card>
          ) : paginatedOrders.length === 0 ? (
            <Card className="p-8">
              <p className="text-center text-gray-500">No orders found</p>
            </Card>
          ) : (
            paginatedOrders.map((order) => (
              <OrderComponent
                key={order.id}
                order={order}
                getStatusColor={getStatusColor}
                getPaymentStatusColor={getPaymentStatusColor}
                onNavigateToFeedback={onNavigateToFeedback}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalOrders}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
