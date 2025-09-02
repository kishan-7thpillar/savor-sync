'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Order = {
  id: string;
  supplier: string;
  items: string[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
};

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    supplier: 'Global Foods Inc.',
    items: ['Tomatoes', 'Onions', 'Lettuce'],
    total: 234.56,
    status: 'pending',
    date: '2025-08-20',
  },
  {
    id: 'ORD-002',
    supplier: 'Fresh Produce Co.',
    items: ['Chicken', 'Beef', 'Pork'],
    total: 567.89,
    status: 'processing',
    date: '2025-08-18',
  },
  {
    id: 'ORD-003',
    supplier: 'Dairy Distributors',
    items: ['Milk', 'Cheese', 'Yogurt'],
    total: 123.45,
    status: 'completed',
    date: '2025-08-15',
  },
  {
    id: 'ORD-004',
    supplier: 'Bakery Supplies Ltd.',
    items: ['Flour', 'Sugar', 'Yeast'],
    total: 78.90,
    status: 'cancelled',
    date: '2025-08-10',
  },
];

export function InventoryOrders() {
  const [orders] = useState<Order[]>(mockOrders);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.items.join(', ')}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)} variant="outline">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
