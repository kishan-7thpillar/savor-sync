"use client";

import { useState, useEffect } from "react";
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
import { MetricsCard } from "@/components/dashboard/metrics-card";
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
  Briefcase,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState("directory");
  const [staff, setStaff] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    managersCount: 0,
    cashiersCount: 0,
    averageHourlyRate: 0,
  });
  const [analytics, setAnalytics] = useState<any>({
    byPosition: [],
    byStatus: [],
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [costMetrics, setCostMetrics] = useState({
    totalLaborCost: 0,
    totalTips: 0,
    totalHours: 0,
    averageShiftCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/team-members");
      const result = await response.json();

      if (result.success) {
        const teamMembers = result.data;

        // Transform Square team members to staff format
        const transformedStaff = teamMembers.map((member: any) => ({
          id: member.id,
          fullName: member.name,
          email: member.email || "No email",
          phone: member.phone || "No phone",
          position: member.role,
          status: member.status,
          hourlyRate: member.hourlyRate,
          salaryAnnual:
            member.payType === "SALARY" ? member.hourlyRate * 2080 : null, // Assuming 40hrs/week * 52 weeks
          joinDate: new Date(member.createdAt).toLocaleDateString(),
          isOwner: member.isOwner,
          payType: member.payType,
          shiftMetrics: member.shiftMetrics,
        }));

        setStaff(transformedStaff);
        setShifts(result.shifts || []);

        // Calculate metrics
        const totalStaff = transformedStaff.length;
        const activeStaff = transformedStaff.filter(
          (s: any) => s.status === "ACTIVE"
        ).length;
        const managersCount = transformedStaff.filter((s: any) =>
          s.position.toLowerCase().includes("manager")
        ).length;
        const hourlyRates = transformedStaff
          .filter((s: any) => s.hourlyRate > 0)
          .map((s: any) => s.hourlyRate);
        const averageHourlyRate =
          hourlyRates.length > 0
            ? hourlyRates.reduce((a: number, b: number) => a + b, 0) /
              hourlyRates.length
            : 0;

        // Calculate cost metrics from shift data
        const totalLaborCost = transformedStaff.reduce(
          (total: number, member: any) => {
            return total + (member.shiftMetrics?.totalCost || 0);
          },
          0
        );

        const totalTips = transformedStaff.reduce(
          (total: number, member: any) => {
            return total + (member.shiftMetrics?.totalTips || 0);
          },
          0
        );

        const totalHours = transformedStaff.reduce(
          (total: number, member: any) => {
            return total + (member.shiftMetrics?.totalHours || 0);
          },
          0
        );

        const totalShifts = transformedStaff.reduce(
          (total: number, member: any) => {
            return total + (member.shiftMetrics?.totalShifts || 0);
          },
          0
        );

        setCostMetrics({
          totalLaborCost: Math.round(totalLaborCost * 100) / 100,
          totalTips: Math.round(totalTips * 100) / 100,
          totalHours: Math.round(totalHours * 100) / 100,
          averageShiftCost:
            totalShifts > 0
              ? Math.round((totalLaborCost / totalShifts) * 100) / 100
              : 0,
        });

        setMetrics({
          totalStaff,
          activeStaff,
          inactiveStaff: totalStaff - activeStaff,
          managersCount,
          cashiersCount: transformedStaff.filter((s: any) =>
            s.position.toLowerCase().includes("cashier")
          ).length,
          averageHourlyRate,
        });

        // Calculate analytics
        const positionCounts = transformedStaff.reduce(
          (acc: any, member: any) => {
            acc[member.position] = (acc[member.position] || 0) + 1;
            return acc;
          },
          {}
        );

        const statusCounts = transformedStaff.reduce(
          (acc: any, member: any) => {
            acc[member.status] = (acc[member.status] || 0) + 1;
            return acc;
          },
          {}
        );

        const byPosition = Object.entries(positionCounts).map(
          ([name, count]: [string, any]) => ({
            name,
            count,
            percentage: Math.round((count / totalStaff) * 100),
          })
        );

        const byStatus = Object.entries(statusCounts).map(
          ([name, count]: [string, any]) => ({
            name,
            count,
            percentage: Math.round((count / totalStaff) * 100),
          })
        );

        setAnalytics({ byPosition, byStatus });
      } else {
        console.error("API Error:", result.error);
        // Fallback to mock data based on shift data
        const mockStaff = [
          {
            id: "tm_jkl789mno012pqr345",
            fullName: "Sarah Johnson",
            email: "sarah.johnson@restaurant.com",
            phone: "+12345678901",
            position: "Manager",
            status: "ACTIVE",
            hourlyRate: 25.0,
            salaryAnnual: null,
            joinDate: new Date("2024-01-15T10:30:00Z").toLocaleDateString(),
            isOwner: false,
            payType: "HOURLY",
            shiftMetrics: {
              totalShifts: 3,
              totalHours: 22.5,
              totalCost: 562.5,
              totalTips: 29.5,
            },
          },
          {
            id: "tm_stu456vwx789yza012",
            fullName: "Mike Davis",
            email: "mike.davis@restaurant.com",
            phone: "+12345678902",
            position: "Server",
            status: "ACTIVE",
            hourlyRate: 15.0,
            salaryAnnual: null,
            joinDate: new Date("2024-02-20T09:15:00Z").toLocaleDateString(),
            isOwner: false,
            payType: "HOURLY",
            shiftMetrics: {
              totalShifts: 3,
              totalHours: 23.75,
              totalTips: 64.0,
              totalCost: 356.25,
            },
          },
          {
            id: "tm_bcd345efg678hij901",
            fullName: "Emily Rodriguez",
            email: "emily.rodriguez@restaurant.com",
            phone: "+12345678903",
            position: "Kitchen Staff",
            status: "ACTIVE",
            hourlyRate: 18.0,
            salaryAnnual: null,
            joinDate: new Date("2024-03-10T11:00:00Z").toLocaleDateString(),
            isOwner: false,
            payType: "HOURLY",
            shiftMetrics: {
              totalShifts: 3,
              totalHours: 22.5,
              totalCost: 405.0,
              totalTips: 12.7,
            },
          },
        ];

        setStaff(mockStaff);
        setMetrics({
          totalStaff: 3,
          activeStaff: 3,
          inactiveStaff: 0,
          managersCount: 1,
          cashiersCount: 0,
          averageHourlyRate: 19.33,
        });
        setAnalytics({
          byPosition: [
            { name: "Manager", count: 1, percentage: 33 },
            { name: "Server", count: 1, percentage: 33 },
            { name: "Kitchen Staff", count: 1, percentage: 33 },
          ],
          byStatus: [{ name: "ACTIVE", count: 3, percentage: 100 }],
        });
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      // Fallback to mock data on error based on shift data
      const mockStaff = [
        {
          id: "tm_jkl789mno012pqr345",
          fullName: "Sarah Johnson",
          email: "sarah.johnson@restaurant.com",
          phone: "+12345678901",
          position: "Manager",
          status: "ACTIVE",
          hourlyRate: 25.0,
          salaryAnnual: null,
          joinDate: new Date("2024-01-15T10:30:00Z").toLocaleDateString(),
          isOwner: false,
          payType: "HOURLY",
          shiftMetrics: {
            totalShifts: 3,
            totalHours: 22.5,
            totalCost: 562.5,
            totalTips: 29.5,
          },
        },
        {
          id: "tm_stu456vwx789yza012",
          fullName: "Mike Davis",
          email: "mike.davis@restaurant.com",
          phone: "+12345678902",
          position: "Server",
          status: "ACTIVE",
          hourlyRate: 15.0,
          salaryAnnual: null,
          joinDate: new Date("2024-02-20T09:15:00Z").toLocaleDateString(),
          isOwner: false,
          payType: "HOURLY",
          shiftMetrics: {
            totalShifts: 3,
            totalHours: 23.75,
            totalTips: 64.0,
            totalCost: 356.25,
          },
        },
        {
          id: "tm_bcd345efg678hij901",
          fullName: "Emily Rodriguez",
          email: "emily.rodriguez@restaurant.com",
          phone: "+12345678903",
          position: "Kitchen Staff",
          status: "ACTIVE",
          hourlyRate: 18.0,
          salaryAnnual: null,
          joinDate: new Date("2024-03-10T11:00:00Z").toLocaleDateString(),
          isOwner: false,
          payType: "HOURLY",
          shiftMetrics: {
            totalShifts: 3,
            totalHours: 22.5,
            totalCost: 405.0,
            totalTips: 12.7,
          },
        },
      ];

      setStaff(mockStaff);
      setMetrics({
        totalStaff: 3,
        activeStaff: 3,
        inactiveStaff: 0,
        managersCount: 1,
        cashiersCount: 0,
        averageHourlyRate: 19.33,
      });
      setAnalytics({
        byPosition: [
          { name: "Manager", count: 1, percentage: 33 },
          { name: "Server", count: 1, percentage: 33 },
          { name: "Kitchen Staff", count: 1, percentage: 33 },
        ],
        byStatus: [{ name: "ACTIVE", count: 3, percentage: 100 }],
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Manage your restaurant team members from Square
        </p>
      </div>

      {/* Staff Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Staff"
          value={metrics.totalStaff.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Active Staff"
          value={metrics.activeStaff.toLocaleString()}
          change={
            metrics.activeStaff > 0
              ? (metrics.activeStaff / metrics.totalStaff) * 100
              : 0
          }
          changeLabel="of total"
          icon={<Users className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Managers"
          value={metrics.managersCount.toLocaleString()}
          icon={<UserPlus className="h-4 w-4 text-blue-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Avg Hourly Rate"
          value={formatCurrency(metrics.averageHourlyRate)}
          icon={<DollarSign className="h-4 w-4 text-yellow-600" />}
          loading={loading}
        />
      </div>

      {/* Cost Management Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Labor Cost"
          value={formatCurrency(costMetrics.totalLaborCost)}
          icon={<DollarSign className="h-4 w-4 text-red-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Tips"
          value={formatCurrency(costMetrics.totalTips)}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Total Hours"
          value={`${costMetrics.totalHours.toLocaleString()}h`}
          icon={<Clock className="h-4 w-4 text-blue-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Avg Shift Cost"
          value={formatCurrency(costMetrics.averageShiftCost)}
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
          loading={loading}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="directory" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Shifts & Costs
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
            <Button variant="outline" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff (Square)
            </Button>
          </div>
        </div>

        <TabsContent value="directory" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse bg-muted rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {filteredStaff.length} staff members found
                </h3>
              </div>

              {filteredStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No staff found matching your search."
                    : "No staff found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStaff.map((member) => (
                    <Card
                      key={member.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                          <div className="w-20 h-20 bg-background rounded-full border-4 border-background shadow-sm flex items-center justify-center">
                            <Users className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              member.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="pt-4">
                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-lg">
                            {member.fullName}
                          </h3>
                          <div className="flex items-center justify-center space-x-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {member.position}
                            </Badge>
                            {member.isOwner && (
                              <Badge variant="secondary" className="text-xs">
                                Owner
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {member.email !== "No email" && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}

                          {member.phone !== "No phone" && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Joined {member.joinDate}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {member.hourlyRate > 0 &&
                              member.payType === "HOURLY" && (
                                <span>
                                  {formatCurrency(member.hourlyRate)}/hr
                                </span>
                              )}
                            {member.hourlyRate > 0 &&
                              member.payType === "SALARY" && (
                                <span>
                                  {formatCurrency(
                                    member.salaryAnnual ||
                                      member.hourlyRate * 2080
                                  )}
                                  /year
                                </span>
                              )}
                            {(member.payType === "NONE" ||
                              member.hourlyRate === 0) && (
                              <span className="text-muted-foreground">
                                No pay rate
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <div className="border-t p-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-semibold">
                              {member.shiftMetrics?.totalShifts || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Shifts
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">
                              {member.shiftMetrics?.totalHours || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Hours
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(
                                member.shiftMetrics?.totalTips || 0
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tips
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Schedule Calendar</CardTitle>
                  <CardDescription>
                    View shifts and costs by employee and date
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
                      Employee
                    </div>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(calendarDate);
                      date.setDate(date.getDate() - date.getDay() + i);
                      return (
                        <div
                          key={i}
                          className="font-semibold text-sm p-2 bg-muted rounded text-center"
                        >
                          <div>
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Body */}
                  <div className="space-y-2">
                    {staff.map((employee) => (
                      <div key={employee.id} className="grid grid-cols-8 gap-2">
                        {/* Employee Name Column */}
                        <div className="p-3 border rounded flex items-center space-x-2 bg-background">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {employee.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {employee.position}
                            </div>
                          </div>
                        </div>

                        {/* Date Columns */}
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const date = new Date(calendarDate);
                          date.setDate(
                            date.getDate() - date.getDay() + dayIndex
                          );

                          // Find shifts for this employee on this date
                          const dayShifts = shifts.filter((shift) => {
                            const shiftDate = new Date(shift.start_at);
                            return (
                              shift.team_member_id === employee.id &&
                              shiftDate.toDateString() === date.toDateString()
                            );
                          });

                          return (
                            <div
                              key={dayIndex}
                              className="p-2 border rounded min-h-[80px] bg-background"
                            >
                              {dayShifts.length > 0 ? (
                                <div className="space-y-1">
                                  {dayShifts.map((shift, shiftIndex) => {
                                    const startTime = new Date(shift.start_at);
                                    const endTime = new Date(shift.end_at);
                                    const duration =
                                      (endTime.getTime() -
                                        startTime.getTime()) /
                                      (1000 * 60 * 60);
                                    const hourlyRate =
                                      shift.wage.hourly_rate.amount / 100;
                                    const shiftCost = duration * hourlyRate;
                                    const tips =
                                      shift.declared_cash_tip_money.amount /
                                      100;

                                    return (
                                      <div key={shiftIndex} className="text-xs">
                                        <div className="font-medium text-blue-600">
                                          {startTime.toLocaleTimeString(
                                            "en-US",
                                            {
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: true,
                                            }
                                          )}{" "}
                                          -{" "}
                                          {endTime.toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          })}
                                        </div>
                                        <div className="text-green-600 font-medium">
                                          {formatCurrency(shiftCost)}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {duration.toFixed(1)}h
                                        </div>
                                        {tips > 0 && (
                                          <div className="text-orange-600 text-xs">
                                            +{formatCurrency(tips)} tips
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

                  {/* Weekly Summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Weekly Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {
                            shifts.filter((shift) => {
                              const shiftDate = new Date(shift.start_at);
                              const weekStart = new Date(calendarDate);
                              weekStart.setDate(
                                weekStart.getDate() - weekStart.getDay()
                              );
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 6);
                              return (
                                shiftDate >= weekStart && shiftDate <= weekEnd
                              );
                            }).length
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Shifts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            shifts
                              .filter((shift) => {
                                const shiftDate = new Date(shift.start_at);
                                const weekStart = new Date(calendarDate);
                                weekStart.setDate(
                                  weekStart.getDate() - weekStart.getDay()
                                );
                                const weekEnd = new Date(weekStart);
                                weekEnd.setDate(weekEnd.getDate() + 6);
                                return (
                                  shiftDate >= weekStart && shiftDate <= weekEnd
                                );
                              })
                              .reduce((total, shift) => {
                                const startTime = new Date(shift.start_at);
                                const endTime = new Date(shift.end_at);
                                const duration =
                                  (endTime.getTime() - startTime.getTime()) /
                                  (1000 * 60 * 60);
                                const hourlyRate =
                                  shift.wage.hourly_rate.amount / 100;
                                return total + duration * hourlyRate;
                              }, 0)
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Labor Cost
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {shifts
                            .filter((shift) => {
                              const shiftDate = new Date(shift.start_at);
                              const weekStart = new Date(calendarDate);
                              weekStart.setDate(
                                weekStart.getDate() - weekStart.getDay()
                              );
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 6);
                              return (
                                shiftDate >= weekStart && shiftDate <= weekEnd
                              );
                            })
                            .reduce((total, shift) => {
                              const startTime = new Date(shift.start_at);
                              const endTime = new Date(shift.end_at);
                              const duration =
                                (endTime.getTime() - startTime.getTime()) /
                                (1000 * 60 * 60);
                              return total + duration;
                            }, 0)
                            .toFixed(1)}
                          h
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Hours
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(
                            shifts
                              .filter((shift) => {
                                const shiftDate = new Date(shift.start_at);
                                const weekStart = new Date(calendarDate);
                                weekStart.setDate(
                                  weekStart.getDate() - weekStart.getDay()
                                );
                                const weekEnd = new Date(weekStart);
                                weekEnd.setDate(weekEnd.getDate() + 6);
                                return (
                                  shiftDate >= weekStart && shiftDate <= weekEnd
                                );
                              })
                              .reduce((total, shift) => {
                                return (
                                  total +
                                  shift.declared_cash_tip_money.amount / 100
                                );
                              }, 0)
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Tips
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
