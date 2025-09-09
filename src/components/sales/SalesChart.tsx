"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  DailySalesData,
  HourlySalesData,
  ChannelDistribution,
  formatCurrency,
  formatPercentage,
} from "@/lib/salesAnalytics";

interface SalesChartProps {
  data: DailySalesData[];
  onDataPointClick?: (data: DailySalesData) => void;
  showGrowth?: boolean;
  height?: number;
}

export function SalesTrendChart({
  data,
  onDataPointClick,
  showGrowth = true,
  height = 300,
}: SalesChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [dataType, setDataType] = useState<"revenue" | "profit">("revenue");

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const enrichedData = data.map((item, index) => {
    const previousItem = index > 0 ? data[index - 1] : null;
    const revenueGrowth = previousItem
      ? calculateGrowth(item.sales, previousItem.sales)
      : 0;
    const profitGrowth = previousItem
      ? calculateGrowth(item.profit, previousItem.profit)
      : 0;

    return {
      ...item,
      revenueGrowth,
      profitGrowth,
      growth: dataType === "profit" ? profitGrowth : revenueGrowth,
      displayValue: dataType === "profit" ? item.profit : item.sales,
      formattedDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{data.dayOfWeek}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-blue-600">
                {dataType === "profit" ? "Profit:" : "Sales:"}
              </span>{" "}
              {formatCurrency(data.displayValue)}
            </p>
            {dataType === "profit" && (
              <p className="text-sm">
                <span className="text-orange-600">Revenue:</span>{" "}
                {formatCurrency(data.sales)}
              </p>
            )}
            <p className="text-sm">
              <span className="text-green-600">Orders:</span> {data.orders}
            </p>
            <p className="text-sm">
              <span className="text-purple-600">
                {dataType === "profit" ? "Margin:" : "AOV:"}
              </span>{" "}
              {dataType === "profit"
                ? `${data.profitMargin.toFixed(1)}%`
                : formatCurrency(data.averageOrderValue)}
            </p>
            {showGrowth && data.growth !== 0 && (
              <p className="text-sm flex items-center gap-1">
                {data.growth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    data.growth > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatPercentage(data.growth)} vs prev day
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDataPointClick = (data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: enrichedData,
      onClick: handleDataPointClick,
      style: { cursor: onDataPointClick ? "pointer" : "default" },
    };

    switch (chartType) {
      case "bar":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="displayValue"
              fill="#3b82f6"
              opacity={0.8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
            />
          </ComposedChart>
        );
      case "area":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="displayValue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
            />
          </ComposedChart>
        );
      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="displayValue"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
            />
          </ComposedChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {dataType === "profit" ? "Profitability Trend" : "Sales Trend"}
            </CardTitle>
            <CardDescription>
              {dataType === "profit"
                ? "Daily profit performance and margins"
                : "Daily sales performance and order volume"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-2">
              <Button
                variant={dataType === "revenue" ? "default" : "outline"}
                size="sm"
                onClick={() => setDataType("revenue")}
              >
                Revenue
              </Button>
              <Button
                variant={dataType === "profit" ? "default" : "outline"}
                size="sm"
                onClick={() => setDataType("profit")}
              >
                Profit
              </Button>
            </div>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("area")}
            >
              <AreaChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-muted-foreground">Sales ($)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-muted-foreground">Orders (#)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HourlyHeatmapProps {
  data: HourlySalesData[];
  onHourClick?: (data: HourlySalesData) => void;
}

export function HourlyHeatmap({ data, onHourClick }: HourlyHeatmapProps) {
  const maxSales = Math.max(...data.map((d) => d.sales));

  const getIntensity = (sales: number) => {
    return sales / maxSales;
  };

  const getColorClass = (intensity: number) => {
    if (intensity >= 0.8) return "bg-red-500";
    if (intensity >= 0.6) return "bg-orange-500";
    if (intensity >= 0.4) return "bg-yellow-500";
    if (intensity >= 0.2) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Sales Heatmap</CardTitle>
        <CardDescription>Sales intensity throughout the day</CardDescription>
      </CardHeader>
      <CardContent
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourData = data.find((d) => d.hour === hour);
            const sales = hourData?.sales || 0;
            const intensity = getIntensity(sales);

            return (
              <div
                key={hour}
                className={`
                  aspect-square rounded-md flex items-center justify-center text-sm font-medium text-white cursor-pointer
                  transition-all hover:scale-110 hover:shadow-lg
                  ${sales > 0 ? getColorClass(intensity) : "bg-gray-200"}
                `}
                style={{
                  opacity: sales > 0 ? Math.max(0.3, intensity) : 0.1,
                  minWidth: "32px",
                  minHeight: "32px",
                }}
                onClick={() => hourData && onHourClick?.(hourData)}
                title={`${
                  hourData?.hourLabel || `${hour}:00`
                }: ${formatCurrency(sales)}`}
              >
                {hour}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>12 AM</span>
          <span>Peak Hours</span>
          <span>11 PM</span>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded opacity-30" />
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded opacity-60" />
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded opacity-90" />
            <span className="text-xs">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChannelPieChartProps {
  data: ChannelDistribution[];
  onChannelClick?: (data: ChannelDistribution) => void;
}

export function ChannelPieChart({
  data,
  onChannelClick,
}: ChannelPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium capitalize">{data.channel}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">Sales: {formatCurrency(data.sales)}</p>
            <p className="text-sm">Orders: {data.orders}</p>
            <p className="text-sm">Share: {data.percentage.toFixed(1)}%</p>
            <p className="text-sm">
              AOV: {formatCurrency(data.averageOrderValue)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Channel Distribution</CardTitle>
        <CardDescription>Sales breakdown by order type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="sales"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={(data) => onChannelClick?.(data)}
                style={{ cursor: onChannelClick ? "pointer" : "default" }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? "#374151" : "none"}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.map((channel, index) => (
            <div
              key={channel.channel}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onChannelClick?.(channel)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <div>
                  <div className="font-medium capitalize">
                    {channel.channel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {channel.orders} orders
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(channel.sales)}
                </div>
                <Badge variant="secondary">
                  {channel.percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface HourlySalesBarChartProps {
  data: HourlySalesData[];
  onBarClick?: (data: HourlySalesData) => void;
}

export function HourlySalesBarChart({
  data,
  onBarClick,
}: HourlySalesBarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">Sales: {formatCurrency(data.sales)}</p>
            <p className="text-sm">Orders: {data.orders}</p>
            <p className="text-sm">
              AOV: {formatCurrency(data.averageOrderValue)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Sales Pattern</CardTitle>
        <CardDescription>Sales distribution throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            onClick={(data) => onBarClick?.(data.activePayload?.[0]?.payload)}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hourLabel" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
