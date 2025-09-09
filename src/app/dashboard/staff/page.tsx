"use client";

import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import {
  mockStaffMembers,
  mockShifts,
  mockTimeLogs,
  mockLaborCosts,
  mockStaffPerformance,
  mockLocations,
  getStaffByLocation,
  getStaffByRole,
  getShiftsByDateRange,
  getTopPerformers,
  calculateLaborMetrics,
  type StaffRole,
} from "@/data/mockSalesData";
import {
  Users,
  MapPin,
  BarChart3,
  Search,
  Mail,
  Phone,
  DollarSign,
  Clock,
  UserPlus,
  Calendar,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Award,
  Star,
} from "lucide-react";

export default function StaffManagementPage() {
  const selectedLocation = useAppSelector((state) => state.location.selectedLocation);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Get filtered staff based on location and role
  const filteredStaff = useMemo(() => {
    let staff = getStaffByLocation(selectedLocation || 'all');
    
    if (roleFilter !== 'all') {
      staff = staff.filter(s => s.role === roleFilter);
    }
    
    if (searchTerm) {
      staff = staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return staff;
  }, [selectedLocation, roleFilter, searchTerm]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const locationId = selectedLocation || 'all';
    const staff = getStaffByLocation(locationId);
    const laborMetrics = calculateLaborMetrics(locationId);
    const topPerformers = getTopPerformers(locationId);
    
    return {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.isActive).length,
      totalLaborCost: laborMetrics.totalLaborCost,
      totalHours: laborMetrics.totalRegularHours + laborMetrics.totalOvertimeHours,
      averageHourlyRate: laborMetrics.averageHourlyRate,
      laborCostPercentage: laborMetrics.laborCostPercentage,
      topPerformers
    };
  }, [selectedLocation]);

  // Get shifts for calendar view
  const weekShifts = useMemo(() => {
    const startOfWeek = new Date(calendarDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    return getShiftsByDateRange(startOfWeek, endOfWeek, selectedLocation);
  }, [calendarDate, selectedLocation]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff & Labor Management</h2>
        <p className="text-muted-foreground">
          Comprehensive staff directory, scheduling, and performance analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Staff"
          value={metrics.totalStaff.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Active Staff"
          value={metrics.activeStaff.toLocaleString()}
          change={metrics.totalStaff > 0 ? (metrics.activeStaff / metrics.totalStaff) * 100 : 0}
          changeLabel="of total"
          icon={<Users className="h-4 w-4 text-green-600" />}
        />
        <MetricsCard
          title="Total Labor Cost"
          value={formatCurrency(metrics.totalLaborCost)}
          icon={<DollarSign className="h-4 w-4 text-red-600" />}
        />
        <MetricsCard
          title="Labor Cost %"
          value={`${metrics.laborCostPercentage}%`}
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as StaffRole | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="FOH">FOH</SelectItem>
                <SelectItem value="BOH">BOH</SelectItem>
                <SelectItem value="Kitchen">Kitchen</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Top Performers
              </CardTitle>
              <CardDescription>
                Staff members with highest hours worked this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{performer.name}</div>
                        <div className="text-sm text-muted-foreground">{performer.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{performer.performance.hoursWorked}h</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(performer.performance.totalEarnings)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Labor Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Labor Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Hours</span>
                    <span className="font-semibold">{metrics.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Hourly Rate</span>
                    <span className="font-semibold">{formatCurrency(metrics.averageHourlyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Labor Cost</span>
                    <span className="font-semibold text-red-600">{formatCurrency(metrics.totalLaborCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Manager', 'FOH', 'BOH', 'Kitchen'].map(role => {
                    const roleStaff = getStaffByRole(role as StaffRole);
                    const count = selectedLocation && selectedLocation !== 'all' 
                      ? roleStaff.filter(s => s.locationId === selectedLocation).length
                      : roleStaff.length;
                    const percentage = metrics.totalStaff > 0 ? (count / metrics.totalStaff) * 100 : 0;
                    
                    return (
                      <div key={role} className="flex justify-between items-center">
                        <span>{role}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{count}</span>
                          <span className="text-sm text-muted-foreground">({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Directory Tab */}
        <TabsContent value="directory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {filteredStaff.length} staff members found
            </h3>
            <Button variant="outline" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || roleFilter !== 'all'
                ? "No staff found matching your filters."
                : "No staff found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((member) => {
                const performance = mockStaffPerformance.find(p => p.staffId === member.id);
                return (
                  <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                        <div className="w-20 h-20 bg-background rounded-full border-4 border-background shadow-sm flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-4">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{member.phone}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{mockLocations.find(l => l.id === member.locationId)?.name || 'Unknown'}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(member.hourlyRate)}/hr</span>
                        </div>
                      </div>
                    </CardContent>

                    {performance && (
                      <div className="border-t p-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-semibold">{performance.hoursWorked}</div>
                            <div className="text-xs text-muted-foreground">Hours</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{performance.attendanceRate}%</div>
                            <div className="text-xs text-muted-foreground">Attendance</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(performance.totalTips)}
                            </div>
                            <div className="text-xs text-muted-foreground">Tips</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    View and manage staff shifts for the week
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setDate(newDate.getDate() - 7);
                      setCalendarDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setDate(newDate.getDate() + 7);
                      setCalendarDate(newDate);
                    }}
                  >
                    Next Week
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-semibold text-sm p-2 bg-muted rounded">
                      Staff Member
                    </div>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(calendarDate);
                      date.setDate(date.getDate() - date.getDay() + i);
                      return (
                        <div key={i} className="font-semibold text-sm p-2 bg-muted rounded text-center">
                          <div>
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Body */}
                  <div className="space-y-2">
                    {filteredStaff.map((employee) => (
                      <div key={employee.id} className="grid grid-cols-8 gap-2">
                        {/* Employee Name Column */}
                        <div className="p-3 border rounded flex items-center space-x-2 bg-background">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.role}</div>
                          </div>
                        </div>

                        {/* Date Columns */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const date = new Date(calendarDate);
                          date.setDate(date.getDate() - date.getDay() + dayIndex);
                          const dateString = date.toISOString().split('T')[0];

                          // Find shifts for this employee on this date
                          const dayShifts = weekShifts.filter(shift => 
                            shift.staffId === employee.id && shift.date === dateString
                          );

                          return (
                            <div key={dayIndex} className="p-2 border rounded min-h-[80px] bg-background">
                              {dayShifts.length > 0 ? (
                                <div className="space-y-1">
                                  {dayShifts.map((shift) => {
                                    const timeLog = mockTimeLogs.find(log => log.shiftId === shift.id);
                                    const laborCost = mockLaborCosts.find(cost => 
                                      cost.staffId === shift.staffId && cost.date === shift.date
                                    );

                                    return (
                                      <div key={shift.id} className="text-xs">
                                        <div className="font-medium text-blue-600">
                                          {shift.startTime} - {shift.endTime}
                                        </div>
                                        <Badge 
                                          variant={
                                            shift.status === "completed" ? "default" :
                                            shift.status === "in_progress" ? "secondary" :
                                            shift.status === "no_show" ? "destructive" : "outline"
                                          }
                                          className="text-xs"
                                        >
                                          {shift.status.replace('_', ' ')}
                                        </Badge>
                                        {timeLog && (
                                          <div className="text-muted-foreground mt-1">
                                            {timeLog.totalHours}h worked
                                          </div>
                                        )}
                                        {laborCost && (
                                          <div className="text-green-600 font-medium">
                                            {formatCurrency(laborCost.totalCompensation)}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground text-center pt-6">
                                  No shifts
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((staff) => {
              const performance = mockStaffPerformance.find(p => p.staffId === staff.id);
              if (!performance) return null;

              return (
                <Card key={staff.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{staff.name}</CardTitle>
                        <CardDescription>{staff.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{performance.hoursWorked}</div>
                        <div className="text-xs text-muted-foreground">Hours Worked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{performance.attendanceRate}%</div>
                        <div className="text-xs text-muted-foreground">Attendance</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Shifts Completed</span>
                        <span className="font-semibold">{performance.shiftsCompleted}/{performance.shiftsScheduled}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Earnings</span>
                        <span className="font-semibold text-green-600">{formatCurrency(performance.totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quality Score</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{performance.qualityScore}/10</span>
                        </div>
                      </div>
                      {performance.customerRating && (
                        <div className="flex justify-between">
                          <span className="text-sm">Customer Rating</span>
                          <span className="font-semibold">{performance.customerRating.toFixed(1)}/5.0</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
