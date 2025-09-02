import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffShifts } from "@/components/operations/staff-shifts";
import { CustomerComplaints } from "@/components/operations/customer-complaints";
import { OrderInaccuracies } from "@/components/operations/order-inaccuracies";
import { OperationalMetrics } from "@/components/operations/operational-metrics";

export const metadata: Metadata = {
  title: "Operations Management | SavorSync",
  description: "Manage restaurant operations, staff shifts, and customer service",
};

export default function OperationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Operations Management</h2>
      </div>
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="staff">Staff Shifts</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="inaccuracies">Order Issues</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics" className="space-y-4">
          <OperationalMetrics />
        </TabsContent>
        <TabsContent value="staff" className="space-y-4">
          <StaffShifts />
        </TabsContent>
        <TabsContent value="complaints" className="space-y-4">
          <CustomerComplaints />
        </TabsContent>
        <TabsContent value="inaccuracies" className="space-y-4">
          <OrderInaccuracies />
        </TabsContent>
      </Tabs>
    </div>
  );
}
