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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ComposedChart,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  AlertTriangle,
  Plus,
  Download,
  Building,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  mockProfitData,
  getDataByLocation,
  getDataByDateRange,
  aggregateDataByPeriod,
  getSpecificDayData,
  getSpecificWeekData,
  getSpecificMonthData,
  getAvailableDates,
  getAvailableWeeks,
  getAvailableMonths,
  calculateDailyRentalCost,
  type ProfitData,
} from "@/data/mockProfitData";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function CostsPage() {
  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );
  console.log(selectedLocation);
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [summaryData, setSummaryData] = useState<ProfitData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfitData();
    initializeSelectedPeriod();
  }, [selectedLocation, timeFilter]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchSummaryData();
    }
  }, [selectedLocation, timeFilter, selectedPeriod]);

  const initializeSelectedPeriod = () => {
    let availablePeriods: string[] = [];

    switch (timeFilter) {
      case "day":
        availablePeriods = getAvailableDates(selectedLocation);
        break;
      case "week":
        availablePeriods = getAvailableWeeks(selectedLocation);
        break;
      case "month":
        availablePeriods = getAvailableMonths(selectedLocation);
        break;
    }

    if (availablePeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(availablePeriods[availablePeriods.length - 1]); // Select latest period
    }
  };

  const fetchProfitData = () => {
    setLoading(true);
    try {
      const rawData = getDataByDateRange(selectedLocation, 30);
      const aggregatedData = aggregateDataByPeriod(rawData, timeFilter);
      setProfitData(aggregatedData);
    } catch (error) {
      console.error("Error fetching profit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = () => {
    try {
      let data: ProfitData | null = null;

      switch (timeFilter) {
        case "day":
          data = getSpecificDayData(selectedLocation, selectedPeriod);
          if (data) {
            // Calculate daily rental cost
            data = {
              ...data,
              rentalCost: calculateDailyRentalCost(data.rentalCost * 30), // Convert back to daily
            };
          }
          break;
        case "week":
          data = getSpecificWeekData(selectedLocation, selectedPeriod);
          break;
        case "month":
          data = getSpecificMonthData(selectedLocation, selectedPeriod);
          break;
      }

      setSummaryData(data);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setSummaryData(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate current metrics from profit data
  const currentMetrics =
    profitData.length > 0
      ? {
          totalProfit: profitData.reduce((sum, item) => sum + item.profit, 0),
          totalSales: profitData.reduce((sum, item) => sum + item.sales, 0),
          totalLabourCost: profitData.reduce(
            (sum, item) => sum + item.labourCost,
            0
          ),
          totalIngredientsCost: profitData.reduce(
            (sum, item) => sum + item.ingredientsCost,
            0
          ),
          totalRentalCost: profitData.reduce(
            (sum, item) => sum + item.rentalCost,
            0
          ),
        }
      : {
          totalProfit: 0,
          totalSales: 0,
          totalLabourCost: 0,
          totalIngredientsCost: 0,
          totalRentalCost: 0,
        };

  const profitMargin =
    currentMetrics.totalSales > 0
      ? (currentMetrics.totalProfit / currentMetrics.totalSales) * 100
      : 0;

  const getLocationDisplayName = (location: string) => {
    switch (location) {
      case "all":
        return "All Locations";
      case "d260bb7d-752b-45f3-b3f8-1a51a6ac109b":
        return "Downtown";
      case "d3d142b2-87d8-4b4c-bdd9-9627d0a05cdc":
        return "Uptown";
      default:
        return location;
    }
  };

  const formatDateRange = (
    period: string,
    filter: "day" | "week" | "month"
  ) => {
    if (!period) return "";

    switch (filter) {
      case "day":
        return new Date(period).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const weekStart = new Date(period);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "month":
        const [year, month] = period.split("-");
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
          }
        );
      default:
        return period;
    }
  };

  const getAvailablePeriodsForFilter = () => {
    switch (timeFilter) {
      case "day":
        return getAvailableDates(selectedLocation);
      case "week":
        return getAvailableWeeks(selectedLocation);
      case "month":
        return getAvailableMonths(selectedLocation);
      default:
        return [];
    }
  };

  // Chart data for profit trends
  const chartData = profitData.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(timeFilter === "month" && { year: "numeric" }),
    }),
    sales: item.sales,
    labourCost: item.labourCost,
    ingredientsCost: item.ingredientsCost,
    rentalCost: item.rentalCost,
    profit: item.profit,
    totalCosts: item.labourCost + item.ingredientsCost + item.rentalCost,
  }));

  // Cost breakdown data
  const costBreakdownData =
    currentMetrics.totalSales > 0
      ? [
          {
            name: "Labour Costs",
            value:
              (currentMetrics.totalLabourCost / currentMetrics.totalSales) *
              100,
            amount: currentMetrics.totalLabourCost,
            color: "#0088FE",
          },
          {
            name: "Ingredients Costs",
            value:
              (currentMetrics.totalIngredientsCost /
                currentMetrics.totalSales) *
              100,
            amount: currentMetrics.totalIngredientsCost,
            color: "#00C49F",
          },
          {
            name: "Rental Costs",
            value:
              (currentMetrics.totalRentalCost / currentMetrics.totalSales) *
              100,
            amount: currentMetrics.totalRentalCost,
            color: "#FFBB28",
          },
          {
            name: "Profit",
            value: profitMargin,
            amount: currentMetrics.totalProfit,
            color: "#10B981",
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profit Analysis</h1>
          <p className="text-muted-foreground">
            Track daily profit and analyze cost components for
            {getLocationDisplayName(selectedLocation)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeFilter}
            onValueChange={(value: "day" | "week" | "month") => {
              setTimeFilter(value);
              setSelectedPeriod(""); // Reset selected period when filter changes
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={`Select ${timeFilter}`} />
            </SelectTrigger>
            <SelectContent>
              {getAvailablePeriodsForFilter().map((period) => (
                <SelectItem key={period} value={period}>
                  {formatDateRange(period, timeFilter)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      {summaryData && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}{" "}
                  Summary
                </CardTitle>
                <CardDescription className="text-lg font-medium">
                  {formatDateRange(selectedPeriod, timeFilter)}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {summaryData.profit >= 0 ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">PROFIT</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                    <TrendingDown className="h-5 w-5" />
                    <span className="font-semibold">LOSS</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Sales (Income)
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summaryData.sales)}
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Labour Cost
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summaryData.labourCost)}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Ingredients Cost
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summaryData.ingredientsCost)}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Rental Cost
                  {timeFilter === "day" && (
                    <span className="text-xs block">(Daily Rate)</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summaryData.rentalCost)}
                </div>
              </div>
              <div
                className={`text-center p-4 rounded-lg ${
                  summaryData.profit >= 0
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-red-50 border-2 border-red-200"
                }`}
              >
                <div className="text-sm text-muted-foreground mb-1">
                  Net Result
                </div>
                <div
                  className={`text-3xl font-bold ${
                    summaryData.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(summaryData.profit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Profit"
          value={formatCurrency(currentMetrics.totalProfit)}
          change={
            profitData.length >= 2
              ? ((profitData[profitData.length - 1]?.profit -
                  profitData[profitData.length - 2]?.profit) /
                  profitData[profitData.length - 2]?.profit) *
                  100 || 0
              : 0
          }
          changeLabel={`vs previous ${timeFilter}`}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          change={0}
          changeLabel="of total sales"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Sales"
          value={formatCurrency(currentMetrics.totalSales)}
          change={
            profitData.length >= 2
              ? ((profitData[profitData.length - 1]?.sales -
                  profitData[profitData.length - 2]?.sales) /
                  profitData[profitData.length - 2]?.sales) *
                  100 || 0
              : 0
          }
          changeLabel={`vs previous ${timeFilter}`}
          icon={<Building className="h-4 w-4 text-blue-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Costs"
          value={formatCurrency(
            currentMetrics.totalLabourCost +
              currentMetrics.totalIngredientsCost +
              currentMetrics.totalRentalCost
          )}
          change={0}
          changeLabel="labour + ingredients + rental"
          icon={<Package className="h-4 w-4 text-red-600" />}
          loading={loading}
        />
      </div>

      <Tabs defaultValue="profit-analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profit-analysis">Profit Analysis</TabsTrigger>
          <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-analysis" className="space-y-6">
          {/* Daily Profit Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Profit Analysis - {getLocationDisplayName(selectedLocation)}
              </CardTitle>
              <CardDescription>
                Daily profit calculation: Sales - (Labour Cost + Ingredients
                Cost + Rental Cost)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === "sales"
                        ? "Sales"
                        : name === "profit"
                        ? "Profit"
                        : name === "totalCosts"
                        ? "Total Costs"
                        : name,
                    ]}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" name="sales" />
                  <Bar dataKey="totalCosts" fill="#EF4444" name="totalCosts" />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="profit"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Components Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost Breakdown</CardTitle>
              <CardDescription>
                {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}{" "}
                breakdown of all cost components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Labour Cost</TableHead>
                    <TableHead>Ingredients Cost</TableHead>
                    <TableHead>Rental Cost</TableHead>
                    <TableHead>Total Costs</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitData.slice(-10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(item.sales)}</TableCell>
                      <TableCell>{formatCurrency(item.labourCost)}</TableCell>
                      <TableCell>
                        {formatCurrency(item.ingredientsCost)}
                      </TableCell>
                      <TableCell>{formatCurrency(item.rentalCost)}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          item.labourCost +
                            item.ingredientsCost +
                            item.rentalCost
                        )}
                      </TableCell>
                      <TableCell
                        className={
                          item.profit >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {formatCurrency(item.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-breakdown" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cost Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>
                  Percentage breakdown of costs vs sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdownData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {item.value.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: item.color,
                            width: `${Math.min(item.value, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
                <CardDescription>
                  Total amounts for {getLocationDisplayName(selectedLocation)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Sales</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(currentMetrics.totalSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Labour Costs</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(currentMetrics.totalLabourCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Ingredients Costs</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(currentMetrics.totalIngredientsCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Rental Costs</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {formatCurrency(currentMetrics.totalRentalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-medium">Net Profit</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(currentMetrics.totalProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Profit Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Trends</CardTitle>
              <CardDescription>
                Track profit trends over time for{" "}
                {getLocationDisplayName(selectedLocation)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Profit"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Components Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Components Trend</CardTitle>
              <CardDescription>
                Track individual cost components over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="labourCost"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Labour Cost"
                  />
                  <Line
                    type="monotone"
                    dataKey="ingredientsCost"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Ingredients Cost"
                  />
                  <Line
                    type="monotone"
                    dataKey="rentalCost"
                    stroke="#FFBB28"
                    strokeWidth={2}
                    name="Rental Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
