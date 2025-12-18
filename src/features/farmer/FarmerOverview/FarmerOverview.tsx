import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "../../../components/ui/card";
import { formatVND } from "../../../components/ui/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { API } from "../../../api";
import { DollarSign, Users, Package } from "lucide-react";

interface RevenueData {
  month: string;
  amount: number;
}

interface Customer {
  customerId: string;
  email: string;
  fullname: string;
}

interface TopCustomer {
  customer: Customer;
  amount: number;
}

interface Product {
  productId: string;
  productName: string;
}

interface TopProduct {
  product: Product;
  amount: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function FarmerOverview() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmAndData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const storedFarmId = localStorage.getItem("farmId");

        if (!token) {
          throw new Error("No authentication token found");
        }

        if (storedFarmId) {
          await fetchOverviewData(storedFarmId, token, parseInt(selectedYear));
        } else {
          // Fetch farm from API if not in localStorage
          const farmApi = axios.create({
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const farmResponse = await farmApi.get(API.farm.me);
          const farm = farmResponse.data.data;

          if (farm && farm.farmId) {
            localStorage.setItem("farmId", farm.farmId);
            await fetchOverviewData(farm.farmId, token, parseInt(selectedYear));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while loading overview data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFarmAndData();
  }, [selectedYear]);

  const fetchOverviewData = async (farmId: string, token: string, year: number) => {
    const api = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    try {
      // Fetch revenue data
      const revenueResponse = await api.get(
        `${API.base}/farms/${farmId}/revenue?year=${year}`
      );
      if (revenueResponse.data.success) {
        const monthlyData = revenueResponse.data.data.map((item: RevenueData) => ({
          month: new Date(2024, parseInt(item.month) - 1).toLocaleString(
            "default",
            { month: "short" }
          ),
          amount: item.amount,
        }));
        setRevenueData(monthlyData);
      }

      // Fetch top customers
      const customersResponse = await api.get(
        `${API.base}/farms/${farmId}/top-customers`
      );
      if (customersResponse.data.success) {
        setTopCustomers(customersResponse.data.data);
      }

      // Fetch top products
      const productsResponse = await api.get(
        `${API.base}/farms/${farmId}/top-products`
      );
      if (productsResponse.data.success) {
        setTopProducts(productsResponse.data.data);
      }
    } catch (err) {
      console.error("Error fetching overview data:", err);
      throw err;
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalCustomers = topCustomers.length;
  const totalProducts = topProducts.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Year:</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700">
                {formatVND(totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-2">This year</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Customers</p>
              <p className="text-3xl font-bold text-blue-700">{totalCustomers}</p>
              <p className="text-xs text-blue-600 mt-2">Tracked this year</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Users className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Products</p>
              <p className="text-3xl font-bold text-purple-700">{totalProducts}</p>
              <p className="text-xs text-purple-600 mt-2">Best sellers</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Package className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => `₫${(value as number).toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Customers
          </h2>
          {topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((item, index) => (
                    <TableRow key={item.customer.customerId}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        {item.customer.fullname}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.customer.email}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {item.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No customer data available
            </p>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Products</h2>
          {topProducts.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topProducts as Array<{product: Product; amount: number}>}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {topProducts.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value} units`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {topProducts.map((item, index) => (
                  <div key={item.product.productId} className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-sm text-gray-700 flex-1">
                      {item.product.productName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.amount} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No product data available
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
