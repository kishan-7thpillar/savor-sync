'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock,
  Calendar,
  Download
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function SalesPage() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
  })
  const [topItems, setTopItems] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [hourlyChartData, setHourlyChartData] = useState<any[]>([])
  const [orderTypeChartData, setOrderTypeChartData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSalesData()
  }, [timeRange])

  const fetchSalesData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/sales?timeRange=${timeRange}&limit=100`)
      const result = await response.json()
      
      if (result.success) {
        setSalesData(result.data.dailyData)
        setMetrics(result.data.metrics)
        setTopItems(result.data.topItems)
        setRecentOrders(result.data.recentOrders)
        setHourlyChartData(result.data.hourlyData)
        setOrderTypeChartData(result.data.orderTypeData)
      } else {
        console.error('API Error:', result.error)
        // Fallback to mock data if API fails
        const mockData = generateMockSalesData(timeRange)
        setSalesData(mockData.dailyData)
        setMetrics(mockData.metrics)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      // Fallback to mock data if API fails
      const mockData = generateMockSalesData(timeRange)
      setSalesData(mockData.dailyData)
      setMetrics(mockData.metrics)
    } finally {
      setLoading(false)
    }
  }

  const generateMockSalesData = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const dailyData = []
    let totalSales = 0
    let totalOrders = 0

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const sales = Math.floor(Math.random() * 3000) + 1500
      const orders = Math.floor(Math.random() * 80) + 40
      
      totalSales += sales
      totalOrders += orders
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales,
        orders,
        aov: sales / orders,
      })
    }

    return {
      dailyData,
      metrics: {
        totalSales,
        totalOrders,
        avgOrderValue: totalSales / totalOrders,
        salesGrowth: Math.floor(Math.random() * 20) - 10,
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const orderTypeData = [
    { name: 'Dine-in', value: 45, color: '#0088FE' },
    { name: 'Takeout', value: 35, color: '#00C49F' },
    { name: 'Delivery', value: 20, color: '#FFBB28' },
  ]

  const hourlyData = [
    { hour: '6AM', sales: 200 },
    { hour: '8AM', sales: 800 },
    { hour: '10AM', sales: 1200 },
    { hour: '12PM', sales: 2500 },
    { hour: '2PM', sales: 1800 },
    { hour: '4PM', sales: 1000 },
    { hour: '6PM', sales: 2200 },
    { hour: '8PM', sales: 1900 },
    { hour: '10PM', sales: 800 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Track your sales performance and identify trends
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          change={metrics.salesGrowth}
          changeLabel="vs previous period"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={5.2}
          changeLabel="vs previous period"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Average Order Value"
          value={formatCurrency(metrics.avgOrderValue)}
          change={-2.1}
          changeLabel="vs previous period"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Peak Hour"
          value="12:00 PM"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>
            Daily sales and order volume over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 animate-pulse bg-muted rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(Number(value)) : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Bar yAxisId="left" dataKey="sales" fill="#8884d8" opacity={0.3} />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of orders by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderTypeChartData.length > 0 ? orderTypeChartData : orderTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(orderTypeChartData.length > 0 ? orderTypeChartData : orderTypeData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {(orderTypeChartData.length > 0 ? orderTypeChartData : orderTypeData).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Sales Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Sales Pattern</CardTitle>
            <CardDescription>
              Average sales by hour of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyChartData.length > 0 ? hourlyChartData : hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales']} />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders from Square */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from Square POS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">Order {order.id.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(order.estimatedTotal)}</div>
                    <Badge variant="outline">Square POS</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Items</CardTitle>
          <CardDescription>
            Best selling menu items by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(topItems.length > 0 ? topItems : [
              { name: 'Margherita Pizza', estimatedSales: 2450, orders: 98, quantity: 98 },
              { name: 'Caesar Salad', estimatedSales: 1890, orders: 126, quantity: 126 },
              { name: 'Grilled Chicken', estimatedSales: 1650, orders: 75, quantity: 75 },
              { name: 'Pasta Carbonara', estimatedSales: 1420, orders: 68, quantity: 68 },
              { name: 'Fish & Chips', estimatedSales: 1280, orders: 52, quantity: 52 },
            ]).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} sold • {item.orders} orders
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(item.estimatedSales)}</div>
                  <div className="text-sm text-muted-foreground">
                    Est. revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
