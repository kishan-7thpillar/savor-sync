"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocationWithMetrics } from "@/lib/types";

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data: locationsData } = await supabase
        .from("locations")
        .select(
          `
          *,
          pos_integrations (
            pos_system,
            sync_status,
            last_sync,
            error_message
          )
        `
        )
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (locationsData) {
        // Add mock metrics for demonstration
        const locationsWithMetrics = locationsData.map((location) => ({
          ...location,
          todaySales: Math.floor(Math.random() * 5000) + 1000,
          todayOrders: Math.floor(Math.random() * 100) + 20,
          avgOrderValue: Math.floor(Math.random() * 50) + 25,
          status:
            location.pos_integrations?.[0]?.sync_status === "success"
              ? ("online" as const)
              : ("offline" as const),
        }));

        setLocations(locationsWithMetrics);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (locationId: string) => {
    try {
      const response = await fetch("/api/pos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });

      if (response.ok) {
        // Refresh locations to show updated sync status
        fetchLocations();
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    return status === "online" ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "online" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">
            Manage your restaurant locations and POS integrations
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Create a new restaurant location to start tracking data.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Location form will be implemented in the next phase.
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchLocations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations ({filteredLocations.length})</CardTitle>
          <CardDescription>
            Overview of all your restaurant locations and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No locations found" : "No locations yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by adding your first restaurant location."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>POS System</TableHead>
                  <TableHead>Today's Sales</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>AOV</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(location.status || "offline")}
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {location.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(location.status || "offline")}
                    </TableCell>
                    <TableCell>
                      {location.pos_system ? (
                        <Badge variant="outline" className="capitalize">
                          {location.pos_system}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not connected
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(location.todaySales || 0)}
                    </TableCell>
                    <TableCell>{location.todayOrders || 0}</TableCell>
                    <TableCell>
                      {formatCurrency(location.avgOrderValue || 0)}
                    </TableCell>
                    <TableCell>
                      {location.pos_integrations?.[0]?.last_sync ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(
                            location.pos_integrations[0].last_sync
                          ).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Never
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            POS Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSync(location.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
