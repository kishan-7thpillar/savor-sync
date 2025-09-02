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

interface CustomerComplaint {
  id: string;
  complaint_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  customer_contact: string;
  resolved: boolean;
  resolution_notes: string | null;
  created_at: string;
}

export function CustomerComplaints() {
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [filter, setFilter] = useState("all");
  
  // New complaint form state
  const [newComplaint, setNewComplaint] = useState({
    complaint_type: "food_quality",
    severity: "medium",
    description: "",
    customer_contact: "",
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
    const fetchComplaints = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      try {
        // Fetch customer complaints from Supabase for the selected location
        const { data, error } = await supabase
          .from("customer_complaints")
          .select("*")
          .eq("location_id", selectedLocation)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Customer complaints table not found, using mock data");
          // Generate mock data for demonstration
          const mockComplaints: CustomerComplaint[] = [
            {
              id: "1",
              complaint_type: "food_quality",
              severity: "high",
              description: "The pasta was overcooked and the sauce was too salty. Very disappointed with the quality.",
              customer_contact: "john.doe@email.com",
              resolved: false,
              resolution_notes: null,
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "2",
              complaint_type: "service",
              severity: "medium",
              description: "Server was rude and took too long to take our order. Had to wait 20 minutes just to place order.",
              customer_contact: "sarah.smith@email.com",
              resolved: true,
              resolution_notes: "Spoke with customer personally, offered complimentary meal. Staff member has been coached on customer service.",
              created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "3",
              complaint_type: "cleanliness",
              severity: "critical",
              description: "Found hair in my soup. This is completely unacceptable and unsanitary.",
              customer_contact: "mike.wilson@email.com",
              resolved: true,
              resolution_notes: "Full refund provided, kitchen staff retrained on hygiene protocols. Health department notified as per policy.",
              created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "4",
              complaint_type: "billing",
              severity: "low",
              description: "Was charged for extra drink that we didn't order. Please check the bill.",
              customer_contact: "lisa.brown@email.com",
              resolved: true,
              resolution_notes: "Billing error confirmed, refund processed. Updated POS system to prevent similar issues.",
              created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "5",
              complaint_type: "food_quality",
              severity: "medium",
              description: "Pizza arrived cold and cheese was not melted properly. Expected better quality.",
              customer_contact: "david.jones@email.com",
              resolved: false,
              resolution_notes: null,
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setComplaints(mockComplaints);
        } else {
          setComplaints(data || []);
        }
      } catch (error) {
        console.error("Error fetching customer complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [selectedLocation, supabase]);

  const handleAddComplaint = async () => {
    if (!selectedLocation || !newComplaint.description) {
      return;
    }

    try {
      // Add the complaint to Supabase
      const { data, error } = await supabase
        .from("customer_complaints")
        .insert([
          {
            location_id: selectedLocation,
            complaint_type: newComplaint.complaint_type,
            severity: newComplaint.severity,
            description: newComplaint.description,
            customer_contact: newComplaint.customer_contact,
            resolved: false,
            resolution_notes: null,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) throw error;
      
      // Add the new record to the state if successful
      if (data && data.length > 0) {
        setComplaints(prev => [data[0], ...prev]);
      }
      
      // Reset form
      setNewComplaint({
        complaint_type: "food_quality",
        severity: "medium",
        description: "",
        customer_contact: "",
      });
      
      setIsAddComplaintOpen(false);
    } catch (error) {
      console.error("Error adding complaint:", error);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      // Update the complaint in Supabase
      const { error } = await supabase
        .from("customer_complaints")
        .update({
          resolved: true,
          resolution_notes: resolutionNotes,
        })
        .eq("id", selectedComplaint.id);

      if (error) throw error;
      
      // Update the local state if successful
      setComplaints(prev => 
        prev.map(complaint => {
          if (complaint.id === selectedComplaint.id) {
            return {
              ...complaint,
              resolved: true,
              resolution_notes: resolutionNotes,
            };
          }
          return complaint;
        })
      );
      
      setIsResolveDialogOpen(false);
      setSelectedComplaint(null);
      setResolutionNotes("");
    } catch (error) {
      console.error("Error resolving complaint:", error);
    }
  };

  const openResolveDialog = (complaint: CustomerComplaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes(complaint.resolution_notes || "");
    setIsResolveDialogOpen(true);
  };

  const filteredComplaints = complaints.filter(complaint => {
    // Apply text search
    const matchesSearch = 
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complaint_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.customer_contact.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesFilter = 
      filter === "all" || 
      (filter === "resolved" && complaint.resolved) || 
      (filter === "unresolved" && !complaint.resolved);
    
    return matchesSearch && matchesFilter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplaintTypeName = (type: string) => {
    switch (type) {
      case 'food_quality': return 'Food Quality';
      case 'service': return 'Service';
      case 'cleanliness': return 'Cleanliness';
      case 'billing': return 'Billing';
      case 'wait_time': return 'Wait Time';
      case 'other': return 'Other';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Customer Complaints</CardTitle>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddComplaintOpen} onOpenChange={setIsAddComplaintOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record Customer Complaint</DialogTitle>
                  <DialogDescription>
                    Enter the details of the customer complaint.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="complaint_type">Complaint Type</Label>
                    <Select
                      value={newComplaint.complaint_type}
                      onValueChange={(value) => setNewComplaint({ ...newComplaint, complaint_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food_quality">Food Quality</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="wait_time">Wait Time</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={newComplaint.severity}
                      onValueChange={(value) => setNewComplaint({ ...newComplaint, severity: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                      placeholder="Enter complaint details"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer_contact">Customer Contact (Optional)</Label>
                    <Input
                      id="customer_contact"
                      value={newComplaint.customer_contact}
                      onChange={(e) => setNewComplaint({ ...newComplaint, customer_contact: e.target.value })}
                      placeholder="Email or phone number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddComplaintOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddComplaint}>Add Complaint</Button>
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
                placeholder="Search complaints..."
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
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No complaints found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>{getComplaintTypeName(complaint.complaint_type)}</TableCell>
                        <TableCell>{getSeverityBadge(complaint.severity)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {complaint.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(complaint.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {complaint.resolved ? (
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
                          {complaint.resolved ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openResolveDialog(complaint)}
                            >
                              View Resolution
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResolveDialog(complaint)}
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
              {selectedComplaint?.resolved ? "Resolution Details" : "Resolve Complaint"}
            </DialogTitle>
            <DialogDescription>
              {selectedComplaint?.resolved
                ? "View the resolution details for this complaint."
                : "Enter the resolution details for this complaint."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Complaint</h4>
                  <p className="text-sm">{selectedComplaint.description}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resolution_notes">Resolution Notes</Label>
                  <Textarea
                    id="resolution_notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter resolution details"
                    rows={3}
                    disabled={selectedComplaint.resolved}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              {selectedComplaint?.resolved ? "Close" : "Cancel"}
            </Button>
            {!selectedComplaint?.resolved && (
              <Button onClick={handleResolveComplaint}>Mark as Resolved</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
