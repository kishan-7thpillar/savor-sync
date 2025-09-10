"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  ShoppingCart,
  Clock,
  User,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Order, OrderItem } from "@/data/mockSalesData";
import { formatCurrency, formatDate, formatTime } from "@/lib/salesAnalytics";

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  orders: Order[];
  context?: {
    type: "date" | "hour" | "channel" | "location" | "item";
    value: string;
  };
}

export function DrillDownModal({
  isOpen,
  onClose,
  title,
  description,
  orders,
  context,
}: DrillDownModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "items">("date");

  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.totalAmount - a.totalAmount;
      case "items":
        return b.items.length - a.items.length;
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalItems = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalProfit = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + (item.menuItem.profit * item.quantity), 0
    ), 0
  );
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  const getChannelColor = (channel: Order["channel"]) => {
    const colors = {
      "dine-in": "bg-blue-100 text-blue-800",
      takeout: "bg-green-100 text-green-800",
      delivery: "bg-yellow-100 text-yellow-800",
      catering: "bg-purple-100 text-purple-800",
    };
    return colors[channel] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodIcon = (method: Order["paymentMethod"]) => {
    switch (method) {
      case "card":
        return "💳";
      case "cash":
        return "💵";
      case "digital_wallet":
        return "📱";
      case "online":
        return "🌐";
      default:
        return "💰";
    }
  };

  // Custom full-screen dialog content component
  const FullScreenDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay className="bg-black/80" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[75vw] max-w-[75vw] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg",
          "h-[70vh] max-h-[90vh] overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  ));
  FullScreenDialogContent.displayName = "FullScreenDialogContent";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <FullScreenDialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Summary Stats */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalSales)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Sales
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Profit
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalItems}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Items Sold
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(averageOrderValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Order Value
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {profitMargin.toFixed(1)}% margin
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Orders ({orders.length})</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={sortBy === "date" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("date")}
                    >
                      Date
                    </Button>
                    <Button
                      variant={sortBy === "amount" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("amount")}
                    >
                      Amount
                    </Button>
                    <Button
                      variant={sortBy === "items" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("items")}
                    >
                      Items
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {sortedOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`
                          p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                          ${
                            selectedOrder?.id === order.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-gray-50"
                          }
                        `}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {order.orderNumber}
                            </span>
                            <Badge className={getChannelColor(order.channel)}>
                              {order.channel}
                            </Badge>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.locationName}
                            </span>
                          </div>
                          <span>{order.items.length} items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOrder ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {/* Order Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">
                            {selectedOrder.orderNumber}
                          </span>
                          <Badge
                            className={getChannelColor(selectedOrder.channel)}
                          >
                            {selectedOrder.channel}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedOrder.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(selectedOrder.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {selectedOrder.locationName}
                          </div>
                          <div className="flex items-center gap-1">
                            <span>
                              {getPaymentMethodIcon(
                                selectedOrder.paymentMethod
                              )}
                            </span>
                            {selectedOrder.paymentMethod}
                          </div>
                        </div>

                        {selectedOrder.customerName && (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            {selectedOrder.customerName}
                          </div>
                        )}

                        {selectedOrder.tableNumber && (
                          <div className="text-sm">
                            Table: {selectedOrder.tableNumber}
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium">
                          Items ({selectedOrder.items.length})
                        </h4>
                        {selectedOrder.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {item.menuItem.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.quantity} ×{" "}
                                {formatCurrency(item.unitPrice)}
                              </div>
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.modifiers
                                    .map((mod) => mod.name)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-sm">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>

                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount:</span>
                            <span>
                              -{formatCurrency(selectedOrder.discountAmount)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span>
                            Tax ({(selectedOrder.taxRate * 100).toFixed(2)}%):
                          </span>
                          <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                        </div>

                        {selectedOrder.tipAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Tip:</span>
                            <span>
                              {formatCurrency(selectedOrder.tipAmount)}
                            </span>
                          </div>
                        )}

                        {selectedOrder.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee:</span>
                            <span>
                              {formatCurrency(selectedOrder.deliveryFee)}
                            </span>
                          </div>
                        )}

                        <Separator />

                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>
                            {formatCurrency(selectedOrder.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {selectedOrder.notes && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-sm mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedOrder.notes}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an order to view details</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </FullScreenDialogContent>
    </Dialog>
  );
}
