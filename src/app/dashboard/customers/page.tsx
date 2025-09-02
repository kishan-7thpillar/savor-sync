"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Users,
  Star,
  Filter,
  Download,
  Search,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomerForm } from "@/components/forms/customer-form";
import { MetricsCard } from "@/components/dashboard/metrics-card";

export default function CustomersPage() {
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [customers, setCustomers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    unsubscribedCustomers: 0,
    recentCustomers: 0,
  });
  const [segments, setSegments] = useState<any>({
    byCountry: [],
    bySource: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customers?limit=100");
      const result = await response.json();

      if (result.success) {
        setCustomers(result.data.customers);
        setMetrics(result.data.metrics);
        setSegments(result.data.segments);
      } else {
        console.error("API Error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomerSuccess = () => {
    setShowAddCustomer(false);
    fetchCustomers(); // Refresh the customer list
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Customer Management
        </h2>
        <Button onClick={() => setShowAddCustomer(!showAddCustomer)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showAddCustomer ? "Cancel" : "Add Customer"}
        </Button>
      </div>

      {showAddCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
            <CardDescription>
              Enter customer details to add them to your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm onSuccess={handleAddCustomerSuccess} />
          </CardContent>
        </Card>
      )}

      {/* Customer Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricsCard
          title="Active Customers"
          value={metrics.activeCustomers.toLocaleString()}
          change={
            metrics.activeCustomers > 0
              ? (metrics.activeCustomers / metrics.totalCustomers) * 100
              : 0
          }
          changeLabel="of total"
          icon={<Users className="h-4 w-4 text-green-600" />}
          loading={loading}
        />
        <MetricsCard
          title="New This Month"
          value={metrics.recentCustomers.toLocaleString()}
          icon={<UserPlus className="h-4 w-4 text-blue-600" />}
          loading={loading}
        />
        <MetricsCard
          title="Unsubscribed"
          value={metrics.unsubscribedCustomers.toLocaleString()}
          icon={<Mail className="h-4 w-4 text-red-600" />}
          loading={loading}
        />
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              All Customers
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download customer data</span>
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse bg-muted rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  All Customers ({filteredCustomers.length})
                </CardTitle>
                <CardDescription>
                  Manage your customer database from Square
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm
                        ? "No customers found matching your search."
                        : "No customers found."}
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {customer.email !== "No email" && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{customer.email}</span>
                                </div>
                              )}
                              {customer.phone !== "No phone" && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{customer.country}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              customer.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {customer.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Joined {customer.joinDate}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customers by Country</CardTitle>
                <CardDescription>
                  Geographic distribution of your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {segments.byCountry.map((segment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          {segment.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {segment.count} customers
                        </span>
                        <Badge variant="outline">{segment.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customers by Source</CardTitle>
                <CardDescription>
                  How customers were added to your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {segments.bySource.map((segment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">
                          {segment.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {segment.count} customers
                        </span>
                        <Badge variant="outline">{segment.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>
                Customer feedback and reviews (Square integration coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Customer feedback integration with Square is coming soon.</p>
                <p className="text-sm mt-2">
                  This will show reviews and ratings from your Square customers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
