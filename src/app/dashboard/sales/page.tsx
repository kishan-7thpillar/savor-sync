"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingDown,
} from "lucide-react";

// Import our new components and utilities
import {
  SalesTrendChart,
  HourlyHeatmap,
  ChannelPieChart,
  HourlySalesBarChart,
} from "@/components/sales/SalesChart";
import {
  SalesFiltersPanel,
  QuickFilters,
  SalesFilters,
} from "@/components/sales/SalesFilters";
import { SalesInsights } from "@/components/sales/SalesInsights";
import { DrillDownModal } from "@/components/sales/DrillDownModal";

import {
  calculateSalesMetrics,
  calculateGrowthMetrics,
  getDailySalesData,
  getHourlySalesData,
  getChannelDistribution,
  getTopPerformingItems,
  getLocationPerformance,
  filterOrdersByDateRange,
  filterOrdersByChannel,
  getDateRangePresets,
  formatCurrency,
  formatPercentage,
  DateRange,
} from "@/lib/salesAnalytics";

import {
  mockSalesOrders,
  Order,
  getMockDataByLocation,
} from "@/data/mockSalesData";

export default function SalesPage() {
  // Get selected location from Redux store
  const selectedLocation = useAppSelector((state) => state.location.selectedLocation);
  
  // State management
  const [filters, setFilters] = useState<SalesFilters>({
    dateRange: getDateRangePresets().last7Days,
    locationIds: [],
    channels: [],
  });
  
  // Update filters when selected location changes
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      locationIds: selectedLocation === 'all' ? [] : [selectedLocation]
    }));
  }, [selectedLocation]);

  const [showFilters, setShowFilters] = useState(false);
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    orders: Order[];
    context?: any;
  }>({
    isOpen: false,
    title: "",
    orders: [],
  });

  // Memoized data processing
  const processedData = useMemo(() => {
    // Apply filters to get current period data
    let currentOrders = filterOrdersByDateRange(
      filters.dateRange,
      filters.locationIds
    );

    if (filters.channels.length > 0) {
      currentOrders = filterOrdersByChannel(currentOrders, filters.channels);
    }

    // Get previous period data for growth comparison
    const previousPeriodStart = new Date(filters.dateRange.startDate);
    const previousPeriodEnd = new Date(filters.dateRange.endDate);
    const periodLength =
      previousPeriodEnd.getTime() - previousPeriodStart.getTime();

    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

    let previousOrders = filterOrdersByDateRange(
      {
        startDate: previousPeriodStart,
        endDate: previousPeriodEnd,
        label: "Previous Period",
      },
      filters.locationIds
    );

    if (filters.channels.length > 0) {
      previousOrders = filterOrdersByChannel(previousOrders, filters.channels);
    }

    // Calculate all metrics
    const metrics = calculateSalesMetrics(currentOrders);
    const growthMetrics = calculateGrowthMetrics(
      currentOrders,
      previousOrders,
      "vs previous period"
    );
    const dailySalesData = getDailySalesData(currentOrders);
    const hourlySalesData = getHourlySalesData(currentOrders);
    const channelDistribution = getChannelDistribution(currentOrders);
    const topItems = getTopPerformingItems(currentOrders, 10);
    const locationPerformance = getLocationPerformance(currentOrders);

    // Find peak hour
    const peakHour = hourlySalesData.reduce(
      (peak, current) => (current.sales > peak.sales ? current : peak),
      { hour: 12, sales: 0, hourLabel: "12 PM" }
    );

    return {
      currentOrders,
      previousOrders,
      metrics,
      growthMetrics,
      dailySalesData,
      hourlySalesData,
      channelDistribution,
      topItems,
      locationPerformance,
      peakHour,
    };
  }, [filters]);

  // Event handlers
  const handleFiltersChange = (newFilters: SalesFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useMemo
    setShowFilters(false);
  };

  const handleQuickFilter = (
    filterType: "today" | "yesterday" | "thisWeek" | "thisMonth"
  ) => {
    const presets = getDateRangePresets();
    const dateRange = presets[filterType];

    if (dateRange) {
      setFilters((prev) => ({
        ...prev,
        dateRange,
        customDateRange: undefined,
      }));
    }
  };

  const handleDrillDown = (
    title: string,
    orders: Order[],
    description?: string,
    context?: any
  ) => {
    setDrillDownModal({
      isOpen: true,
      title,
      description,
      orders,
      context,
    });
  };

  const handleDataPointClick = (data: any, type: string) => {
    let filteredOrders: Order[] = [];
    let title = "";
    let description = "";

    switch (type) {
      case "daily":
        filteredOrders = processedData.currentOrders.filter((order) => {
          const orderDate = new Date(order.createdAt)
            .toISOString()
            .split("T")[0];
          return orderDate === data.date;
        });
        title = `Orders for ${new Date(data.date).toLocaleDateString()}`;
        description = `${filteredOrders.length} orders • ${formatCurrency(
          data.sales
        )} in sales`;
        break;

      case "hourly":
        filteredOrders = processedData.currentOrders.filter((order) => {
          const orderHour = new Date(order.createdAt).getHours();
          return orderHour === data.hour;
        });
        title = `Orders for ${data.hourLabel}`;
        description = `${filteredOrders.length} orders • ${formatCurrency(
          data.sales
        )} in sales`;
        break;

      case "channel":
        filteredOrders = processedData.currentOrders.filter(
          (order) => order.channel === data.channel
        );
        title = `${
          data.channel.charAt(0).toUpperCase() + data.channel.slice(1)
        } Orders`;
        description = `${filteredOrders.length} orders • ${formatCurrency(
          data.sales
        )} in sales`;
        break;
    }

    if (filteredOrders.length > 0) {
      handleDrillDown(title, filteredOrders, description, {
        type,
        value: data,
      });
    }
  };

  const handleExportData = () => {
    const csvData = processedData.currentOrders.map((order) => {
      // Calculate order profit
      const orderCost = order.items.reduce(
        (sum, item) => sum + item.menuItem.cost * item.quantity,
        0
      );
      const orderProfit = order.items.reduce(
        (sum, item) => sum + item.menuItem.profit * item.quantity,
        0
      );
      const profitMargin =
        order.subtotal > 0 ? (orderProfit / order.subtotal) * 100 : 0;

      return {
        "Order Number": order.orderNumber,
        Date: new Date(order.createdAt).toLocaleDateString(),
        Time: new Date(order.createdAt).toLocaleTimeString(),
        Location: order.locationName,
        Channel: order.channel,
        Items: order.items.length,
        Subtotal: order.subtotal.toFixed(2),
        Tax: order.taxAmount.toFixed(2),
        Discount: order.discountAmount.toFixed(2),
        Tip: order.tipAmount.toFixed(2),
        Total: order.totalAmount.toFixed(2),
        Cost: orderCost.toFixed(2),
        Profit: orderProfit.toFixed(2),
        "Profit Margin %": profitMargin.toFixed(1),
        "Payment Method": order.paymentMethod,
      };
    });

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-data-${filters.dateRange.label
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive sales performance and insights powered by mock data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(filters.locationIds.length > 0 ||
              filters.channels.length > 0) && (
              <Badge variant="secondary" className="ml-2">
                {filters.locationIds.length + filters.channels.length}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <QuickFilters
        onQuickFilter={handleQuickFilter}
        currentFilter={filters.dateRange.label
          .toLowerCase()
          .replace(/\s+/g, "")}
      />

      {/* Filters Panel */}
      {showFilters && (
        <SalesFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          totalOrders={mockSalesOrders.length}
          filteredOrders={processedData.currentOrders.length}
        />
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Sales"
          value={formatCurrency(processedData.metrics.totalSales)}
          change={processedData.growthMetrics.salesGrowth}
          changeLabel={processedData.growthMetrics.periodLabel}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={false}
        />
        <MetricsCard
          title="Total Orders"
          value={processedData.metrics.totalOrders.toLocaleString()}
          change={processedData.growthMetrics.orderGrowth}
          changeLabel={processedData.growthMetrics.periodLabel}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={false}
        />
        <MetricsCard
          title="Average Order Value"
          value={formatCurrency(processedData.metrics.averageOrderValue)}
          change={processedData.growthMetrics.aovGrowth}
          changeLabel={processedData.growthMetrics.periodLabel}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={false}
        />
        <MetricsCard
          title="Total Profit"
          value={formatCurrency(processedData.metrics.grossProfit)}
          change={processedData.metrics.profitMargin}
          changeLabel="Profit Margin"
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          loading={false}
        />
      </div>

      {/* Sales Trend Chart */}
      <SalesTrendChart
        data={processedData.dailySalesData}
        onDataPointClick={(data) => handleDataPointClick(data, "daily")}
        showGrowth={true}
        height={350}
      />

      {/* Channel Distribution and Hourly Sales Heatmap in one row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Channel Distribution */}
        <ChannelPieChart
          data={processedData.channelDistribution}
          onChannelClick={(data) => handleDataPointClick(data, "channel")}
        />
        
        {/* Hourly Sales Heatmap */}
        <HourlyHeatmap
          data={processedData.hourlySalesData}
          onHourClick={(data) => handleDataPointClick(data, "hourly")}
        />
      </div>

      {/* Hourly Sales Bar Chart - Full Width */}
      <HourlySalesBarChart
        data={processedData.hourlySalesData}
        onBarClick={(data) => handleDataPointClick(data, "hourly")}
      />

      <SalesInsights
        metrics={processedData.metrics}
        growthMetrics={processedData.growthMetrics}
        topItems={processedData.topItems}
        locationPerformance={processedData.locationPerformance}
        peakHour={processedData.peakHour}
        onItemClick={(item) => {
          const itemOrders = processedData.currentOrders.filter((order) =>
            order.items.some(
              (orderItem) => orderItem.menuItemId === item.menuItemId
            )
          );
          handleDrillDown(
            `Orders containing ${item.name}`,
            itemOrders,
            `${itemOrders.length} orders • ${formatCurrency(
              item.totalSales
            )} in sales`
          );
        }}
        onLocationClick={(location) => {
          const locationOrders = processedData.currentOrders.filter(
            (order) => order.locationId === location.locationId
          );
          handleDrillDown(
            `Orders from ${location.locationName}`,
            locationOrders,
            `${locationOrders.length} orders • ${formatCurrency(
              location.sales
            )} in sales`
          );
        }}
      />

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() =>
          setDrillDownModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={drillDownModal.title}
        description={drillDownModal.description}
        orders={drillDownModal.orders}
        context={drillDownModal.context}
      />
    </div>
  );
}
