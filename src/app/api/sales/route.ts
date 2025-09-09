import { NextRequest, NextResponse } from "next/server";
import {
  calculateSalesMetrics,
  calculateGrowthMetrics,
  getDailySalesData,
  getHourlySalesData,
  getChannelDistribution,
  getTopPerformingItems,
  getLocationPerformance,
  filterOrdersByDateRange,
  getDateRangePresets,
  DateRange
} from '@/lib/salesAnalytics';
import { mockSalesOrders, Order } from '@/data/mockSalesData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const timeRange = searchParams.get("timeRange") || "7d";
    const weekStartParam = searchParams.get("weekStart");
    const locationIds = searchParams.get("locationIds")?.split(',').filter(Boolean) || [];
    const channels = searchParams.get("channels")?.split(',').filter(Boolean) as Order['channel'][] || [];

    // Calculate date range based on timeRange and weekStart
    let dateRange: DateRange;
    const presets = getDateRangePresets();

    if (weekStartParam) {
      // If weekStart is provided, use it for weekly navigation
      const startDate = new Date(weekStartParam);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of the week
      dateRange = {
        startDate,
        endDate,
        label: 'Custom Week'
      };
    } else {
      // Default behavior based on timeRange
      switch (timeRange) {
        case "7d":
          dateRange = presets.last7Days;
          break;
        case "30d":
          dateRange = presets.last30Days;
          break;
        case "90d":
          dateRange = presets.last90Days;
          break;
        default:
          dateRange = presets.last7Days;
      }
    }

    // Filter orders based on date range and optional filters
    let currentOrders = filterOrdersByDateRange(dateRange, locationIds);
    
    if (channels.length > 0) {
      currentOrders = currentOrders.filter(order => channels.includes(order.channel));
    }

    // Limit results if specified
    if (limit < currentOrders.length) {
      currentOrders = currentOrders.slice(0, limit);
    }

    // Get previous period data for growth comparison
    const previousPeriodStart = new Date(dateRange.startDate);
    const previousPeriodEnd = new Date(dateRange.endDate);
    const periodLength = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
    
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);
    
    let previousOrders = filterOrdersByDateRange({
      startDate: previousPeriodStart,
      endDate: previousPeriodEnd,
      label: 'Previous Period'
    }, locationIds);
    
    if (channels.length > 0) {
      previousOrders = previousOrders.filter(order => channels.includes(order.channel));
    }

    // Calculate all metrics using our analytics functions
    const metrics = calculateSalesMetrics(currentOrders);
    const growthMetrics = calculateGrowthMetrics(currentOrders, previousOrders, 'vs previous period');
    const dailyData = getDailySalesData(currentOrders);
    const hourlyData = getHourlySalesData(currentOrders);
    const orderTypeData = getChannelDistribution(currentOrders);
    const topItems = getTopPerformingItems(currentOrders, 10);
    const locationPerformance = getLocationPerformance(currentOrders);

    // Format recent orders for backward compatibility
    const recentOrders = currentOrders.slice(0, 10).map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleString(),
      items: order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(", "),
      estimatedTotal: order.totalAmount,
      location: order.locationName,
      channel: order.channel
    }));

    // Process data for chart compatibility
    const processedData = {
      metrics: {
        totalSales: metrics.totalSales,
        totalOrders: metrics.totalOrders,
        avgOrderValue: metrics.averageOrderValue,
        salesGrowth: growthMetrics.salesGrowth,
        orderGrowth: growthMetrics.orderGrowth,
        aovGrowth: growthMetrics.aovGrowth
      },
      dailyData: dailyData.map(day => ({
        date: day.date,
        sales: day.sales,
        orders: day.orders,
        averageOrderValue: day.averageOrderValue,
        dayOfWeek: day.dayOfWeek,
        isWeekend: day.isWeekend
      })),
      hourlyData: hourlyData.map(hour => ({
        hour: hour.hourLabel,
        hourNumber: hour.hour,
        sales: hour.sales,
        orders: hour.orders,
        averageOrderValue: hour.averageOrderValue
      })),
      orderTypeData: orderTypeData.map(channel => ({
        name: channel.channel.charAt(0).toUpperCase() + channel.channel.slice(1),
        value: channel.orders,
        sales: channel.sales,
        percentage: channel.percentage,
        color: channel.color
      })),
      topItems: topItems.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.totalQuantity,
        orders: item.orderCount,
        estimatedSales: item.totalSales,
        averagePrice: item.averagePrice,
        profitMargin: item.profitMargin,
        rank: item.rank
      })),
      recentOrders,
      locationPerformance: locationPerformance.map(location => ({
        locationId: location.locationId,
        locationName: location.locationName,
        sales: location.sales,
        orders: location.orders,
        averageOrderValue: location.averageOrderValue,
        topChannel: location.topChannel
      })),
      summary: {
        totalRevenue: metrics.totalSales,
        totalOrders: metrics.totalOrders,
        totalItems: metrics.totalItems,
        totalTax: metrics.totalTax,
        totalDiscounts: metrics.totalDiscounts,
        totalTips: metrics.totalTips,
        grossProfit: metrics.grossProfit,
        profitMargin: metrics.profitMargin,
        dateRange: dateRange.label,
        periodStart: dateRange.startDate.toISOString(),
        periodEnd: dateRange.endDate.toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: processedData,
      meta: {
        totalRecords: mockSalesOrders.length,
        filteredRecords: currentOrders.length,
        dateRange: dateRange.label,
        filters: {
          locationIds,
          channels,
          timeRange
        }
      }
    });
  } catch (error) {
    console.error("Error processing sales data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process sales data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
