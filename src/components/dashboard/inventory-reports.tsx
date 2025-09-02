'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart } from '@/components/charts/chart';

export function InventoryReports() {
  const inventoryValueData = [
    {
      name: 'Jan',
      total: 12000,
    },
    {
      name: 'Feb',
      total: 13200,
    },
    {
      name: 'Mar',
      total: 14800,
    },
    {
      name: 'Apr',
      total: 15600,
    },
    {
      name: 'May',
      total: 16400,
    },
    {
      name: 'Jun',
      total: 17200,
    },
  ];

  const categoryDistributionData = [
    {
      name: 'Produce',
      total: 4200,
    },
    {
      name: 'Meat',
      total: 5800,
    },
    {
      name: 'Dairy',
      total: 3600,
    },
    {
      name: 'Bakery',
      total: 2800,
    },
    {
      name: 'Dry Goods',
      total: 4100,
    },
    {
      name: 'Beverages',
      total: 2900,
    },
  ];

  const turnoverRateData = [
    {
      name: 'Produce',
      value: 8.2,
    },
    {
      name: 'Meat',
      value: 6.5,
    },
    {
      name: 'Dairy',
      value: 7.8,
    },
    {
      name: 'Bakery',
      value: 9.1,
    },
    {
      name: 'Dry Goods',
      value: 3.2,
    },
    {
      name: 'Beverages',
      value: 4.5,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Inventory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="value">
            <TabsList className="mb-4">
              <TabsTrigger value="value">Inventory Value</TabsTrigger>
              <TabsTrigger value="distribution">Category Distribution</TabsTrigger>
              <TabsTrigger value="turnover">Turnover Rate</TabsTrigger>
            </TabsList>
            <TabsContent value="value" className="space-y-4">
              <div className="h-[300px]">
                <LineChart 
                  data={inventoryValueData} 
                  xField="name" 
                  yField="total" 
                  title="Monthly Inventory Value ($)" 
                />
              </div>
            </TabsContent>
            <TabsContent value="distribution" className="space-y-4">
              <div className="h-[300px]">
                <BarChart 
                  data={categoryDistributionData} 
                  xField="name" 
                  yField="total" 
                  title="Inventory Value by Category ($)" 
                />
              </div>
            </TabsContent>
            <TabsContent value="turnover" className="space-y-4">
              <div className="h-[300px]">
                <BarChart 
                  data={turnoverRateData} 
                  xField="name" 
                  yField="value" 
                  title="Inventory Turnover Rate by Category (times/year)" 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
