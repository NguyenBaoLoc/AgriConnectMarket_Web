import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import type { Order, Status } from "../types";
import { Order as OrderComponent } from "./Order";
interface OrderHistoryProps {
  orderList: Order[];
  onNavigateToOrders: () => void;
}
export function OrderHistory({
  orderList,
  onNavigateToOrders,
}: OrderHistoryProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your order history and tracking</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={onNavigateToOrders}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            View All Orders
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
