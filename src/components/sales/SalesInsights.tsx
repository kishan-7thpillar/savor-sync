'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Clock, 
  Calendar,
  Users,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { 
  SalesMetrics, 
  GrowthMetrics, 
  TopPerformingItem, 
  LocationPerformance,
  formatCurrency, 
  formatPercentage 
} from '@/lib/salesAnalytics';
import { Order } from '@/data/mockSalesData';

interface SalesInsightsProps {
  metrics: SalesMetrics;
  growthMetrics: GrowthMetrics;
  topItems: TopPerformingItem[];
  locationPerformance: LocationPerformance[];
  peakHour: { hour: number; sales: number; hourLabel: string };
  onItemClick?: (item: TopPerformingItem) => void;
  onLocationClick?: (location: LocationPerformance) => void;
}

export function SalesInsights({
  metrics,
  growthMetrics,
  topItems,
  locationPerformance,
  peakHour,
  onItemClick,
  onLocationClick
}: SalesInsightsProps) {
  const [selectedInsightType, setSelectedInsightType] = useState<'performance' | 'growth' | 'patterns'>('performance');
  const [rankingType, setRankingType] = useState<'revenue' | 'profitability'>('revenue');

  // Sort items based on ranking type
  const getSortedItems = () => {
    const sortedItems = [...topItems];
    if (rankingType === 'profitability') {
      sortedItems.sort((a, b) => b.totalProfit - a.totalProfit);
    } else {
      sortedItems.sort((a, b) => b.totalSales - a.totalSales);
    }
    // Re-rank items based on current sorting
    return sortedItems.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  };

  const getInsightIcon = (type: 'positive' | 'negative' | 'neutral' | 'warning') => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const generatePerformanceInsights = () => {
    const insights = [];

    // Revenue insights
    if (metrics.totalSales > 10000) {
      insights.push({
        type: 'positive' as const,
        title: 'Strong Revenue Performance',
        description: `Generated ${formatCurrency(metrics.totalSales)} in total sales with ${metrics.totalOrders} orders.`,
        action: 'View detailed breakdown'
      });
    }

    // Profit margin insights
    if (metrics.profitMargin > 60) {
      insights.push({
        type: 'positive' as const,
        title: 'Excellent Profit Margins',
        description: `Maintaining a healthy ${metrics.profitMargin.toFixed(1)}% profit margin across all items.`,
        action: 'Analyze top performers'
      });
    } else if (metrics.profitMargin < 40) {
      insights.push({
        type: 'warning' as const,
        title: 'Profit Margin Opportunity',
        description: `Current profit margin is ${metrics.profitMargin.toFixed(1)}%. Consider reviewing pricing or costs.`,
        action: 'Review pricing strategy'
      });
    }

    // AOV insights
    if (metrics.averageOrderValue > 25) {
      insights.push({
        type: 'positive' as const,
        title: 'High Average Order Value',
        description: `AOV of ${formatCurrency(metrics.averageOrderValue)} indicates effective upselling.`,
        action: 'Identify upselling opportunities'
      });
    }

    return insights;
  };

  const generateGrowthInsights = () => {
    const insights = [];

    // Sales growth
    if (growthMetrics.salesGrowth > 10) {
      insights.push({
        type: 'positive' as const,
        title: 'Strong Sales Growth',
        description: `Sales increased by ${formatPercentage(growthMetrics.salesGrowth)} ${growthMetrics.periodLabel}.`,
        action: 'Identify growth drivers'
      });
    } else if (growthMetrics.salesGrowth < -5) {
      insights.push({
        type: 'negative' as const,
        title: 'Sales Decline Alert',
        description: `Sales decreased by ${formatPercentage(Math.abs(growthMetrics.salesGrowth))} ${growthMetrics.periodLabel}.`,
        action: 'Investigate causes'
      });
    }

    // Order growth vs AOV growth
    if (growthMetrics.orderGrowth > growthMetrics.aovGrowth + 5) {
      insights.push({
        type: 'neutral' as const,
        title: 'Volume-Driven Growth',
        description: `Order volume grew faster than AOV. Focus on increasing order values.`,
        action: 'Implement upselling strategies'
      });
    } else if (growthMetrics.aovGrowth > growthMetrics.orderGrowth + 5) {
      insights.push({
        type: 'positive' as const,
        title: 'Value-Driven Growth',
        description: `AOV growth outpacing order volume indicates effective pricing strategies.`,
        action: 'Scale successful tactics'
      });
    }

    return insights;
  };

  const generatePatternInsights = () => {
    const insights = [];

    // Peak hour insights
    if (peakHour.sales > 0) {
      insights.push({
        type: 'neutral' as const,
        title: 'Peak Performance Hour',
        description: `${peakHour.hourLabel} is your busiest time with ${formatCurrency(peakHour.sales)} in sales.`,
        action: 'Optimize staffing for peak hours'
      });
    }

    // Top item performance
    if (topItems.length > 0) {
      const topItem = topItems[0];
      const topItemRevenue = (topItem.totalSales / metrics.totalSales) * 100;
      
      if (topItemRevenue > 20) {
        insights.push({
          type: 'warning' as const,
          title: 'Revenue Concentration Risk',
          description: `${topItem.name} accounts for ${topItemRevenue.toFixed(1)}% of total revenue.`,
          action: 'Diversify menu offerings'
        });
      } else {
        insights.push({
          type: 'positive' as const,
          title: 'Balanced Menu Performance',
          description: `Top item (${topItem.name}) represents ${topItemRevenue.toFixed(1)}% of revenue, showing good diversification.`,
          action: 'Continue balanced approach'
        });
      }
    }

    // Location performance
    if (locationPerformance.length > 1) {
      const topLocation = locationPerformance[0];
      const locationRevenue = (topLocation.sales / metrics.totalSales) * 100;
      
      insights.push({
        type: 'neutral' as const,
        title: 'Location Performance Leader',
        description: `${topLocation.locationName} leads with ${formatCurrency(topLocation.sales)} (${locationRevenue.toFixed(1)}% of total).`,
        action: 'Analyze success factors'
      });
    }

    return insights;
  };

  const getCurrentInsights = () => {
    switch (selectedInsightType) {
      case 'growth':
        return generateGrowthInsights();
      case 'patterns':
        return generatePatternInsights();
      default:
        return generatePerformanceInsights();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Performing Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Performing Items
              </CardTitle>
              <CardDescription>
                {rankingType === 'profitability' 
                  ? 'Best performing menu items by total profit' 
                  : 'Best selling menu items by revenue'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={rankingType} onValueChange={(value) => setRankingType(value as 'revenue' | 'profitability')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
                  <TabsTrigger value="profitability" className="text-xs">Profitability</TabsTrigger>
                </TabsList>
              </Tabs>
              <Badge variant="secondary">{topItems.length} items</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getSortedItems().slice(0, 5).map((item, index) => (
              <div
                key={item.menuItemId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onItemClick?.(item)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                    {item.rank}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} • {item.totalQuantity} sold • {item.orderCount} orders
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {rankingType === 'profitability' 
                      ? formatCurrency(item.totalProfit) 
                      : formatCurrency(item.totalSales)
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {rankingType === 'profitability' 
                      ? `${formatCurrency(item.totalSales)} revenue • ${item.profitMargin.toFixed(1)}% margin`
                      : `${formatCurrency(item.totalProfit)} profit • ${item.profitMargin.toFixed(1)}% margin`
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Performance */}
      {locationPerformance.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Location Performance
            </CardTitle>
            <CardDescription>
              Sales performance across all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locationPerformance.map((location, index) => (
                <div
                  key={location.locationId}
                  className="relative p-6 border rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 group"
                  onClick={() => onLocationClick?.(location)}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Location Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-green-500 shadow-lg shadow-green-200' : 
                      index === 1 ? 'bg-blue-500 shadow-lg shadow-blue-200' : 
                      'bg-purple-500 shadow-lg shadow-purple-200'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                        {location.locationName}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        Primary: {location.topChannel}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(location.sales)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(location.profit)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Profit</div>
                    </div>
                  </div>
                  
                  {/* Performance Indicators */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Orders</span>
                      <span className="font-medium text-gray-900">{location.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AOV</span>
                      <span className="font-medium text-gray-900">{formatCurrency(location.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className={`font-bold ${
                        location.profitMargin >= 60 ? 'text-green-600' :
                        location.profitMargin >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {location.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Profit Margin Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Profitability</span>
                      <span className="text-xs font-medium text-gray-700">{location.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          location.profitMargin >= 60 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          location.profitMargin >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${Math.min(location.profitMargin, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Insights</CardTitle>
              <CardDescription>
                AI-powered analysis of your sales data
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedInsightType === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInsightType('performance')}
              >
                Performance
              </Button>
              <Button
                variant={selectedInsightType === 'growth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInsightType('growth')}
              >
                Growth
              </Button>
              <Button
                variant={selectedInsightType === 'patterns' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInsightType('patterns')}
              >
                Patterns
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getCurrentInsights().map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm mt-2">
                    {insight.action} →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>
            Critical metrics at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalSales)}</div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
              <div className="text-sm text-muted-foreground">Avg Order Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{peakHour.hourLabel}</div>
              <div className="text-sm text-muted-foreground">Peak Hour</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
