"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  mockTasks,
  mockTaskPerformanceMetrics,
  mockDailyActionPlans,
  mockStaffMembers,
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  StaffRole,
  getTasksByLocation,
  getTasksByStatus,
  getTasksByDateRange,
} from "@/data/mockSalesData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Play,
  Users,
  TrendingUp,
  Target,
  Calendar,
  Filter,
  Search,
  Plus,
  BarChart3,
  Award,
  Zap,
} from "lucide-react";

export default function TasksPage() {
  const selectedLocation = useSelector((state: RootState) => state.location.selectedLocation);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("today");

  // Filter tasks based on location and filters
  const filteredTasks = useMemo(() => {
    let tasks = selectedLocation === "all" ? mockTasks : getTasksByLocation(selectedLocation);

    // Apply date filter
    const now = new Date();
    if (dateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      tasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= today && taskDate < tomorrow;
      });
    } else if (dateRange === "week") {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      tasks = getTasksByDateRange(weekStart, now);
    } else if (dateRange === "month") {
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      tasks = getTasksByDateRange(monthStart, now);
    }

    // Apply other filters
    if (statusFilter !== "all") {
      tasks = tasks.filter(task => task.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      tasks = tasks.filter(task => task.priority === priorityFilter);
    }
    if (categoryFilter !== "all") {
      tasks = tasks.filter(task => task.category === categoryFilter);
    }
    if (roleFilter !== "all") {
      tasks = tasks.filter(task => {
        const staff = mockStaffMembers.find(s => s.id === task.assignedTo);
        return staff?.role === roleFilter;
      });
    }
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return tasks;
  }, [selectedLocation, searchTerm, statusFilter, priorityFilter, categoryFilter, roleFilter, dateRange]);

  // Calculate metrics
  const taskMetrics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === "completed").length;
    const inProgress = filteredTasks.filter(t => t.status === "in_progress").length;
    const overdue = filteredTasks.filter(t => t.status === "overdue").length;
    const pending = filteredTasks.filter(t => t.status === "pending").length;

    return { total, completed, inProgress, overdue, pending };
  }, [filteredTasks]);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Play className="h-4 w-4 text-blue-500" />;
      case "overdue": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getCategoryColor = (category: TaskCategory) => {
    const colors = {
      cleaning: "bg-blue-100 text-blue-800",
      inventory: "bg-purple-100 text-purple-800",
      customer_service: "bg-pink-100 text-pink-800",
      maintenance: "bg-orange-100 text-orange-800",
      training: "bg-indigo-100 text-indigo-800",
      compliance: "bg-red-100 text-red-800",
      sales: "bg-green-100 text-green-800",
      operations: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and track tasks across all locations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold">{taskMetrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskMetrics.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{taskMetrics.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{taskMetrics.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{taskMetrics.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="action-plan">Daily Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Task Table */}
          {filteredTasks.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => {
                      const assignedStaff = mockStaffMembers.find(s => s.id === task.assignedTo);
                      const dueDate = new Date(task.dueDate);
                      const isOverdue = task.status !== "completed" && dueDate < new Date();
                      
                      return (
                        <TableRow key={task.id} className={`${isOverdue ? 'bg-red-50' : ''}`}>
                          <TableCell>
                            {getStatusIcon(task.status)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {task.description}
                              </div>
                              {task.escalation?.isEscalated && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs mt-1">
                                  🚨 Escalated
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCategoryColor(task.category)}>
                              {task.category.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{assignedStaff?.name}</div>
                              <div className="text-sm text-muted-foreground">{assignedStaff?.role}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{task.locationName}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{dueDate.toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {task.actualDuration ? (
                                <span className="text-green-600">{task.actualDuration}min</span>
                              ) : (
                                <span>{task.estimatedDuration}min</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.qualityScore ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {task.qualityScore}/10
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {task.status === "pending" && (
                                <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                                  Start
                                </Button>
                              )}
                              {task.status === "in_progress" && (
                                <Button size="sm" className="h-8 px-2 text-xs">
                                  Complete
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or create a new task.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Task Completion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Completion Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {taskMetrics.total > 0 ? Math.round((taskMetrics.completed / taskMetrics.total) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {taskMetrics.completed} of {taskMetrics.total} tasks completed
                </p>
              </CardContent>
            </Card>

            {/* Average Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Avg Quality Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(() => {
                    const completedWithQuality = filteredTasks.filter(t => t.status === "completed" && t.qualityScore);
                    const avgQuality = completedWithQuality.length > 0 
                      ? completedWithQuality.reduce((sum, t) => sum + (t.qualityScore || 0), 0) / completedWithQuality.length
                      : 0;
                    return avgQuality.toFixed(1);
                  })()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Out of 10 scale
                </p>
              </CardContent>
            </Card>

            {/* Efficiency Metric */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {(() => {
                    const completedTasks = filteredTasks.filter(t => t.status === "completed" && t.actualDuration);
                    const efficiency = completedTasks.length > 0
                      ? completedTasks.reduce((sum, t) => {
                          const ratio = t.estimatedDuration / (t.actualDuration || t.estimatedDuration);
                          return sum + ratio;
                        }, 0) / completedTasks.length
                      : 1;
                    return Math.round(efficiency * 100);
                  })()}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated vs actual time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Categories Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["cleaning", "inventory", "customer_service", "maintenance", "training", "compliance", "sales", "operations"].map(category => {
                  const categoryTasks = filteredTasks.filter(t => t.category === category);
                  const completed = categoryTasks.filter(t => t.status === "completed").length;
                  const completionRate = categoryTasks.length > 0 ? (completed / categoryTasks.length) * 100 : 0;
                  
                  return (
                    <div key={category} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{categoryTasks.length}</div>
                      <div className="text-sm font-medium capitalize">{category.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {completionRate.toFixed(0)}% complete
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {mockTaskPerformanceMetrics
              .filter(metrics => selectedLocation === "all" || metrics.locationId === selectedLocation)
              .map(metrics => {
                const staff = mockStaffMembers.find(s => s.id === metrics.staffId);
                if (!staff) return null;

                const getTierColor = (tier: string) => {
                  switch (tier) {
                    case "platinum": return "bg-purple-100 text-purple-800 border-purple-200";
                    case "gold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
                    case "silver": return "bg-gray-100 text-gray-800 border-gray-200";
                    default: return "bg-orange-100 text-orange-800 border-orange-200";
                  }
                };

                return (
                  <Card key={metrics.staffId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{staff.name}</h3>
                            <Badge variant="outline">{staff.role}</Badge>
                            <Badge className={getTierColor(metrics.tier)}>
                              {metrics.tier.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Tasks Assigned</p>
                              <p className="font-semibold">{metrics.tasksAssigned}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Completed</p>
                              <p className="font-semibold text-green-600">{metrics.tasksCompleted}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">On-Time Rate</p>
                              <p className="font-semibold">{metrics.onTimeCompletionRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Quality</p>
                              <p className="font-semibold">{metrics.averageQualityScore}/10</p>
                            </div>
                          </div>
                          {metrics.improvementAreas.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Improvement Areas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {metrics.improvementAreas.map(area => (
                                  <Badge key={area} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          {mockDailyActionPlans
            .filter(plan => selectedLocation === "all" || plan.locationId === selectedLocation)
            .map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Daily Action Plan - {plan.date}</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Generated by {plan.generatedBy.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* KPI Targets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">${plan.kpiTargets.salesTarget}</div>
                      <div className="text-sm text-green-600">Sales Target</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">{plan.kpiTargets.customerSatisfactionTarget}</div>
                      <div className="text-sm text-blue-600">Customer Satisfaction</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">{plan.kpiTargets.operationalEfficiencyTarget}%</div>
                      <div className="text-sm text-purple-600">Operational Efficiency</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700">{plan.kpiTargets.costReductionTarget}%</div>
                      <div className="text-sm text-orange-600">Cost Reduction</div>
                    </div>
                  </div>

                  {/* Priority Tasks */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">High Priority ({plan.priorities.high.length})</h4>
                      <div className="space-y-2">
                        {plan.priorities.high.slice(0, 3).map(task => (
                          <div key={task.id} className="p-2 bg-red-50 rounded text-sm">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-muted-foreground">
                              {mockStaffMembers.find(s => s.id === task.assignedTo)?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-700 mb-2">Medium Priority ({plan.priorities.medium.length})</h4>
                      <div className="space-y-2">
                        {plan.priorities.medium.slice(0, 3).map(task => (
                          <div key={task.id} className="p-2 bg-yellow-50 rounded text-sm">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-muted-foreground">
                              {mockStaffMembers.find(s => s.id === task.assignedTo)?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Low Priority ({plan.priorities.low.length})</h4>
                      <div className="space-y-2">
                        {plan.priorities.low.slice(0, 3).map(task => (
                          <div key={task.id} className="p-2 bg-green-50 rounded text-sm">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-muted-foreground">
                              {mockStaffMembers.find(s => s.id === task.assignedTo)?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Insights and Recommendations */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">💡 Insights</h4>
                      <ul className="space-y-1 text-sm">
                        {plan.insights.map((insight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🎯 Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        {plan.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
