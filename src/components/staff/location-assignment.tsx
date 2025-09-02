"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationAssignmentProps {
  organizationId: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  staffCount: number;
}

interface StaffLocationAssignment {
  id: string;
  staffId: string;
  staffName: string;
  locationId: string;
  locationName: string;
  isPrimaryLocation: boolean;
  startDate: Date;
  endDate?: Date;
}

export function LocationAssignment({ organizationId }: LocationAssignmentProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [assignments, setAssignments] = useState<StaffLocationAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // New assignment form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [assignmentLocation, setAssignmentLocation] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const supabase = createClient();
  
  useEffect(() => {
    fetchLocations();
    fetchStaffMembers();
  }, []);
  
  useEffect(() => {
    if (selectedLocation) {
      fetchLocationAssignments(selectedLocation);
    } else {
      setAssignments([]);
    }
  }, [selectedLocation]);
  
  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, address")
        .eq("organization_id", organizationId);
      
      if (error) throw error;
      
      // Get staff count for each location
      const locationsWithStaffCount = await Promise.all(
        (data || []).map(async (location) => {
          const { count } = await supabase
            .from("staff_locations")
            .select("*", { count: "exact", head: true })
            .eq("location_id", location.id)
            .is("end_date", null);
          
          return {
            id: location.id,
            name: location.name,
            address: location.address,
            staffCount: count || 0,
          };
        })
      );
      
      setLocations(locationsWithStaffCount);
      if (locationsWithStaffCount.length > 0 && !selectedLocation) {
        setSelectedLocation(locationsWithStaffCount[0].id);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchStaffMembers() {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("id, first_name, last_name, position")
        .eq("organization_id", organizationId)
        .eq("employment_status", "active");
      
      if (error) throw error;
      
      setStaffMembers(
        (data || []).map((staff) => ({
          id: staff.id,
          firstName: staff.first_name,
          lastName: staff.last_name,
          position: staff.position,
        }))
      );
    } catch (error) {
      console.error("Error fetching staff members:", error);
    }
  }
  
  async function fetchLocationAssignments(locationId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff_locations")
        .select(`
          id,
          staff_id,
          location_id,
          is_primary_location,
          start_date,
          end_date,
          staff:staff_id(first_name, last_name),
          locations:location_id(name)
        `)
        .eq("location_id", locationId);
      
      if (error) throw error;
      
      const processedAssignments: StaffLocationAssignment[] = (data || []).map((assignment) => ({
        id: assignment.id,
        staffId: assignment.staff_id,
        staffName: `${assignment.staff.first_name} ${assignment.staff.last_name}`,
        locationId: assignment.location_id,
        locationName: assignment.locations.name,
        isPrimaryLocation: assignment.is_primary_location,
        startDate: new Date(assignment.start_date),
        endDate: assignment.end_date ? new Date(assignment.end_date) : undefined,
      }));
      
      setAssignments(processedAssignments);
    } catch (error) {
      console.error("Error fetching location assignments:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreateAssignments() {
    try {
      // For each selected staff member, create an assignment
      const assignmentPromises = selectedStaff.map(async (staffId) => {
        // If this is a primary location, we need to update any existing primary locations
        if (isPrimary) {
          await supabase
            .from("staff_locations")
            .update({ is_primary_location: false })
            .eq("staff_id", staffId)
            .eq("is_primary_location", true);
        }
        
        // Create the new assignment
        const { error } = await supabase.from("staff_locations").insert({
          staff_id: staffId,
          location_id: assignmentLocation,
          is_primary_location: isPrimary,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate ? endDate.toISOString().split("T")[0] : null,
        });
        
        if (error) throw error;
      });
      
      await Promise.all(assignmentPromises);
      
      // Refresh the data
      if (selectedLocation) {
        fetchLocationAssignments(selectedLocation);
      }
      fetchLocations(); // To update staff counts
      
      // Reset form
      setIsDialogOpen(false);
      setSelectedStaff([]);
      setAssignmentLocation("");
      setIsPrimary(false);
      setStartDate(new Date());
      setEndDate(undefined);
    } catch (error) {
      console.error("Error creating assignments:", error);
    }
  }
  
  async function handleEndAssignment(assignmentId: string) {
    try {
      const { error } = await supabase
        .from("staff_locations")
        .update({ end_date: new Date().toISOString().split("T")[0] })
        .eq("id", assignmentId);
      
      if (error) throw error;
      
      // Refresh the data
      if (selectedLocation) {
        fetchLocationAssignments(selectedLocation);
      }
      fetchLocations(); // To update staff counts
    } catch (error) {
      console.error("Error ending assignment:", error);
    }
  }
  
  function formatDate(date: Date | undefined) {
    if (!date) return "Ongoing";
    return format(date, "MMM d, yyyy");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-medium">Location Staff Assignments</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Assign Staff to Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Staff to Location</DialogTitle>
              <DialogDescription>
                Select staff members and a location to create assignments.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={assignmentLocation}
                  onValueChange={setAssignmentLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Staff Members</Label>
                <div className="border rounded-md p-4 h-[200px] overflow-y-auto">
                  {staffMembers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No active staff members found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {staffMembers.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`staff-${staff.id}`}
                            checked={selectedStaff.includes(staff.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStaff([...selectedStaff, staff.id]);
                              } else {
                                setSelectedStaff(
                                  selectedStaff.filter((id) => id !== staff.id)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`staff-${staff.id}`}
                            className="text-sm font-normal"
                          >
                            {staff.firstName} {staff.lastName} ({staff.position})
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="primary-location"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(!!checked)}
                />
                <Label htmlFor="primary-location" className="text-sm font-normal">
                  Set as primary location
                </Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>No end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setEndDate(date)}
                        initialFocus
                        disabled={(date) =>
                          date < startDate || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAssignments}
                disabled={!assignmentLocation || selectedStaff.length === 0}
              >
                Create Assignments
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !locations.length ? (
              <div className="text-center py-4">Loading locations...</div>
            ) : locations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No locations found
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedLocation === location.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedLocation(location.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location.address || "No address"}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {location.staffCount} staff
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Staff Assignments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedLocation
                ? `Staff at ${
                    locations.find((loc) => loc.id === selectedLocation)?.name ||
                    "Selected Location"
                  }`
                : "Select a Location"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedLocation ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a location to view staff assignments
              </div>
            ) : loading ? (
              <div className="text-center py-8">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No staff assigned to this location
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.staffName}
                        {assignment.isPrimaryLocation && (
                          <Badge variant="outline" className="ml-2">
                            Primary
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(assignment.startDate)}</TableCell>
                      <TableCell>{formatDate(assignment.endDate)}</TableCell>
                      <TableCell>
                        {!assignment.endDate ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : new Date(assignment.endDate) >= new Date() ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Ending Soon
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Ended
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!assignment.endDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEndAssignment(assignment.id)}
                          >
                            End Assignment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
