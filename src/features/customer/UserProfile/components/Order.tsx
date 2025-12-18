import type { Status } from "../types";
import { formatVND } from "../../../../components/ui/utils";

interface OrderProps {
    orderCode: string;
    orderDate: string;
    status: Status;
    items: { itemName: string }[];
    total: number;

}
export function Order({ orderCode, orderDate, status, items, total }: OrderProps) {
    const badgeColor = (() => {
        switch (status) {
            case "Processing": return "yellow";
            case "In Transit": return "blue";
            case "Delivered": return "green";
            case "Cancelled": return "red";
            default: return "gray";
        }
    })();
    const itemsList = items.map(item => item.itemName).join(", ");

    return (
        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4>Order #{orderCode}</h4>
                    <p className="text-sm text-muted-foreground">Placed on {orderDate}</p>
                </div>
                <span className={`px-3 py-1 bg-${badgeColor}-100 text-${badgeColor}-700 rounded-full text-sm`}>
                    {status}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                {itemsList}
            </p>
            <p className="mt-2">Total: {formatVND(total)}</p>
        </div>
    );
}