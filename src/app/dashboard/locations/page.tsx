"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedLocation } from "@/store/locationSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Search,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  Store,
  Users,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockLocations, Location } from "@/data/mockSalesData";
import {
  calculateSalesMetrics,
  getLocationPerformance,
  filterOrdersByDateRange,
  getDateRangePresets,
  formatPercentage,
} from "@/lib/salesAnalytics";
import { MetricsCard } from "@/components/dashboard/metrics-card";

// Enhanced location interface with metrics
interface LocationWithMetrics extends Location {
  todaySales: number;
  todayOrders: number;
  avgOrderValue: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const selectedLocation = useAppSelector((state) => state.location.selectedLocation);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPosDialog, setShowPosDialog] = useState(false);
  const [selectedLocationForPos, setSelectedLocationForPos] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Calculate location metrics using sales data
  const locationsWithMetrics = useMemo(() => {
    const dateRange = getDateRangePresets().today;
    const weekRange = getDateRangePresets().last7Days;
    const monthRange = getDateRangePresets().last30Days;

    return mockLocations.map((location): LocationWithMetrics => {
      // Get today's orders for this location
      const todayOrders = filterOrdersByDateRange(dateRange, [location.id]);
      const weekOrders = filterOrdersByDateRange(weekRange, [location.id]);
      const monthOrders = filterOrdersByDateRange(monthRange, [location.id]);
      
      // Calculate metrics
      const todayMetrics = calculateSalesMetrics(todayOrders);
      const weekMetrics = calculateSalesMetrics(weekOrders);
      const monthMetrics = calculateSalesMetrics(monthOrders);
      
      // Calculate growth (mock calculation for demo)
      const weeklyGrowth = Math.random() * 20 - 10; // -10% to +10%
      const monthlyGrowth = Math.random() * 30 - 15; // -15% to +15%

      return {
        ...location,
        todaySales: todayMetrics.totalSales,
        todayOrders: todayMetrics.totalOrders,
        avgOrderValue: todayMetrics.averageOrderValue,
        weeklyGrowth,
        monthlyGrowth,
      };
    });
  }, []);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    return locationsWithMetrics.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [locationsWithMetrics, searchTerm]);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    return filteredLocations.reduce(
      (acc, location) => ({
        totalSales: acc.totalSales + location.todaySales,
        totalOrders: acc.totalOrders + location.todayOrders,
        avgOrderValue: acc.avgOrderValue + location.avgOrderValue,
        onlineLocations: acc.onlineLocations + (location.syncStatus === 'online' ? 1 : 0),
        totalLocations: acc.totalLocations + 1,
      }),
      { totalSales: 0, totalOrders: 0, avgOrderValue: 0, onlineLocations: 0, totalLocations: 0 }
    );
  }, [filteredLocations]);

  // Simulate sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally update sync status from real API
      // For demo purposes, we'll just trigger a re-render
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getSyncStatusIcon = (status: Location['syncStatus']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusBadge = (status: Location['syncStatus']) => {
    const variants = {
      online: 'default',
      syncing: 'secondary',
      offline: 'destructive',
      error: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleLocationSelect = (locationId: string) => {
    dispatch(setSelectedLocation(locationId));
  };

  const handlePosConfig = (location: Location) => {
    setSelectedLocationForPos(location);
    setShowPosDialog(true);
  };

  const formatLastSync = (lastSyncTime: string) => {
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const handleSync = async (locationId: string) => {
    // Simulate sync operation
    console.log(`Syncing location: ${locationId}`);
    // In a real app, this would trigger a sync with the POS system
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Location Management</h1>
          <p className="text-muted-foreground">
            Centralized dashboard for all restaurant locations with real-time sync monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: 'overview' | 'detailed') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Sales Today"
          value={formatCurrency(aggregateMetrics.totalSales)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricsCard
          title="Total Orders"
          value={aggregateMetrics.totalOrders.toString()}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricsCard
          title="Average AOV"
          value={formatCurrency(aggregateMetrics.avgOrderValue / Math.max(aggregateMetrics.totalLocations, 1))}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricsCard
          title="Online Locations"
          value={`${aggregateMetrics.onlineLocations}/${aggregateMetrics.totalLocations}`}
          icon={<Wifi className="h-4 w-4" />}
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredLocations.length} locations
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Locations Grid/Table */}
      {viewMode === 'overview' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleLocationSelect(location.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSyncStatusIcon(location.syncStatus)}
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  {getSyncStatusBadge(location.syncStatus)}
                </div>
                <CardDescription className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location.address}, {location.city}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Sales</p>
                    <p className="text-lg font-semibold">{formatCurrency(location.todaySales)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-lg font-semibold">{location.todayOrders}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {location.posSystem.provider}
                    </Badge>
                    <span className={location.posSystem.isConfigured ? "text-green-600" : "text-orange-600"}>
                      {location.posSystem.isConfigured ? "Configured" : "Setup Required"}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatLastSync(location.lastSyncTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{location.manager.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePosConfig(location)}>
                        <Settings className="h-4 w-4 mr-2" />
                        POS Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSync(location.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Location
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              Detailed view of all locations with comprehensive metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>POS System</TableHead>
                  <TableHead>Today's Sales</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>AOV</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id} className="cursor-pointer" onClick={() => handleLocationSelect(location.id)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {location.address}, {location.city}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSyncStatusIcon(location.syncStatus)}
                        {getSyncStatusBadge(location.syncStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {location.posSystem.provider}
                        </Badge>
                        <span className={`text-xs ${location.posSystem.isConfigured ? "text-green-600" : "text-orange-600"}`}>
                          {location.posSystem.isConfigured ? "✓" : "⚠"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(location.todaySales)}
                    </TableCell>
                    <TableCell>{location.todayOrders}</TableCell>
                    <TableCell>{formatCurrency(location.avgOrderValue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className={location.weeklyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                          {location.weeklyGrowth >= 0 ? "+" : ""}{location.weeklyGrowth.toFixed(1)}%
                        </span>
                        {location.weeklyGrowth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{location.manager.name}</div>
                        <div className="text-muted-foreground">{location.manager.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatLastSync(location.lastSyncTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePosConfig(location)}>
                            <Settings className="h-4 w-4 mr-2" />
                            POS Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSync(location.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Location
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* POS Configuration Dialog */}
      <Dialog open={showPosDialog} onOpenChange={setShowPosDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>POS System Configuration</DialogTitle>
            <DialogDescription>
              Configure POS system for {selectedLocationForPos?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">POS Provider</label>
              <Select defaultValue={selectedLocationForPos?.posSystem.provider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Square">Square</SelectItem>
                  <SelectItem value="Toast">Toast</SelectItem>
                  <SelectItem value="Clover">Clover</SelectItem>
                  <SelectItem value="Shopify POS">Shopify POS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Application ID</label>
              <Input 
                placeholder="Enter application ID"
                defaultValue={selectedLocationForPos?.posSystem.applicationId}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location ID</label>
              <Input 
                placeholder="Enter location ID"
                defaultValue={selectedLocationForPos?.posSystem.locationId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPosDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPosDialog(false)}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new restaurant location to start tracking data.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Location creation form will be implemented in the next phase.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
