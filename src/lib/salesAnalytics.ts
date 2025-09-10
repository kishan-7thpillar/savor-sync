// Sales Analytics and Data Transformation Utilities
import { Order, OrderItem, mockSalesOrders, getMockDataByDateRange, getMockDataByLocation, getMockDataByChannel } from '@/data/mockSalesData';

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItems: number;
  totalTax: number;
  totalDiscounts: number;
  totalTips: number;
  totalDeliveryFees: number;
  grossProfit: number;
  profitMargin: number;
}

export interface GrowthMetrics {
  salesGrowth: number;
  orderGrowth: number;
  aovGrowth: number;
  periodLabel: string;
}

export interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
  profit: number;
  profitMargin: number;
  dayOfWeek: string;
  isWeekend: boolean;
}

export interface HourlySalesData {
  hour: number;
  hourLabel: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
  profit: number;
  profitMargin: number;
}

export interface ChannelDistribution {
  channel: Order['channel'];
  sales: number;
  orders: number;
  percentage: number;
  averageOrderValue: number;
  color: string;
}

export interface TopPerformingItem {
  menuItemId: string;
  name: string;
  category: string;
  totalSales: number;
  totalQuantity: number;
  orderCount: number;
  averagePrice: number;
  profitMargin: number;
  totalProfit: number;
  rank: number;
}

export interface LocationPerformance {
  locationId: string;
  locationName: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
  topChannel: Order['channel'];
  growth: number;
  profit: number;
  profitMargin: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

// Date range presets
export const getDateRangePresets = (): { [key: string]: DateRange } => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return {
    today: {
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
      label: 'Today'
    },
    yesterday: {
      startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
      endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
      label: 'Yesterday'
    },
    last7Days: {
      startDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      endDate: today,
      label: 'Last 7 Days'
    },
    last30Days: {
      startDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      endDate: today,
      label: 'Last 30 Days'
    },
    thisWeek: {
      startDate: weekStart,
      endDate: today,
      label: 'This Week'
    },
    thisMonth: {
      startDate: monthStart,
      endDate: today,
      label: 'This Month'
    },
    last90Days: {
      startDate: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
      endDate: today,
      label: 'Last 90 Days'
    }
  };
};

// Core data transformation functions
export const calculateSalesMetrics = (orders: Order[]): SalesMetrics => {
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
  const totalDiscounts = orders.reduce((sum, order) => sum + order.discountAmount, 0);
  const totalTips = orders.reduce((sum, order) => sum + order.tipAmount, 0);
  const totalDeliveryFees = orders.reduce((sum, order) => sum + order.deliveryFee, 0);
  
  // Calculate gross profit (revenue - cost of goods sold)
  const totalCost = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + (item.menuItem.cost * item.quantity), 0
    ), 0
  );
  const grossProfit = totalSales - totalCost;
  const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? Math.round((totalSales / totalOrders) * 100) / 100 : 0,
    totalItems,
    totalTax: Math.round(totalTax * 100) / 100,
    totalDiscounts: Math.round(totalDiscounts * 100) / 100,
    totalTips: Math.round(totalTips * 100) / 100,
    totalDeliveryFees: Math.round(totalDeliveryFees * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
};

export const calculateGrowthMetrics = (currentOrders: Order[], previousOrders: Order[], periodLabel: string): GrowthMetrics => {
  const currentMetrics = calculateSalesMetrics(currentOrders);
  const previousMetrics = calculateSalesMetrics(previousOrders);
  
  const salesGrowth = previousMetrics.totalSales > 0 
    ? ((currentMetrics.totalSales - previousMetrics.totalSales) / previousMetrics.totalSales) * 100 
    : 0;
  
  const orderGrowth = previousMetrics.totalOrders > 0 
    ? ((currentMetrics.totalOrders - previousMetrics.totalOrders) / previousMetrics.totalOrders) * 100 
    : 0;
  
  const aovGrowth = previousMetrics.averageOrderValue > 0 
    ? ((currentMetrics.averageOrderValue - previousMetrics.averageOrderValue) / previousMetrics.averageOrderValue) * 100 
    : 0;

  return {
    salesGrowth: Math.round(salesGrowth * 100) / 100,
    orderGrowth: Math.round(orderGrowth * 100) / 100,
    aovGrowth: Math.round(aovGrowth * 100) / 100,
    periodLabel
  };
};

export const getDailySalesData = (orders: Order[]): DailySalesData[] => {
  const dailyData: { [key: string]: DailySalesData } = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        sales: 0,
        orders: 0,
        averageOrderValue: 0,
        profit: 0,
        profitMargin: 0,
        dayOfWeek,
        isWeekend
      };
    }
    
    // Calculate order profit
    const orderProfit = order.items.reduce((sum, item) => 
      sum + (item.menuItem.profit * item.quantity), 0
    );
    
    dailyData[dateKey].sales += order.totalAmount;
    dailyData[dateKey].orders += 1;
    dailyData[dateKey].profit += orderProfit;
  });
  
  // Calculate average order value and profit margin for each day
  Object.values(dailyData).forEach(day => {
    day.averageOrderValue = day.orders > 0 ? Math.round((day.sales / day.orders) * 100) / 100 : 0;
    day.profitMargin = day.sales > 0 ? Math.round((day.profit / day.sales) * 10000) / 100 : 0;
    day.sales = Math.round(day.sales * 100) / 100;
    day.profit = Math.round(day.profit * 100) / 100;
  });
  
  return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getHourlySalesData = (orders: Order[]): HourlySalesData[] => {
  const hourlyData: { [key: number]: HourlySalesData } = {};
  
  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = {
      hour,
      hourLabel: formatHour(hour),
      sales: 0,
      orders: 0,
      averageOrderValue: 0,
      profit: 0,
      profitMargin: 0
    };
  }
  
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    const orderProfit = order.items.reduce((sum, item) => 
      sum + (item.menuItem.profit * item.quantity), 0
    );
    
    hourlyData[hour].sales += order.totalAmount;
    hourlyData[hour].orders += 1;
    hourlyData[hour].profit += orderProfit;
  });
  
  // Calculate averages and profit margins
  Object.values(hourlyData).forEach(hourData => {
    hourData.averageOrderValue = hourData.orders > 0 ? Math.round((hourData.sales / hourData.orders) * 100) / 100 : 0;
    hourData.profitMargin = hourData.sales > 0 ? Math.round((hourData.profit / hourData.sales) * 10000) / 100 : 0;
    hourData.sales = Math.round(hourData.sales * 100) / 100;
    hourData.profit = Math.round(hourData.profit * 100) / 100;
  });
  
  return Object.values(hourlyData).filter(hour => hour.sales > 0);
};

export const getChannelDistribution = (orders: Order[]): ChannelDistribution[] => {
  const channelColors = {
    'dine-in': '#0088FE',
    'takeout': '#00C49F',
    'delivery': '#FFBB28',
    'catering': '#FF8042'
  };
  
  const channelData: { [key in Order['channel']]: ChannelDistribution } = {
    'dine-in': { channel: 'dine-in', sales: 0, orders: 0, percentage: 0, averageOrderValue: 0, color: channelColors['dine-in'] },
    'takeout': { channel: 'takeout', sales: 0, orders: 0, percentage: 0, averageOrderValue: 0, color: channelColors['takeout'] },
    'delivery': { channel: 'delivery', sales: 0, orders: 0, percentage: 0, averageOrderValue: 0, color: channelColors['delivery'] },
    'catering': { channel: 'catering', sales: 0, orders: 0, percentage: 0, averageOrderValue: 0, color: channelColors['catering'] }
  };
  
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  orders.forEach(order => {
    channelData[order.channel].sales += order.totalAmount;
    channelData[order.channel].orders += 1;
  });
  
  // Calculate percentages and average order values
  Object.values(channelData).forEach(channel => {
    channel.percentage = totalSales > 0 ? Math.round((channel.sales / totalSales) * 10000) / 100 : 0;
    channel.averageOrderValue = channel.orders > 0 ? Math.round((channel.sales / channel.orders) * 100) / 100 : 0;
    channel.sales = Math.round(channel.sales * 100) / 100;
  });
  
  return Object.values(channelData).filter(channel => channel.orders > 0);
};

export const getTopPerformingItems = (orders: Order[], limit: number = 10): TopPerformingItem[] => {
  const itemPerformance: { [key: string]: TopPerformingItem } = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.menuItemId;
      
      if (!itemPerformance[key]) {
        itemPerformance[key] = {
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          category: item.menuItem.category,
          totalSales: 0,
          totalQuantity: 0,
          orderCount: 0,
          averagePrice: 0,
          profitMargin: 0,
          totalProfit: 0,
          rank: 0
        };
      }
      
      itemPerformance[key].totalSales += item.subtotal;
      itemPerformance[key].totalQuantity += item.quantity;
      itemPerformance[key].orderCount += 1;
    });
  });
  
  // Calculate averages, profit margins, and total profit
  Object.values(itemPerformance).forEach(item => {
    item.averagePrice = item.totalQuantity > 0 ? Math.round((item.totalSales / item.totalQuantity) * 100) / 100 : 0;
    const menuItem = orders.find(o => o.items.find(i => i.menuItemId === item.menuItemId))?.items.find(i => i.menuItemId === item.menuItemId)?.menuItem;
    if (menuItem) {
      item.profitMargin = item.averagePrice > 0 ? Math.round(((item.averagePrice - menuItem.cost) / item.averagePrice) * 10000) / 100 : 0;
      item.totalProfit = Math.round((item.totalQuantity * menuItem.profit) * 100) / 100;
    } else {
      item.totalProfit = 0;
    }
    item.totalSales = Math.round(item.totalSales * 100) / 100;
  });
  
  const sortedItems = Object.values(itemPerformance)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
  
  // Add rankings
  sortedItems.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  return sortedItems;
};

export const getLocationPerformance = (orders: Order[]): LocationPerformance[] => {
  const locationData: { [key: string]: LocationPerformance } = {};
  
  orders.forEach(order => {
    if (!locationData[order.locationId]) {
      locationData[order.locationId] = {
        locationId: order.locationId,
        locationName: order.locationName,
        sales: 0,
        orders: 0,
        averageOrderValue: 0,
        topChannel: 'dine-in',
        growth: 0,
        profit: 0,
        profitMargin: 0
      };
    }
    
    locationData[order.locationId].sales += order.totalAmount;
    locationData[order.locationId].orders += 1;
    locationData[order.locationId].profit += order.items.reduce((sum, item) => sum + (item.menuItem.profit * item.quantity), 0);
  });
  
  // Calculate averages and find top channel for each location
  Object.values(locationData).forEach(location => {
    location.averageOrderValue = location.orders > 0 ? Math.round((location.sales / location.orders) * 100) / 100 : 0;
    location.profitMargin = location.sales > 0 ? Math.round((location.profit / location.sales) * 10000) / 100 : 0;
    location.sales = Math.round(location.sales * 100) / 100;
    location.profit = Math.round(location.profit * 100) / 100;
    
    // Find top channel for this location
    const locationOrders = orders.filter(o => o.locationId === location.locationId);
    const channelCounts = locationOrders.reduce((acc, order) => {
      acc[order.channel] = (acc[order.channel] || 0) + 1;
      return acc;
    }, {} as { [key in Order['channel']]?: number });
    
    location.topChannel = Object.entries(channelCounts).reduce((a, b) => 
      (channelCounts[a[0] as Order['channel']] || 0) > (channelCounts[b[0] as Order['channel']] || 0) ? a : b
    )[0] as Order['channel'];
  });
  
  return Object.values(locationData).sort((a, b) => b.sales - a.sales);
};

// Filtering functions
export const filterOrdersByDateRange = (dateRange: DateRange, locationIds?: string[]): Order[] => {
  let filteredOrders = getMockDataByDateRange(dateRange.startDate, dateRange.endDate);
  
  if (locationIds && locationIds.length > 0) {
    filteredOrders = filteredOrders.filter(order => locationIds.includes(order.locationId));
  }
  
  return filteredOrders;
};

export const filterOrdersByChannel = (orders: Order[], channels: Order['channel'][]): Order[] => {
  return orders.filter(order => channels.includes(order.channel));
};

// Utility functions
const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
