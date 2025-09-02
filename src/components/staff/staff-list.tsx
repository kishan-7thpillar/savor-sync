"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Staff, StaffLocation } from "@/lib/types/staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  UserPlus,
  Grid3X3,
  List,
} from "lucide-react";

interface StaffListProps {
  onEdit: (staff: Staff) => void;
  onView: (staff: Staff) => void;
  onDelete: (staffId: string) => void;
  onAddNew: () => void;
}

export function StaffList({ onEdit, onView, onDelete, onAddNew }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  const supabase = createClient();
  
  useEffect(() => {
    fetchStaffData();
    fetchLocations();
  }, [currentPage, locationFilter, departmentFilter, positionFilter, statusFilter, searchQuery]);
  
  async function fetchStaffData() {
    setLoading(true);
    try {
      // Get the current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      const { data: userOrg } = await supabase
        .from("user_organizations")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      
      if (!userOrg) {
        throw new Error("Organization not found");
      }
      
      // Build the query
      let query = supabase
        .from("staff")
        .select(`
          *,
          staff_locations!inner(
            id,
            location_id,
            is_primary_location,
            locations(id, name)
          ),
          staff_roles(id, role_name, permissions, location_id, is_active)
        `)
        .eq("organization_id", userOrg.organization_id);
      
      // Apply filters
      if (locationFilter !== "all") {
        query = query.eq("staff_locations.location_id", locationFilter);
      }
      
      if (departmentFilter !== "all") {
        query = query.eq("department", departmentFilter);
      }
      
      if (positionFilter !== "all") {
        query = query.eq("position", positionFilter);
      }
      
      if (statusFilter !== "all") {
        query = query.eq("employment_status", statusFilter);
      }
      
      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,employee_id.ilike.%${searchQuery}%`);
      }
      
      // Get count for pagination
      const { count } = await query.select("id", { count: "exact", head: true });
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      
      // Get paginated data
      const { data: staffData, error } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order("last_name", { ascending: true });
      
      if (error) throw error;
      
      // Process the data to match our Staff interface
      const processedStaff: Staff[] = staffData.map((item: any) => {
        // Extract locations from the nested data
        const locations: StaffLocation[] = item.staff_locations.map((loc: any) => ({
          id: loc.id,
          locationId: loc.location_id,
          locationName: loc.locations.name,
          isPrimaryLocation: loc.is_primary_location,
          startDate: new Date(loc.start_date),
          endDate: loc.end_date ? new Date(loc.end_date) : undefined,
        }));
        
        return {
          id: item.id,
          organizationId: item.organization_id,
          employeeId: item.employee_id,
          userId: item.user_id,
          firstName: item.first_name,
          lastName: item.last_name,
          email: item.email,
          phone: item.phone,
          dateOfBirth: item.date_of_birth ? new Date(item.date_of_birth) : undefined,
          hireDate: new Date(item.hire_date),
          terminationDate: item.termination_date ? new Date(item.termination_date) : undefined,
          employmentStatus: item.employment_status,
          position: item.position,
          department: item.department,
          hourlyRate: item.hourly_rate,
          salaryAnnual: item.salary_annual,
          emergencyContactName: item.emergency_contact_name,
          emergencyContactPhone: item.emergency_contact_phone,
          notes: item.notes,
          profilePhotoUrl: item.profile_photo_url,
          locations,
          roles: item.staff_roles.map((role: any) => ({
            id: role.id,
            roleName: role.role_name,
            permissions: role.permissions || {},
            locationId: role.location_id,
            isActive: role.is_active,
          })),
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        };
      });
      
      setStaff(processedStaff);
      
      // Extract unique departments and positions for filters
      if (staffData.length > 0) {
        const uniqueDepartments = [...new Set(staffData.map((item: any) => item.department).filter(Boolean))];
        const uniquePositions = [...new Set(staffData.map((item: any) => item.position).filter(Boolean))];
        
        setDepartments(uniqueDepartments);
        setPositions(uniquePositions);
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchLocations() {
    try {
      const { data: locationsData, error } = await supabase
        .from("locations")
        .select("id, name");
      
      if (error) throw error;
      
      setLocations(locationsData || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
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
  
  function getPrimaryLocation(staff: Staff) {
    const primary = staff.locations.find(loc => loc.isPrimaryLocation);
    return primary ? primary.locationName : "Not assigned";
  }
  
  function formatDate(date: Date | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }
  
  function handleExport() {
    // Implementation for exporting staff data
    console.log("Exporting staff data");
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-medium">Staff Directory</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode("table")}>
            <List className={`h-4 w-4 ${viewMode === "table" ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("cards")}>
            <Grid3X3 className={`h-4 w-4 ${viewMode === "cards" ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={onAddNew}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading staff data...
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No staff members found. Adjust filters or add new staff.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>{member.employeeId || "—"}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.department || "—"}</TableCell>
                      <TableCell>{getPrimaryLocation(member)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(member.employmentStatus)}>
                          {member.employmentStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.hireDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(member)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(member)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(member.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Card View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading staff data...</div>
          ) : staff.length === 0 ? (
            <div className="col-span-full text-center py-8">
              No staff members found. Adjust filters or add new staff.
            </div>
          ) : (
            staff.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.profilePhotoUrl ? (
                          <img
                            src={member.profilePhotoUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-primary">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {member.position}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(member.employmentStatus)}>
                      {member.employmentStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{member.employeeId || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span>{member.department || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{getPrimaryLocation(member)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hire Date:</span>
                      <span>{formatDate(member.hireDate)}</span>
                    </div>
                    <div className="pt-2 flex justify-between space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onView(member)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEdit(member)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
                if (i === 4) pageNum = totalPages;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
                if (i === 0) pageNum = 1;
              } else {
                pageNum = currentPage - 2 + i;
                if (i === 0) pageNum = 1;
                if (i === 4) pageNum = totalPages;
              }
              
              return (
                <PaginationItem key={i}>
                  {(i === 1 && pageNum > 2) || (i === 3 && pageNum < totalPages - 1) ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
