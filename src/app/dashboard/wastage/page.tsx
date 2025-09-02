'use client'

import { useState } from 'react'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Trash2, 
  TrendingDown, 
  AlertTriangle, 
  Plus,
  Download
} from 'lucide-react'

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8']

export default function WastagePage() {
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const wastageByReasonData = [
    { name: 'Spoilage', value: 35, amount: 1250, color: '#FF8042' },
    { name: 'Over-prep', value: 28, amount: 1000, color: '#FFBB28' },
    { name: 'Mistakes', value: 20, amount: 714, color: '#00C49F' },
    { name: 'Theft', value: 10, amount: 357, color: '#0088FE' },
    { name: 'Other', value: 7, amount: 250, color: '#8884D8' },
  ]

  const wastageByIngredientData = [
    { ingredient: 'Fresh Vegetables', expected: 150, actual: 180, waste: 30, cost: 450 },
    { ingredient: 'Dairy Products', expected: 80, actual: 95, waste: 15, cost: 225 },
    { ingredient: 'Meat & Poultry', expected: 120, actual: 135, waste: 15, cost: 375 },
    { ingredient: 'Bread & Bakery', expected: 60, actual: 72, waste: 12, cost: 96 },
    { ingredient: 'Seafood', expected: 40, actual: 48, waste: 8, cost: 240 },
  ]

  const monthlyWastageData = [
    { month: 'Jan', amount: 2800, percentage: 12.5 },
    { month: 'Feb', amount: 3200, percentage: 14.2 },
    { month: 'Mar', amount: 2950, percentage: 13.1 },
    { month: 'Apr', amount: 3400, percentage: 15.1 },
    { month: 'May', amount: 3571, percentage: 15.8 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wastage Analysis</h1>
          <p className="text-muted-foreground">
            Track and reduce food waste to optimize costs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Record Waste
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Waste Cost"
          value={formatCurrency(3571)}
          change={5.0}
          changeLabel="vs last month"
          icon={<Trash2 className="h-4 w-4 text-red-500" />}
          loading={loading}
        />
        <MetricsCard
          title="Waste Percentage"
          value="15.8%"
          change={0.7}
          changeLabel="of total purchases"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Top Waste Category"
          value="Spoilage"
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          loading={loading}
        />
        <MetricsCard
          title="Potential Savings"
          value={formatCurrency(1786)}
          icon={<TrendingDown className="h-4 w-4 text-green-500" />}
          loading={loading}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-ingredient">By Ingredient</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Wastage by Reason */}
            <Card>
              <CardHeader>
                <CardTitle>Wastage by Reason</CardTitle>
                <CardDescription>
                  Breakdown of waste causes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={wastageByReasonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {wastageByReasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {wastageByReasonData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Wastage Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Wastage Trend</CardTitle>
                <CardDescription>
                  Waste cost and percentage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyWastageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'amount' ? formatCurrency(Number(value)) : `${value}%`,
                      name === 'amount' ? 'Waste Cost' : 'Percentage'
                    ]} />
                    <Bar dataKey="amount" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Waste Reduction Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Reduction Opportunities</CardTitle>
              <CardDescription>
                Actionable insights to reduce waste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Reduce vegetable spoilage</div>
                      <div className="text-sm text-muted-foreground">
                        Implement FIFO inventory rotation - potential savings: $225/month
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    High Impact
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Optimize portion sizes</div>
                      <div className="text-sm text-muted-foreground">
                        Review over-prep patterns - potential savings: $150/month
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Medium Impact
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-ingredient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wastage by Ingredient</CardTitle>
              <CardDescription>
                Expected vs actual usage and waste cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient Category</TableHead>
                    <TableHead>Expected Usage</TableHead>
                    <TableHead>Actual Usage</TableHead>
                    <TableHead>Waste Amount</TableHead>
                    <TableHead>Waste Cost</TableHead>
                    <TableHead>Waste %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wastageByIngredientData.map((item, index) => {
                    const wastePercentage = ((item.waste / item.actual) * 100).toFixed(1)
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.ingredient}</TableCell>
                        <TableCell>{item.expected} lbs</TableCell>
                        <TableCell>{item.actual} lbs</TableCell>
                        <TableCell>{item.waste} lbs</TableCell>
                        <TableCell>{formatCurrency(item.cost)}</TableCell>
                        <TableCell>
                          <Badge variant={Number(wastePercentage) > 15 ? 'destructive' : 'secondary'}>
                            {wastePercentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste Trends Analysis</CardTitle>
              <CardDescription>
                Historical waste patterns and forecasting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed trend analysis and predictive insights will be available here.
                </p>
                <Button variant="outline">
                  View Detailed Trends
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
