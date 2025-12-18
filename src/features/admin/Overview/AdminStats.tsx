import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { API } from "../../../api";

interface UserStats {
  role: string;
  amount: number;
}

interface ProductCategoryStats {
  category: string;
  amount: number;
}

export function AdminStats() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [productStats, setProductStats] = useState<ProductCategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, productsRes] = await Promise.all([
        axios.get(API.stats.users, { headers }),
        axios.get(API.stats.productPerCategory, { headers }),
      ]);

      if (usersRes.data.success) {
        setUserStats(usersRes.data.data);
      }
      if (productsRes.data.success) {
        setProductStats(productsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const USER_ROLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const PRODUCT_CATEGORY_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitor users and products across your platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users by Role Report */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userStats && userStats.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={userStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, amount, percent }: any) =>
                        `${role}: ${amount} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {userStats.map((entry, index) => (
                        <Cell
                          key={`user-cell-${index}`}
                          fill={USER_ROLE_COLORS[index % USER_ROLE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} users`} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Summary Table */}
                <div className="mt-6 space-y-3">
                  {userStats.map((stat, index) => (
                    <div
                      key={`user-summary-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: USER_ROLE_COLORS[index % USER_ROLE_COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-700">{stat.role}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stat.amount}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-semibold text-green-700">Total Users</span>
                    <span className="text-lg font-bold text-green-700">
                      {userStats.reduce((sum, stat) => sum + stat.amount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products by Category Report */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>
              Number of products available in each category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productStats && productStats.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={productStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} products`} />
                    <Bar
                      dataKey="amount"
                      fill="#10b981"
                      name="Products"
                      radius={[12, 12, 0, 0]}
                      fill="#10b981"
                    >
                      {productStats.map((entry, index) => (
                        <Cell
                          key={`product-cell-${index}`}
                          fill={PRODUCT_CATEGORY_COLORS[index % PRODUCT_CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Summary Table */}
                <div className="mt-6 space-y-3">
                  {productStats.map((stat, index) => (
                    <div
                      key={`product-summary-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: PRODUCT_CATEGORY_COLORS[index % PRODUCT_CATEGORY_COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-700">{stat.category}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stat.amount}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-semibold text-green-700">Total Products</span>
                    <span className="text-lg font-bold text-green-700">
                      {productStats.reduce((sum, stat) => sum + stat.amount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
