"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Location {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  hourlyRate: number;
  payType: string;
  status: string;
  isOwner: boolean;
}

interface StaffShift {
  id: string;
  staff_name: string;
  role: string;
  hourly_rate: number;
  shift_start: string;
  shift_end: string | null;
  hours_worked: number;
  overtime_hours: number;
  total_pay: number;
  team_member_id?: string;
}

interface NewShift {
  staff_name: string;
  role: string;
  hourly_rate: number;
  shift_start: Date;
  shift_end: Date | null;
}

export function StaffShifts() {
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  
  // New shift form state
  const [newShift, setNewShift] = useState<NewShift>({
    staff_name: "",
    role: "server",
    hourly_rate: 15,
    shift_start: new Date(),
    shift_end: null,
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
    const fetchTeamMembers = async () => {
      if (!selectedLocation) return;
      
      try {
        const response = await fetch(`/api/team-members?locationId=${selectedLocation}`);
        const result = await response.json();
        
        if (result.success) {
          setTeamMembers(result.data);
        } else {
          console.error('Error fetching team members:', result.error);
          // Fallback to mock team members
          const mockTeamMembers: TeamMember[] = [
            {
              id: "TMJDzBwYe7HHvQAa",
              name: "Sandbox Seller",
              email: "sandbox-merchant+4tgdm30dh7es2kownhvq35dwgbtf82ha@squareup.com",
              role: "owner",
              hourlyRate: 0,
              payType: "NONE",
              status: "ACTIVE",
              isOwner: true
            },
            {
              id: "TMtZBEwu_TLD0H3l",
              name: "Kiran Lal",
              email: "kishanthachat31@gmail.com",
              phone: "+449164276544",
              role: "manager",
              hourlyRate: 3.21,
              payType: "SALARY",
              status: "ACTIVE",
              isOwner: false
            }
          ];
          setTeamMembers(mockTeamMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        // Fallback to mock data
        const mockTeamMembers: TeamMember[] = [
          {
            id: "TMJDzBwYe7HHvQAa",
            name: "Sandbox Seller",
            email: "sandbox-merchant+4tgdm30dh7es2kownhvq35dwgbtf82ha@squareup.com",
            role: "owner",
            hourlyRate: 0,
            payType: "NONE",
            status: "ACTIVE",
            isOwner: true
          },
          {
            id: "TMtZBEwu_TLD0H3l",
            name: "Kiran Lal",
            email: "kishanthachat31@gmail.com",
            phone: "+449164276544",
            role: "manager",
            hourlyRate: 3.21,
            payType: "SALARY",
            status: "ACTIVE",
            isOwner: false
          }
        ];
        setTeamMembers(mockTeamMembers);
      }
    };

    fetchTeamMembers();
  }, [selectedLocation]);

  useEffect(() => {
    const fetchShifts = async () => {
      if (!selectedLocation) return;
      
      setLoading(true);
      try {
        // Fetch staff shifts from Supabase for the selected location
        const { data, error } = await supabase
          .from("staff_shifts")
          .select("*")
          .eq("location_id", selectedLocation)
          .order("shift_start", { ascending: false });

        if (error) {
          console.warn("Staff shifts table not found, using mock data with Square team members");
          // Generate mock data using actual Square team members
          const mockShifts: StaffShift[] = teamMembers.map((member, index) => {
            const isActive = index < 2; // First 2 members have active shifts
            const hoursWorked = isActive ? Math.random() * 4 + 4 : Math.random() * 8 + 6;
            const overtimeHours = Math.max(0, hoursWorked - 8);
            const regularHours = Math.min(8, hoursWorked);
            const hourlyRate = member.hourlyRate > 0 ? member.hourlyRate : 15; // Default rate if none set
            const totalPay = (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
            
            return {
              id: `shift_${member.id}`,
              staff_name: member.name,
              role: member.role,
              hourly_rate: hourlyRate,
              shift_start: new Date(Date.now() - hoursWorked * 60 * 60 * 1000).toISOString(),
              shift_end: isActive ? null : new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              hours_worked: parseFloat(hoursWorked.toFixed(2)),
              overtime_hours: parseFloat(overtimeHours.toFixed(2)),
              total_pay: parseFloat(totalPay.toFixed(2)),
              team_member_id: member.id
            };
          });
          setShifts(mockShifts);
        } else {
          setShifts(data || []);
        }
      } catch (error) {
        console.error("Error fetching staff shifts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [selectedLocation, teamMembers, supabase]);

  const handleAddShift = async () => {
    if (!selectedLocation || !newShift.staff_name || !newShift.shift_start) {
      return;
    }

    try {
      const shiftStartStr = newShift.shift_start.toISOString();
      const shiftEndStr = newShift.shift_end ? newShift.shift_end.toISOString() : null;
      
      // Calculate hours worked if both start and end times are provided
      let hoursWorked = 0;
      let overtimeHours = 0;
      let totalPay = 0;
      
      if (newShift.shift_end) {
        const diffMs = newShift.shift_end.getTime() - newShift.shift_start.getTime();
        hoursWorked = diffMs / (1000 * 60 * 60);
        
        // Calculate overtime (hours over 8)
        overtimeHours = Math.max(0, hoursWorked - 8);
        const regularHours = Math.min(8, hoursWorked);
        
        // Calculate pay (overtime at 1.5x)
        totalPay = (regularHours * newShift.hourly_rate) + (overtimeHours * newShift.hourly_rate * 1.5);
      }
      
      // Add the shift to Supabase
      const { data, error } = await supabase
        .from("staff_shifts")
        .insert([
          {
            location_id: selectedLocation,
            staff_name: newShift.staff_name,
            role: newShift.role,
            hourly_rate: newShift.hourly_rate,
            shift_start: shiftStartStr,
            shift_end: shiftEndStr,
            hours_worked: parseFloat(hoursWorked.toFixed(2)),
            overtime_hours: parseFloat(overtimeHours.toFixed(2)),
            total_pay: parseFloat(totalPay.toFixed(2)),
          }
        ])
        .select();

      if (error) throw error;
      
      // Add the new record to the state if successful
      if (data && data.length > 0) {
        setShifts(prev => [data[0], ...prev]);
      }
      
      // Reset form
      setNewShift({
        staff_name: "",
        role: "server",
        hourly_rate: 15,
        shift_start: new Date(),
        shift_end: null,
      });
      
      setIsAddShiftOpen(false);
    } catch (error) {
      console.error("Error adding shift:", error);
    }
  };

  const handleEndShift = async (shiftId: string) => {
    try {
      // Find the shift to end
      const shiftToEnd = shifts.find(s => s.id === shiftId);
      if (!shiftToEnd) return;
      
      const now = new Date();
      const shiftStart = new Date(shiftToEnd.shift_start);
      const diffMs = now.getTime() - shiftStart.getTime();
      const hoursWorked = diffMs / (1000 * 60 * 60);
      const overtimeHours = Math.max(0, hoursWorked - 8);
      const regularHours = Math.min(8, hoursWorked);
      const totalPay = (regularHours * shiftToEnd.hourly_rate) + (overtimeHours * shiftToEnd.hourly_rate * 1.5);
      
      // Update the shift in Supabase
      const { error } = await supabase
        .from("staff_shifts")
        .update({
          shift_end: now.toISOString(),
          hours_worked: parseFloat(hoursWorked.toFixed(2)),
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
          total_pay: parseFloat(totalPay.toFixed(2)),
        })
        .eq("id", shiftId);

      if (error) throw error;
      
      // Update the local state if successful
      setShifts(prev => 
        prev.map(shift => {
          if (shift.id === shiftId) {
            return {
              ...shift,
              shift_end: now.toISOString(),
              hours_worked: parseFloat(hoursWorked.toFixed(2)),
              overtime_hours: parseFloat(overtimeHours.toFixed(2)),
              total_pay: parseFloat(totalPay.toFixed(2)),
            };
          }
          return shift;
        })
      );
    } catch (error) {
      console.error("Error ending shift:", error);
    }
  };

  const filteredShifts = shifts.filter(shift => 
    shift.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Staff Shifts</CardTitle>
          <div className="flex items-center space-x-2">
            <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Staff Shift</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new staff shift.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="team_member">Team Member</Label>
                    <Select
                      value={newShift.staff_name}
                      onValueChange={(value) => {
                        const selectedMember = teamMembers.find(m => m.name === value);
                        if (selectedMember) {
                          setNewShift({ 
                            ...newShift, 
                            staff_name: selectedMember.name,
                            role: selectedMember.role,
                            hourly_rate: selectedMember.hourlyRate > 0 ? selectedMember.hourlyRate : 15
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.name}>
                            <div className="flex items-center space-x-2">
                              <span>{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                              {member.isOwner && (
                                <Badge variant="secondary" className="text-xs">
                                  Owner
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newShift.role}
                      readOnly
                      className="bg-muted"
                      placeholder="Role will be set based on team member"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      value={newShift.hourly_rate}
                      onChange={(e) => setNewShift({ ...newShift, hourly_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shift_start">Shift Start</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newShift.shift_start && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newShift.shift_start ? format(newShift.shift_start, "PPP HH:mm") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newShift.shift_start}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              setNewShift({
                                ...newShift,
                                shift_start: date,
                              });
                            }
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={newShift.shift_start ? format(newShift.shift_start, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(newShift.shift_start);
                              newDate.setHours(hours, minutes);
                              setNewShift({ ...newShift, shift_start: newDate });
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shift_end">Shift End (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newShift.shift_end && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newShift.shift_end ? format(newShift.shift_end, "PPP HH:mm") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newShift.shift_end || undefined}
                          onSelect={(date: Date | undefined) => {
                            setNewShift({
                              ...newShift,
                              shift_end: date || null,
                            });
                          }}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={newShift.shift_end ? format(newShift.shift_end, "HH:mm") : ""}
                            onChange={(e) => {
                              if (!newShift.shift_end) return;
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(newShift.shift_end);
                              newDate.setHours(hours, minutes);
                              setNewShift({ ...newShift, shift_end: newDate });
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddShiftOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddShift}>Add Shift</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Select value={selectedLocation || ""} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff or role..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    <TableHead>Staff</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No shifts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">{shift.staff_name}</TableCell>
                        <TableCell>{shift.role}</TableCell>
                        <TableCell>
                          {format(new Date(shift.shift_start), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          {shift.shift_end ? (
                            format(new Date(shift.shift_end), "MMM d, h:mm a")
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {shift.hours_worked > 0 ? (
                            <>
                              {shift.hours_worked}
                              {shift.overtime_hours > 0 && (
                                <span className="text-amber-600 ml-1">
                                  (+{shift.overtime_hours} OT)
                                </span>
                              )}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>${shift.total_pay.toFixed(2)}</TableCell>
                        <TableCell>
                          {!shift.shift_end && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEndShift(shift.id)}
                            >
                              End Shift
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
    </div>
  );
}
