"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Staff, StaffFormData } from "@/lib/types/staff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  employeeId: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  hireDate: z.date({
    required_error: "Hire date is required",
  }),
  terminationDate: z.date().optional(),
  employmentStatus: z.enum(["active", "inactive", "terminated", "on_leave"]),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or greater"),
  salaryAnnual: z.number().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
  primaryLocationId: z.string().min(1, "Primary location is required"),
  additionalLocationIds: z.array(z.string()),
  roles: z.array(
    z.object({
      roleName: z.string().min(1, "Role name is required"),
      locationId: z.string().optional(),
      permissions: z.record(z.boolean()),
    })
  ),
});

export function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Manager",
    "Supervisor",
    "Staff",
    "Admin",
    "Kitchen Staff",
    "Server",
    "Host",
    "Bartender",
  ]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([
    "view_inventory",
    "edit_inventory",
    "view_sales",
    "edit_sales",
    "view_staff",
    "edit_staff",
    "view_reports",
    "manage_settings",
  ]);
  
  const supabase = createClient();
  
  // Initialize form with default values or existing staff data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: staff
      ? {
          firstName: staff.firstName,
          lastName: staff.lastName,
          employeeId: staff.employeeId,
          email: staff.email || "",
          phone: staff.phone || "",
          dateOfBirth: staff.dateOfBirth,
          hireDate: staff.hireDate,
          terminationDate: staff.terminationDate,
          employmentStatus: staff.employmentStatus,
          position: staff.position,
          department: staff.department || "",
          hourlyRate: staff.hourlyRate,
          salaryAnnual: staff.salaryAnnual || undefined,
          emergencyContactName: staff.emergencyContactName || "",
          emergencyContactPhone: staff.emergencyContactPhone || "",
          notes: staff.notes || "",
          primaryLocationId: staff.locations.find(loc => loc.isPrimaryLocation)?.locationId || "",
          additionalLocationIds: staff.locations
            .filter(loc => !loc.isPrimaryLocation)
            .map(loc => loc.locationId),
          roles: staff.roles.map(role => ({
            roleName: role.roleName,
            locationId: role.locationId || undefined,
            permissions: role.permissions,
          })),
        }
      : {
          firstName: "",
          lastName: "",
          employeeId: "",
          email: "",
          phone: "",
          dateOfBirth: undefined,
          hireDate: new Date(),
          terminationDate: undefined,
          employmentStatus: "active" as const,
          position: "",
          department: "",
          hourlyRate: 0,
          salaryAnnual: undefined,
          emergencyContactName: "",
          emergencyContactPhone: "",
          notes: "",
          primaryLocationId: "",
          additionalLocationIds: [],
          roles: [
            {
              roleName: "Staff",
              locationId: undefined,
              permissions: {
                view_inventory: false,
                edit_inventory: false,
                view_sales: false,
                edit_sales: false,
                view_staff: false,
                edit_staff: false,
                view_reports: false,
                manage_settings: false,
              },
            },
          ],
        },
  });
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
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
  
  async function handleSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting staff form:", error);
    } finally {
      setLoading(false);
    }
  }
  
  function addRole() {
    const currentRoles = form.getValues("roles");
    form.setValue("roles", [
      ...currentRoles,
      {
        roleName: "Staff",
        locationId: undefined,
        permissions: {
          view_inventory: false,
          edit_inventory: false,
          view_sales: false,
          edit_sales: false,
          view_staff: false,
          edit_staff: false,
          view_reports: false,
          manage_settings: false,
        },
      },
    ]);
  }
  
  function removeRole(index: number) {
    const currentRoles = form.getValues("roles");
    form.setValue(
      "roles",
      currentRoles.filter((_, i) => i !== index)
    );
  }
  
  function addLocation() {
    const currentLocations = form.getValues("additionalLocationIds");
    const availableLocations = locations
      .map(loc => loc.id)
      .filter(
        id =>
          id !== form.getValues("primaryLocationId") &&
          !currentLocations.includes(id)
      );
    
    if (availableLocations.length > 0) {
      form.setValue("additionalLocationIds", [
        ...currentLocations,
        availableLocations[0],
      ]);
    }
  }
  
  function removeLocation(locationId: string) {
    const currentLocations = form.getValues("additionalLocationIds");
    form.setValue(
      "additionalLocationIds",
      currentLocations.filter(id => id !== locationId)
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Emergency contact phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Employee ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to auto-generate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position*</FormLabel>
                        <FormControl>
                          <Input placeholder="Job title/position" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kitchen">Kitchen</SelectItem>
                            <SelectItem value="Front of House">Front of House</SelectItem>
                            <SelectItem value="Management">Management</SelectItem>
                            <SelectItem value="Administration">Administration</SelectItem>
                            <SelectItem value="Delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Hire Date*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="terminationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Termination Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salaryAnnual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Salary ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Annual salary (if applicable)"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseFloat(value) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this staff member"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Location*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Main work location for this staff member
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>Additional Locations</Label>
                  <div className="space-y-2">
                    {form.watch("additionalLocationIds").map((locationId) => {
                      const location = locations.find((loc) => loc.id === locationId);
                      return (
                        <div
                          key={locationId}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <span>{location?.name || locationId}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocation(locationId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLocation}
                    disabled={
                      form.watch("additionalLocationIds").length >=
                      locations.filter(
                        (loc) => loc.id !== form.watch("primaryLocationId")
                      ).length
                    }
                  >
                    Add Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("roles").map((_, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Role {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRole(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`roles.${index}.roleName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Name*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`roles.${index}.locationId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Specific</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="All locations" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All locations</SelectItem>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave blank for all locations
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Permissions</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availablePermissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`permission-${index}-${permission}`}
                              checked={
                                form.watch(`roles.${index}.permissions.${permission}`) || false
                              }
                              onChange={(e) => {
                                const currentPermissions = {
                                  ...form.getValues(`roles.${index}.permissions`),
                                };
                                currentPermissions[permission] = e.target.checked;
                                form.setValue(
                                  `roles.${index}.permissions`,
                                  currentPermissions
                                );
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label
                              htmlFor={`permission-${index}-${permission}`}
                              className="text-sm font-normal"
                            >
                              {permission.replace(/_/g, " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRole}
                >
                  Add Role
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : staff ? "Update Staff" : "Add Staff"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
