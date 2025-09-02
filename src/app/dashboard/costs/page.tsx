"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Download,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function CostsPage() {
  const [costData, setCostData] = useState({
    foodCostPercentage: 28.5,
    laborCostPercentage: 32.1,
    totalCosts: 45680,
    costTrend: 2.3,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching cost data:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const costBreakdownData = [
    { name: "Food Costs", value: 28.5, amount: 13024, color: "#0088FE" },
    { name: "Labor Costs", value: 32.1, color: "#00C49F" },
    { name: "Rent & Utilities", value: 15.2, color: "#FFBB28" },
    { name: "Marketing", value: 4.8, color: "#FF8042" },
    { name: "Other", value: 19.4, color: "#8884D8" },
  ];

  const foodCostTrendData = [
    { month: "Jan", percentage: 26.8, amount: 12100 },
    { month: "Feb", percentage: 27.5, amount: 12450 },
    { month: "Mar", percentage: 28.1, amount: 12780 },
    { month: "Apr", percentage: 29.2, amount: 13200 },
    { month: "May", percentage: 28.5, amount: 13024 },
  ];

  const topExpensiveItems = [
    { name: "Premium Beef", cost: "$2,450", percentage: 18.8, trend: 5.2 },
    { name: "Fresh Seafood", cost: "$1,890", percentage: 14.5, trend: -2.1 },
    {
      name: "Organic Vegetables",
      cost: "$1,650",
      percentage: 12.7,
      trend: 8.3,
    },
    { name: "Dairy Products", cost: "$1,420", percentage: 10.9, trend: 3.4 },
    { name: "Specialty Oils", cost: "$980", percentage: 7.5, trend: -1.2 },
  ];

  const laborCostData = [
    { role: "Kitchen Staff", hours: 320, cost: 4800, rate: 15 },
    { role: "Servers", hours: 280, cost: 3920, rate: 14 },
    { role: "Management", hours: 160, cost: 4800, rate: 30 },
    { role: "Cleaning", hours: 80, cost: 960, rate: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cost Management</h1>
          <p className="text-muted-foreground">
            Track and optimize your restaurant costs and profitability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Food Cost %"
          value={`${costData.foodCostPercentage}%`}
          change={1.2}
          changeLabel="vs last month"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Labor Cost %"
          value={`${costData.laborCostPercentage}%`}
          change={-0.8}
          changeLabel="vs last month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Costs"
          value={formatCurrency(costData.totalCosts)}
          change={costData.costTrend}
          changeLabel="vs last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Cost Alerts"
          value="3"
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          loading={loading}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="food-costs">Food Costs</TabsTrigger>
          <TabsTrigger value="labor-costs">Labor Costs</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>
                  Distribution of costs by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {costBreakdownData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="secondary">{item.value}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Food Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Food Cost Trend</CardTitle>
                <CardDescription>
                  Monthly food cost percentage and amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={foodCostTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar
                      yAxisId="right"
                      dataKey="amount"
                      fill="#8884d8"
                      opacity={0.3}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="percentage"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Alerts</CardTitle>
              <CardDescription>
                Items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">
                        Food cost exceeding target
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: 28.5% | Target: 25%
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300"
                  >
                    High Priority
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Premium Beef cost spike</div>
                      <div className="text-sm text-muted-foreground">
                        5.2% increase from last month
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-300"
                  >
                    Medium Priority
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="food-costs" className="space-y-6">
          {/* Top Expensive Items */}
          <Card>
            <CardHeader>
              <CardTitle>Most Expensive Ingredients</CardTitle>
              <CardDescription>
                Ingredients with highest cost impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                    <TableHead>% of Food Cost</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topExpensiveItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.cost}</TableCell>
                      <TableCell>{item.percentage}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.trend > 0 ? "destructive" : "default"}
                        >
                          {item.trend > 0 ? "+" : ""}
                          {item.trend}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor-costs" className="space-y-6">
          {/* Labor Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Labor Cost by Role</CardTitle>
              <CardDescription>
                Monthly labor costs broken down by staff role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laborCostData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.role}</TableCell>
                      <TableCell>{item.hours}</TableCell>
                      <TableCell>{formatCurrency(item.rate)}</TableCell>
                      <TableCell>{formatCurrency(item.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          {/* Recipe Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Cost Analysis</CardTitle>
              <CardDescription>
                Cost breakdown for your menu items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Recipe Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage recipes to track ingredient costs and
                  optimize menu pricing.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
