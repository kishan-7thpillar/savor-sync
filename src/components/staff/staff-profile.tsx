"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Staff, Shift, PerformanceMetrics } from "@/lib/types/staff";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Award,
  BarChart2,
  Calendar as CalendarIcon,
  User,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StaffProfileProps {
  staffId: string;
  onEdit: (staff: Staff) => void;
  onBack: () => void;
}

export function StaffProfile({ staffId, onEdit, onBack }: StaffProfileProps) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; date: Date; url: string }[]>([]);
  
  const supabase = createClient();
  
  useEffect(() => {
    if (staffId) {
      fetchStaffData();
      fetchShifts();
      fetchPerformanceData();
      fetchDocuments();
    }
  }, [staffId]);
  
  async function fetchStaffData() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff")
        .select(`
          *,
          staff_locations(
            id,
            location_id,
            is_primary_location,
            start_date,
            end_date,
            locations(id, name)
          ),
          staff_roles(id, role_name, permissions, location_id, is_active, locations(id, name))
        `)
        .eq("id", staffId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Process the data to match our Staff interface
        const processedStaff: Staff = {
          id: data.id,
          organizationId: data.organization_id,
          employeeId: data.employee_id,
          userId: data.user_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          hireDate: new Date(data.hire_date),
          terminationDate: data.termination_date ? new Date(data.termination_date) : undefined,
          employmentStatus: data.employment_status,
          position: data.position,
          department: data.department,
          hourlyRate: data.hourly_rate,
          salaryAnnual: data.salary_annual,
          emergencyContactName: data.emergency_contact_name,
          emergencyContactPhone: data.emergency_contact_phone,
          notes: data.notes,
          profilePhotoUrl: data.profile_photo_url,
          locations: data.staff_locations.map((loc: any) => ({
            id: loc.id,
            locationId: loc.location_id,
            locationName: loc.locations.name,
            isPrimaryLocation: loc.is_primary_location,
            startDate: new Date(loc.start_date),
            endDate: loc.end_date ? new Date(loc.end_date) : undefined,
          })),
          roles: data.staff_roles.map((role: any) => ({
            id: role.id,
            roleName: role.role_name,
            permissions: role.permissions || {},
            locationId: role.location_id,
            locationName: role.locations?.name,
            isActive: role.is_active,
          })),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        
        setStaff(processedStaff);
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchShifts() {
    try {
      const { data, error } = await supabase
        .from("staff_shifts")
        .select(`
          *,
          locations(id, name)
        `)
        .eq("staff_table_id", staffId)
        .order("start_time", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        const processedShifts: Shift[] = data.map((shift: any) => ({
          id: shift.id,
          staffId: shift.staff_table_id,
          locationId: shift.location_id,
          locationName: shift.locations.name,
          startTime: new Date(shift.start_time),
          endTime: new Date(shift.end_time),
          position: shift.position || staff?.position || "",
          status: shift.status || "completed",
          notes: shift.shift_notes,
        }));
        
        setShifts(processedShifts);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  }
  
  async function fetchPerformanceData() {
    try {
      // This would be replaced with actual API call to get performance metrics
      // For now, we'll generate some sample data
      const samplePerformance: PerformanceMetrics = {
        staffId,
        metrics: {
          customerRating: 4.7,
          salesPerformance: 92,
          attendanceRate: 98,
          efficiencyScore: 88,
          trainingCompletion: 100,
        },
        history: [
          {
            period: "Jan",
            metrics: {
              customerRating: 4.5,
              salesPerformance: 85,
              attendanceRate: 95,
              efficiencyScore: 82,
            },
          },
          {
            period: "Feb",
            metrics: {
              customerRating: 4.6,
              salesPerformance: 87,
              attendanceRate: 97,
              efficiencyScore: 84,
            },
          },
          {
            period: "Mar",
            metrics: {
              customerRating: 4.7,
              salesPerformance: 90,
              attendanceRate: 98,
              efficiencyScore: 86,
            },
          },
          {
            period: "Apr",
            metrics: {
              customerRating: 4.7,
              salesPerformance: 92,
              attendanceRate: 98,
              efficiencyScore: 88,
            },
          },
        ],
      };
      
      setPerformance(samplePerformance);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    }
  }
  
  async function fetchDocuments() {
    try {
      // This would be replaced with actual API call to get documents
      // For now, we'll generate some sample data
      const sampleDocuments = [
        {
          id: "doc1",
          name: "Employment Contract",
          type: "Contract",
          date: new Date(2023, 0, 15),
          url: "#",
        },
        {
          id: "doc2",
          name: "Food Safety Certification",
          type: "Certification",
          date: new Date(2023, 3, 10),
          url: "#",
        },
        {
          id: "doc3",
          name: "Performance Review Q1",
          type: "Review",
          date: new Date(2023, 2, 30),
          url: "#",
        },
      ];
      
      setDocuments(sampleDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }
  
  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      case "on_leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  
  function getPrimaryLocation() {
    if (!staff) return "Not assigned";
    const primary = staff.locations.find(loc => loc.isPrimaryLocation);
    return primary ? primary.locationName : "Not assigned";
  }
  
  function formatDate(date: Date | undefined) {
    if (!date) return "N/A";
    return format(date, "MMM d, yyyy");
  }
  
  function formatTime(date: Date | undefined) {
    if (!date) return "N/A";
    return format(date, "h:mm a");
  }
  
  function formatDateTime(date: Date | undefined) {
    if (!date) return "N/A";
    return format(date, "MMM d, yyyy h:mm a");
  }
  
  function getInitials(firstName: string, lastName: string) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading staff profile...</p>
      </div>
    );
  }
  
  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Staff member not found</p>
        <Button onClick={onBack} className="mt-4">Back to Staff List</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          Back to Staff List
        </Button>
        <Button onClick={() => onEdit(staff)}>Edit Profile</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {staff.profilePhotoUrl ? (
                  <AvatarImage src={staff.profilePhotoUrl} alt={`${staff.firstName} ${staff.lastName}`} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {getInitials(staff.firstName, staff.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-xl">
                {staff.firstName} {staff.lastName}
              </CardTitle>
              <CardDescription className="text-base font-medium">
                {staff.position}
              </CardDescription>
              <Badge className={`mt-2 ${getStatusBadgeColor(staff.employmentStatus)}`}>
                {staff.employmentStatus.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{staff.department || "No department"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{getPrimaryLocation()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{staff.email || "No email"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{staff.phone || "No phone"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Hired: {formatDate(staff.hireDate)}</span>
                </div>
                {staff.employeeId && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>ID: {staff.employeeId}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Roles</h4>
                <div className="space-y-1">
                  {staff.roles.map((role) => (
                    <div key={role.id} className="text-sm">
                      <span className="font-medium">{role.roleName}</span>
                      {role.locationName && (
                        <span className="text-muted-foreground"> ({role.locationName})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Emergency Contact</h4>
                {staff.emergencyContactName ? (
                  <div className="space-y-1 text-sm">
                    <div>{staff.emergencyContactName}</div>
                    <div>{staff.emergencyContactPhone || "No phone"}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No emergency contact</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Employment Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Position:</span>
                            <span>{staff.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Department:</span>
                            <span>{staff.department || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span>{staff.employmentStatus.replace("_", " ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hire Date:</span>
                            <span>{formatDate(staff.hireDate)}</span>
                          </div>
                          {staff.terminationDate && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Termination Date:</span>
                              <span>{formatDate(staff.terminationDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Compensation</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hourly Rate:</span>
                            <span>${staff.hourlyRate.toFixed(2)}</span>
                          </div>
                          {staff.salaryAnnual && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Annual Salary:</span>
                              <span>${staff.salaryAnnual.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Locations</h4>
                      <div className="space-y-2">
                        {staff.locations.map((location) => (
                          <div
                            key={location.id}
                            className="flex justify-between items-center p-2 border rounded-md"
                          >
                            <div>
                              <span className="font-medium">{location.locationName}</span>
                              {location.isPrimaryLocation && (
                                <Badge variant="outline" className="ml-2">Primary</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Since {formatDate(location.startDate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {staff.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {staff.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shifts.length > 0 ? (
                      <div className="space-y-2">
                        {shifts.slice(0, 3).map((shift) => (
                          <div
                            key={shift.id}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{shift.locationName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(shift.startTime)} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                                </div>
                              </div>
                            </div>
                            <Badge>{shift.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shift History</CardTitle>
                </CardHeader>
                <CardContent>
                  {shifts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shifts.map((shift) => (
                          <TableRow key={shift.id}>
                            <TableCell>{formatDate(shift.startTime)}</TableCell>
                            <TableCell>
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </TableCell>
                            <TableCell>{shift.locationName}</TableCell>
                            <TableCell>{shift.position}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  shift.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : shift.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : shift.status === "missed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {shift.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No shifts found for this staff member
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming shifts scheduled
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {performance ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-md text-center">
                          <div className="text-2xl font-bold text-primary">
                            {performance.metrics.customerRating?.toFixed(1) || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Customer Rating</div>
                        </div>
                        <div className="p-4 border rounded-md text-center">
                          <div className="text-2xl font-bold text-primary">
                            {performance.metrics.salesPerformance ? `${performance.metrics.salesPerformance}%` : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Sales Performance</div>
                        </div>
                        <div className="p-4 border rounded-md text-center">
                          <div className="text-2xl font-bold text-primary">
                            {performance.metrics.attendanceRate ? `${performance.metrics.attendanceRate}%` : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Attendance Rate</div>
                        </div>
                        <div className="p-4 border rounded-md text-center">
                          <div className="text-2xl font-bold text-primary">
                            {performance.metrics.efficiencyScore ? `${performance.metrics.efficiencyScore}%` : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Efficiency Score</div>
                        </div>
                      </div>
                      
                      <div className="h-80">
                        <h4 className="text-sm font-medium mb-4">Performance Trends</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={performance.history}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="metrics.customerRating"
                              name="Customer Rating"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="metrics.salesPerformance"
                              name="Sales Performance"
                              stroke="#82ca9d"
                            />
                            <Line
                              type="monotone"
                              dataKey="metrics.attendanceRate"
                              name="Attendance Rate"
                              stroke="#ffc658"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No performance data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{formatDate(doc.date)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found for this staff member
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No certifications or training records found
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
