"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Location {
  id: string;
  name: string;
}

interface Order {
  id: string;
  order_number: string;
}

interface OrderInaccuracy {
  id: string;
  order_id: string;
  order_number: string;
  inaccuracy_type: string;
  description: string;
  resolved: boolean;
  resolution_notes: string | null;
  created_at: string;
}

export function OrderInaccuracies() {
  const [inaccuracies, setInaccuracies] = useState<OrderInaccuracy[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddInaccuracyOpen, setIsAddInaccuracyOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedInaccuracy, setSelectedInaccuracy] = useState<OrderInaccuracy | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // New inaccuracy form state
  const [newInaccuracy, setNewInaccuracy] = useState({
    order_id: "",
    order_number: "",
    inaccuracy_type: "wrong_item",
    description: "",
  });
  
  const supabase = createClient();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase.from("locations").select("id, name");
        if (error) throw error;
        setLocations(data || []);
        if (data && data.length > 0) {
          setSelectedLocation(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchInaccuracies = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      try {
        // Fetch order inaccuracies from Supabase for the selected location
        const { data: inaccuraciesData, error: inaccuraciesError } = await supabase
          .from("order_inaccuracies")
          .select(`
            *,
            orders!inner(order_number)
          `)
          .eq("orders.location_id", selectedLocation)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Order inaccuracies table not found, using mock data");
          // Generate mock data for demonstration
          const mockInaccuracies: OrderInaccuracy[] = [
            {
              id: "1",
              order_id: "ord_001",
              order_number: "#1234",
              inaccuracy_type: "wrong_item",
              description: "Customer ordered Caesar Salad but received Garden Salad instead. Kitchen mixed up the orders.",
              resolved: false,
              resolution_notes: null,
              created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "2",
              order_id: "ord_002",
              order_number: "#1235",
              inaccuracy_type: "missing_item",
              description: "Order was missing the side of fries. Customer called to complain about incomplete order.",
              resolved: true,
              resolution_notes: "Delivered missing fries within 15 minutes. Offered 10% discount on next order.",
              created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "3",
              order_id: "ord_003",
              order_number: "#1236",
              inaccuracy_type: "wrong_preparation",
              description: "Burger was ordered medium-rare but served well-done. Customer was not satisfied.",
              resolved: true,
              resolution_notes: "Prepared new burger to customer's specification. Comp'd the meal and provided dessert.",
              created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "4",
              order_id: "ord_004",
              order_number: "#1237",
              inaccuracy_type: "extra_item",
              description: "Customer was charged for extra cheese they didn't order. Billing discrepancy noted.",
              resolved: true,
              resolution_notes: "Refunded the extra charge. Updated POS training for staff to prevent similar errors.",
              created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "5",
              order_id: "ord_005",
              order_number: "#1238",
              inaccuracy_type: "wrong_item",
              description: "Vegetarian customer received chicken pizza instead of veggie pizza. Serious dietary concern.",
              resolved: false,
              resolution_notes: null,
              created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          ];
          setInaccuracies(mockInaccuracies);
        } else {
          // Transform data to include order_number
          const transformedData = data?.map(item => ({
            ...item,
            order_number: item.orders?.order_number || 'Unknown'
          })) || [];
          
          setInaccuracies(transformedData);
        }
      } catch (error) {
        console.error("Error fetching order inaccuracies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInaccuracies();
  }, [selectedLocation, supabase]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!selectedLocation) return;
      
      try {
        // Fetch recent orders for the dropdown
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number")
          .eq("location_id", selectedLocation)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setRecentOrders(data || []);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }
    };

    fetchInaccuracies();
  }, [selectedLocation, supabase]);

  const handleAddInaccuracy = async () => {
    if (!selectedLocation || !newInaccuracy.order_id || !newInaccuracy.description) {
      return;
    }

    try {
      // Add the inaccuracy to Supabase
      const { data, error } = await supabase
        .from("order_inaccuracies")
        .insert([
          {
            location_id: selectedLocation,
            order_id: newInaccuracy.order_id,
            order_number: newInaccuracy.order_number,
            inaccuracy_type: newInaccuracy.inaccuracy_type,
            description: newInaccuracy.description,
            resolved: false,
            resolution_notes: null,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) throw error;
      
      // Add the new record to the state if successful
      if (data && data.length > 0) {
        setInaccuracies(prev => [data[0], ...prev]);
      }
      
      // Reset form
      setNewInaccuracy({
        order_id: "",
        order_number: "",
        inaccuracy_type: "wrong_item",
        description: "",
      });
      
      setIsAddInaccuracyOpen(false);
    } catch (error) {
      console.error("Error adding inaccuracy:", error);
    }
  };

  const handleResolveInaccuracy = async () => {
    if (!selectedInaccuracy) return;

    try {
      // Update the inaccuracy in Supabase
      const { error } = await supabase
        .from("order_inaccuracies")
        .update({
          resolved: true,
          resolution_notes: resolutionNotes,
        })
        .eq("id", selectedInaccuracy.id);

      if (error) throw error;
      
      // Update the local state if successful
      setInaccuracies(prev => 
        prev.map(inaccuracy => {
          if (inaccuracy.id === selectedInaccuracy.id) {
            return {
              ...inaccuracy,
              resolved: true,
              resolution_notes: resolutionNotes,
            };
          }
          return inaccuracy;
        })
      );
      
      setIsResolveDialogOpen(false);
      setSelectedInaccuracy(null);
      setResolutionNotes("");
    } catch (error) {
      console.error("Error resolving inaccuracy:", error);
    }
  };

  const openResolveDialog = (inaccuracy: OrderInaccuracy) => {
    setSelectedInaccuracy(inaccuracy);
    setResolutionNotes(inaccuracy.resolution_notes || "");
    setIsResolveDialogOpen(true);
  };
  
  const handleOrderSelect = (orderId: string) => {
    const selectedOrder = recentOrders.find((order) => order.id === orderId);
    if (selectedOrder) {
      setNewInaccuracy({
        ...newInaccuracy,
        order_id: selectedOrder.id,
        order_number: selectedOrder.order_number,
      });
    }
  };

  const filteredInaccuracies = inaccuracies.filter(inaccuracy => {
    // Apply text search
    const matchesSearch = 
      inaccuracy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inaccuracy.inaccuracy_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inaccuracy.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesFilter = 
      filter === "all" || 
      (filter === "resolved" && inaccuracy.resolved) || 
      (filter === "unresolved" && !inaccuracy.resolved);
    
    return matchesSearch && matchesFilter;
  });

  const getInaccuracyTypeName = (type: string) => {
    switch (type) {
      case 'wrong_item': return 'Wrong Item';
      case 'missing_item': return 'Missing Item';
      case 'quantity_error': return 'Quantity Error';
      case 'preparation_error': return 'Preparation Error';
      case 'other': return 'Other';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Order Inaccuracies</CardTitle>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddInaccuracyOpen} onOpenChange={setIsAddInaccuracyOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record Order Inaccuracy</DialogTitle>
                  <DialogDescription>
                    Enter the details of the order inaccuracy.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order_id">Order</Label>
                    <Select
                      value={newInaccuracy.order_id}
                      onValueChange={handleOrderSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order" />
                      </SelectTrigger>
                      <SelectContent>
                        {recentOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            Order #{order.order_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inaccuracy_type">Issue Type</Label>
                    <Select
                      value={newInaccuracy.inaccuracy_type}
                      onValueChange={(value) => setNewInaccuracy({ ...newInaccuracy, inaccuracy_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wrong_item">Wrong Item</SelectItem>
                        <SelectItem value="missing_item">Missing Item</SelectItem>
                        <SelectItem value="quantity_error">Quantity Error</SelectItem>
                        <SelectItem value="preparation_error">Preparation Error</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newInaccuracy.description}
                      onChange={(e) => setNewInaccuracy({ ...newInaccuracy, description: e.target.value })}
                      placeholder="Enter issue details"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddInaccuracyOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInaccuracy}>Record Issue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Select value={selectedLocation || ""} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order issues..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInaccuracies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No order issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInaccuracies.map((inaccuracy) => (
                      <TableRow key={inaccuracy.id}>
                        <TableCell className="font-medium">{inaccuracy.order_number}</TableCell>
                        <TableCell>{getInaccuracyTypeName(inaccuracy.inaccuracy_type)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {inaccuracy.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(inaccuracy.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {inaccuracy.resolved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {inaccuracy.resolved ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResolveDialog(inaccuracy)}
                            >
                              View Resolution
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResolveDialog(inaccuracy)}
                            >
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedInaccuracy?.resolved ? "Resolution Details" : "Resolve Order Issue"}
            </DialogTitle>
            <DialogDescription>
              {selectedInaccuracy?.resolved
                ? "View the resolution details for this order issue."
                : "Enter the resolution details for this order issue."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedInaccuracy && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Issue</h4>
                  <p className="text-sm">{selectedInaccuracy.description}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resolution_notes">Resolution Notes</Label>
                  <Textarea
                    id="resolution_notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution details"
                    rows={3}
                    disabled={selectedInaccuracy.resolved}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              {selectedInaccuracy?.resolved ? "Close" : "Cancel"}
            </Button>
            {!selectedInaccuracy?.resolved && (
              <Button onClick={handleResolveInaccuracy}>Mark as Resolved</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
