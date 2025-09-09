// Standardized Sales Data Schema for SavorSync
// This mock data structure is designed to be reusable across all modules

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  cost: number;
  profit: number; // Fixed profit per item
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
}

export interface Order {
  id: string;
  orderNumber: string;
  locationId: string;
  locationName: string;
  channel: "dine-in" | "takeout" | "delivery" | "catering";
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountType?: "percentage" | "fixed" | "coupon";
  discountReason?: string;
  tipAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: "cash" | "card" | "digital_wallet" | "online";
  createdAt: string;
  completedAt?: string;
  preparationTime?: number; // in minutes
  staffId?: string;
  staffName?: string;
  tableNumber?: string;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  timezone: string;
  isActive: boolean;
  // Multi-location management features
  syncStatus: "online" | "offline" | "syncing" | "error";
  lastSyncTime: string;
  posSystem: {
    provider: "Square" | "Toast" | "Clover" | "Shopify POS";
    applicationId?: string;
    locationId?: string;
    isConfigured: boolean;
    lastConnected?: string;
  };
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  features: {
    deliveryEnabled: boolean;
    takeoutEnabled: boolean;
    dineInEnabled: boolean;
    cateringEnabled: boolean;
  };
}

// Staff & Labor Management Interfaces
export type StaffRole =
  | "Manager"
  | "FOH"
  | "BOH"
  | "Kitchen"
  | "Cleaning"
  | "Corporate";

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  locationId: string;
  locationName: string;
  hourlyRate: number;
  isActive: boolean;
  hireDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  permissions: {
    canApproveInventory: boolean;
    canManageSchedule: boolean;
    canAccessReports: boolean;
    canManageStaff: boolean;
    canProcessRefunds: boolean;
  };
  avatar?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  locationId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  role: StaffRole;
  status: "scheduled" | "in_progress" | "completed" | "no_show" | "cancelled";
  notes?: string;
  createdBy: string; // staffId of who created the shift
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  staffId: string;
  shiftId: string;
  locationId: string;
  clockIn: string; // ISO timestamp
  clockOut?: string; // ISO timestamp
  breakStart?: string; // ISO timestamp
  breakEnd?: string; // ISO timestamp
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  status: "clocked_in" | "on_break" | "clocked_out";
  notes?: string;
}

export interface LaborCost {
  id: string;
  locationId: string;
  staffId: string;
  date: string; // YYYY-MM-DD format
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  tips?: number; // For FOH roles
  totalCompensation: number;
}

export interface StaffPerformance {
  staffId: string;
  locationId: string;
  period: string; // YYYY-MM format
  hoursWorked: number;
  shiftsCompleted: number;
  shiftsScheduled: number;
  attendanceRate: number; // percentage
  averageHourlyRate: number;
  totalTips: number;
  totalEarnings: number;
  taskCompletionRate: number; // percentage
  qualityScore: number; // 1-10 scale
  customerRating?: number; // 1-5 scale for FOH
}

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: "item_001",
    name: "Margherita Pizza",
    category: "Pizza",
    basePrice: 16.99,
    cost: 4.5,
    profit: 12.49,
  },
  {
    id: "item_002",
    name: "Pepperoni Pizza",
    category: "Pizza",
    basePrice: 18.99,
    cost: 5.2,
    profit: 13.79,
  },
  {
    id: "item_003",
    name: "Caesar Salad",
    category: "Salads",
    basePrice: 12.99,
    cost: 3.8,
    profit: 9.19,
  },
  {
    id: "item_004",
    name: "Grilled Chicken Sandwich",
    category: "Sandwiches",
    basePrice: 14.99,
    cost: 4.2,
    profit: 10.79,
  },
  {
    id: "item_005",
    name: "Fish & Chips",
    category: "Main Course",
    basePrice: 19.99,
    cost: 6.5,
    profit: 13.49,
  },
  {
    id: "item_006",
    name: "Pasta Carbonara",
    category: "Pasta",
    basePrice: 17.99,
    cost: 4.8,
    profit: 13.19,
  },
  {
    id: "item_007",
    name: "Chicken Wings (12pc)",
    category: "Appetizers",
    basePrice: 13.99,
    cost: 4.1,
    profit: 9.89,
  },
  {
    id: "item_008",
    name: "Chocolate Lava Cake",
    category: "Desserts",
    basePrice: 8.99,
    cost: 2.2,
    profit: 6.79,
  },
  {
    id: "item_009",
    name: "Craft Beer",
    category: "Beverages",
    basePrice: 6.99,
    cost: 1.8,
    profit: 5.19,
  },
  {
    id: "item_010",
    name: "Fresh Lemonade",
    category: "Beverages",
    basePrice: 4.99,
    cost: 1.2,
    profit: 3.79,
  },
  {
    id: "item_011",
    name: "BBQ Burger",
    category: "Burgers",
    basePrice: 15.99,
    cost: 4.6,
    profit: 11.39,
  },
  {
    id: "item_012",
    name: "Veggie Wrap",
    category: "Wraps",
    basePrice: 11.99,
    cost: 3.4,
    profit: 8.59,
  },
  {
    id: "item_013",
    name: "Mushroom Risotto",
    category: "Main Course",
    basePrice: 21.99,
    cost: 6.8,
    profit: 15.19,
  },
  {
    id: "item_014",
    name: "Garlic Bread",
    category: "Sides",
    basePrice: 5.99,
    cost: 1.5,
    profit: 4.49,
  },
  {
    id: "item_015",
    name: "Tiramisu",
    category: "Desserts",
    basePrice: 9.99,
    cost: 2.8,
    profit: 7.19,
  },
];

// Mock Locations
export const mockLocations: Location[] = [
  {
    id: "loc_001",
    name: "SavorSync Downtown",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    phone: "(415) 555-0123",
    timezone: "America/Los_Angeles",
    isActive: true,
    syncStatus: "online",
    lastSyncTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    posSystem: {
      provider: "Square",
      applicationId: "sq0idp-wGVapF8sNt9PLrdj5znuKA",
      locationId: "L7HXD9RRQ2K7B",
      isConfigured: true,
      lastConnected: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    manager: {
      name: "Sarah Johnson",
      email: "sarah.johnson@savorsync.com",
      phone: "(415) 555-0124",
    },
    operatingHours: {
      monday: { open: "08:00", close: "22:00", isClosed: false },
      tuesday: { open: "08:00", close: "22:00", isClosed: false },
      wednesday: { open: "08:00", close: "22:00", isClosed: false },
      thursday: { open: "08:00", close: "22:00", isClosed: false },
      friday: { open: "08:00", close: "23:00", isClosed: false },
      saturday: { open: "09:00", close: "23:00", isClosed: false },
      sunday: { open: "09:00", close: "21:00", isClosed: false },
    },
    features: {
      deliveryEnabled: true,
      takeoutEnabled: true,
      dineInEnabled: true,
      cateringEnabled: true,
    },
  },
  {
    id: "loc_002",
    name: "SavorSync Marina",
    address: "456 Bay Avenue",
    city: "San Francisco",
    state: "CA",
    zipCode: "94123",
    phone: "(415) 555-0456",
    timezone: "America/Los_Angeles",
    isActive: true,
    syncStatus: "syncing",
    lastSyncTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    posSystem: {
      provider: "Toast",
      applicationId: "toast_app_123",
      locationId: "toast_loc_456",
      isConfigured: true,
      lastConnected: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    manager: {
      name: "Michael Chen",
      email: "michael.chen@savorsync.com",
      phone: "(415) 555-0457",
    },
    operatingHours: {
      monday: { open: "07:00", close: "21:00", isClosed: false },
      tuesday: { open: "07:00", close: "21:00", isClosed: false },
      wednesday: { open: "07:00", close: "21:00", isClosed: false },
      thursday: { open: "07:00", close: "21:00", isClosed: false },
      friday: { open: "07:00", close: "22:00", isClosed: false },
      saturday: { open: "08:00", close: "22:00", isClosed: false },
      sunday: { open: "08:00", close: "20:00", isClosed: false },
    },
    features: {
      deliveryEnabled: true,
      takeoutEnabled: true,
      dineInEnabled: true,
      cateringEnabled: false,
    },
  },
  {
    id: "loc_003",
    name: "SavorSync Mission",
    address: "789 Mission Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    phone: "(415) 555-0789",
    timezone: "America/Los_Angeles",
    isActive: true,
    syncStatus: "offline",
    lastSyncTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    posSystem: {
      provider: "Clover",
      applicationId: "clover_app_789",
      locationId: "clover_loc_012",
      isConfigured: false,
      lastConnected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    manager: {
      name: "Emily Rodriguez",
      email: "emily.rodriguez@savorsync.com",
      phone: "(415) 555-0790",
    },
    operatingHours: {
      monday: { open: "09:00", close: "20:00", isClosed: false },
      tuesday: { open: "09:00", close: "20:00", isClosed: false },
      wednesday: { open: "09:00", close: "20:00", isClosed: false },
      thursday: { open: "09:00", close: "20:00", isClosed: false },
      friday: { open: "09:00", close: "21:00", isClosed: false },
      saturday: { open: "10:00", close: "21:00", isClosed: false },
      sunday: { open: "00:00", close: "00:00", isClosed: true },
    },
    features: {
      deliveryEnabled: false,
      takeoutEnabled: true,
      dineInEnabled: true,
      cateringEnabled: true,
    },
  },
];

// Mock Staff Members (10+ staff across different roles and locations)
export const mockStaffMembers: StaffMember[] = [
  {
    id: "staff_001",
    employeeId: "EMP001",
    name: "Sarah Johnson",
    email: "sarah.johnson@savorsync.com",
    phone: "(415) 555-0124",
    role: "Manager",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    hourlyRate: 28.5,
    isActive: true,
    hireDate: "2023-01-15",
    emergencyContact: {
      name: "David Johnson",
      phone: "(415) 555-0125",
      relationship: "Spouse",
    },
    permissions: {
      canApproveInventory: true,
      canManageSchedule: true,
      canAccessReports: true,
      canManageStaff: true,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_002",
    employeeId: "EMP002",
    name: "Michael Chen",
    email: "michael.chen@savorsync.com",
    phone: "(415) 555-0457",
    role: "Manager",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    hourlyRate: 27.0,
    isActive: true,
    hireDate: "2023-02-20",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "(415) 555-0458",
      relationship: "Wife",
    },
    permissions: {
      canApproveInventory: true,
      canManageSchedule: true,
      canAccessReports: true,
      canManageStaff: true,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_003",
    employeeId: "EMP003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@savorsync.com",
    phone: "(415) 555-0790",
    role: "Manager",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    hourlyRate: 26.5,
    isActive: true,
    hireDate: "2023-03-10",
    emergencyContact: {
      name: "Carlos Rodriguez",
      phone: "(415) 555-0791",
      relationship: "Brother",
    },
    permissions: {
      canApproveInventory: true,
      canManageSchedule: true,
      canAccessReports: true,
      canManageStaff: true,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_004",
    employeeId: "EMP004",
    name: "Alex Thompson",
    email: "alex.thompson@savorsync.com",
    phone: "(415) 555-0201",
    role: "FOH",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    hourlyRate: 18.5,
    isActive: true,
    hireDate: "2023-04-05",
    emergencyContact: {
      name: "Maria Thompson",
      phone: "(415) 555-0202",
      relationship: "Mother",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_005",
    employeeId: "EMP005",
    name: "Jessica Park",
    email: "jessica.park@savorsync.com",
    phone: "(415) 555-0301",
    role: "FOH",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    hourlyRate: 19.0,
    isActive: true,
    hireDate: "2023-05-12",
    emergencyContact: {
      name: "James Park",
      phone: "(415) 555-0302",
      relationship: "Father",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_006",
    employeeId: "EMP006",
    name: "Marcus Williams",
    email: "marcus.williams@savorsync.com",
    phone: "(415) 555-0401",
    role: "Kitchen",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    hourlyRate: 22.0,
    isActive: true,
    hireDate: "2023-03-20",
    emergencyContact: {
      name: "Angela Williams",
      phone: "(415) 555-0402",
      relationship: "Sister",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: false,
    },
  },
  {
    id: "staff_007",
    employeeId: "EMP007",
    name: "Sofia Martinez",
    email: "sofia.martinez@savorsync.com",
    phone: "(415) 555-0501",
    role: "Kitchen",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    hourlyRate: 21.5,
    isActive: true,
    hireDate: "2023-06-01",
    emergencyContact: {
      name: "Roberto Martinez",
      phone: "(415) 555-0502",
      relationship: "Husband",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: false,
    },
  },
  {
    id: "staff_008",
    employeeId: "EMP008",
    name: "David Kim",
    email: "david.kim@savorsync.com",
    phone: "(415) 555-0601",
    role: "BOH",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    hourlyRate: 20.0,
    isActive: true,
    hireDate: "2023-07-15",
    emergencyContact: {
      name: "Grace Kim",
      phone: "(415) 555-0602",
      relationship: "Wife",
    },
    permissions: {
      canApproveInventory: true,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: false,
    },
  },
  {
    id: "staff_009",
    employeeId: "EMP009",
    name: "Rachel Green",
    email: "rachel.green@savorsync.com",
    phone: "(415) 555-0701",
    role: "FOH",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    hourlyRate: 18.0,
    isActive: true,
    hireDate: "2023-08-10",
    emergencyContact: {
      name: "Monica Green",
      phone: "(415) 555-0702",
      relationship: "Sister",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_010",
    employeeId: "EMP010",
    name: "James Wilson",
    email: "james.wilson@savorsync.com",
    phone: "(415) 555-0801",
    role: "Cleaning",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    hourlyRate: 16.5,
    isActive: true,
    hireDate: "2023-09-05",
    emergencyContact: {
      name: "Mary Wilson",
      phone: "(415) 555-0802",
      relationship: "Mother",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: false,
    },
  },
  {
    id: "staff_011",
    employeeId: "EMP011",
    name: "Lisa Anderson",
    email: "lisa.anderson@savorsync.com",
    phone: "(415) 555-0901",
    role: "Corporate",
    locationId: "loc_001", // Corporate staff assigned to main location
    locationName: "SavorSync Downtown",
    hourlyRate: 35.0,
    isActive: true,
    hireDate: "2022-11-01",
    emergencyContact: {
      name: "Tom Anderson",
      phone: "(415) 555-0902",
      relationship: "Husband",
    },
    permissions: {
      canApproveInventory: true,
      canManageSchedule: true,
      canAccessReports: true,
      canManageStaff: true,
      canProcessRefunds: true,
    },
  },
  {
    id: "staff_012",
    employeeId: "EMP012",
    name: "Carlos Mendez",
    email: "carlos.mendez@savorsync.com",
    phone: "(415) 555-1001",
    role: "Kitchen",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    hourlyRate: 23.0,
    isActive: true,
    hireDate: "2023-04-20",
    emergencyContact: {
      name: "Elena Mendez",
      phone: "(415) 555-1002",
      relationship: "Wife",
    },
    permissions: {
      canApproveInventory: false,
      canManageSchedule: false,
      canAccessReports: false,
      canManageStaff: false,
      canProcessRefunds: false,
    },
  },
];

// Generate mock shifts for the last 30 days
function generateMockShifts(): Shift[] {
  const shifts: Shift[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - dayOffset);
    const dateString = currentDate.toISOString().split("T")[0];

    // Generate shifts for each location
    mockLocations.forEach((location) => {
      const locationStaff = mockStaffMembers.filter(
        (staff) => staff.locationId === location.id
      );

      // Morning shift (8:00-16:00)
      const morningStaff = locationStaff.slice(
        0,
        Math.ceil(locationStaff.length / 2)
      );
      morningStaff.forEach((staff, index) => {
        if (Math.random() > 0.1) {
          // 90% chance of being scheduled
          shifts.push({
            id: `shift_${dateString}_${location.id}_${staff.id}_morning`,
            staffId: staff.id,
            locationId: location.id,
            date: dateString,
            startTime: "08:00",
            endTime: "16:00",
            role: staff.role,
            status:
              dayOffset === 0
                ? "in_progress"
                : Math.random() > 0.05
                ? "completed"
                : "no_show",
            createdBy: "staff_001", // Manager created
            createdAt: new Date(
              currentDate.getTime() - 24 * 60 * 60 * 1000
            ).toISOString(),
            updatedAt: new Date(
              currentDate.getTime() - 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      });

      // Evening shift (16:00-24:00)
      const eveningStaff = locationStaff.slice(
        Math.ceil(locationStaff.length / 2)
      );
      eveningStaff.forEach((staff, index) => {
        if (Math.random() > 0.1) {
          // 90% chance of being scheduled
          shifts.push({
            id: `shift_${dateString}_${location.id}_${staff.id}_evening`,
            staffId: staff.id,
            locationId: location.id,
            date: dateString,
            startTime: "16:00",
            endTime: "24:00",
            role: staff.role,
            status:
              dayOffset === 0
                ? "scheduled"
                : Math.random() > 0.05
                ? "completed"
                : "no_show",
            createdBy: "staff_001", // Manager created
            createdAt: new Date(
              currentDate.getTime() - 24 * 60 * 60 * 1000
            ).toISOString(),
            updatedAt: new Date(
              currentDate.getTime() - 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      });
    });
  }

  return shifts;
}

// Generate mock time logs based on shifts
function generateMockTimeLogs(shifts: Shift[]): TimeLog[] {
  const timeLogs: TimeLog[] = [];

  shifts.forEach((shift) => {
    if (shift.status === "completed" || shift.status === "in_progress") {
      const shiftDate = new Date(shift.date);
      const [startHour, startMinute] = shift.startTime.split(":").map(Number);
      const [endHour, endMinute] = shift.endTime.split(":").map(Number);

      const clockInTime = new Date(shiftDate);
      clockInTime.setHours(startHour, startMinute, 0, 0);
      // Add some randomness to clock-in time (-5 to +15 minutes)
      clockInTime.setMinutes(
        clockInTime.getMinutes() + Math.floor(Math.random() * 20) - 5
      );

      let clockOutTime: Date | undefined;
      if (shift.status === "completed") {
        clockOutTime = new Date(shiftDate);
        clockOutTime.setHours(endHour, endMinute, 0, 0);
        // Add some randomness to clock-out time (-10 to +30 minutes)
        clockOutTime.setMinutes(
          clockOutTime.getMinutes() + Math.floor(Math.random() * 40) - 10
        );
      }

      const totalHours = clockOutTime
        ? (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
        : undefined;

      const regularHours = totalHours && totalHours <= 8 ? totalHours : 8;
      const overtimeHours = totalHours && totalHours > 8 ? totalHours - 8 : 0;

      timeLogs.push({
        id: `timelog_${shift.id}`,
        staffId: shift.staffId,
        shiftId: shift.id,
        locationId: shift.locationId,
        clockIn: clockInTime.toISOString(),
        clockOut: clockOutTime?.toISOString(),
        totalHours: totalHours ? Math.round(totalHours * 100) / 100 : undefined,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        status: shift.status === "in_progress" ? "clocked_in" : "clocked_out",
      });
    }
  });

  return timeLogs;
}

// Generate mock labor costs based on time logs
function generateMockLaborCosts(timeLogs: TimeLog[]): LaborCost[] {
  const laborCosts: LaborCost[] = [];

  timeLogs.forEach((timeLog) => {
    if (timeLog.totalHours && timeLog.clockOut) {
      const staff = mockStaffMembers.find((s) => s.id === timeLog.staffId);
      if (staff) {
        const regularPay = timeLog.regularHours! * staff.hourlyRate;
        const overtimePay = timeLog.overtimeHours! * staff.hourlyRate * 1.5;
        const totalPay = regularPay + overtimePay;

        // Generate tips for FOH roles
        const tips =
          staff.role === "FOH" ? Math.floor(Math.random() * 150) + 20 : 0;

        laborCosts.push({
          id: `laborcost_${timeLog.id}`,
          locationId: timeLog.locationId,
          staffId: timeLog.staffId,
          date: timeLog.clockIn.split("T")[0],
          regularHours: timeLog.regularHours!,
          overtimeHours: timeLog.overtimeHours!,
          regularPay: Math.round(regularPay * 100) / 100,
          overtimePay: Math.round(overtimePay * 100) / 100,
          totalPay: Math.round(totalPay * 100) / 100,
          tips: tips,
          totalCompensation: Math.round((totalPay + tips) * 100) / 100,
        });
      }
    }
  });

  return laborCosts;
}

// Generate mock staff performance data
function generateMockStaffPerformance(
  shifts: Shift[],
  timeLogs: TimeLog[],
  laborCosts: LaborCost[]
): StaffPerformance[] {
  const performance: StaffPerformance[] = [];
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format

  mockStaffMembers.forEach((staff) => {
    const staffShifts = shifts.filter((s) => s.staffId === staff.id);
    const staffTimeLogs = timeLogs.filter((t) => t.staffId === staff.id);
    const staffLaborCosts = laborCosts.filter((l) => l.staffId === staff.id);

    const scheduledShifts = staffShifts.length;
    const completedShifts = staffShifts.filter(
      (s) => s.status === "completed"
    ).length;
    const hoursWorked = staffTimeLogs.reduce(
      (sum, log) => sum + (log.totalHours || 0),
      0
    );
    const totalTips = staffLaborCosts.reduce(
      (sum, cost) => sum + (cost.tips || 0),
      0
    );
    const totalEarnings = staffLaborCosts.reduce(
      (sum, cost) => sum + cost.totalCompensation,
      0
    );

    performance.push({
      staffId: staff.id,
      locationId: staff.locationId,
      period: currentMonth,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      shiftsCompleted: completedShifts,
      shiftsScheduled: scheduledShifts,
      attendanceRate:
        scheduledShifts > 0
          ? Math.round((completedShifts / scheduledShifts) * 100)
          : 100,
      averageHourlyRate: staff.hourlyRate,
      totalTips: totalTips,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      taskCompletionRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      qualityScore: Math.floor(Math.random() * 3) + 8, // 8-10 scale
      customerRating:
        staff.role === "FOH"
          ? Math.floor(Math.random() * 10) / 2 + 4
          : undefined, // 4.0-4.9 for FOH
    });
  });

  return performance;
}

// Generate all mock data
export const mockShifts = generateMockShifts();
export const mockTimeLogs = generateMockTimeLogs(mockShifts);
export const mockLaborCosts = generateMockLaborCosts(mockTimeLogs);
export const mockStaffPerformance = generateMockStaffPerformance(
  mockShifts,
  mockTimeLogs,
  mockLaborCosts
);

// Helper functions for staff and labor analytics
export const getStaffByLocation = (locationId: string): StaffMember[] => {
  if (locationId === "all") return mockStaffMembers;
  return mockStaffMembers.filter((staff) => staff.locationId === locationId);
};

export const getStaffByRole = (role: StaffRole): StaffMember[] => {
  return mockStaffMembers.filter((staff) => staff.role === role);
};

export const getShiftsByDateRange = (
  startDate: Date,
  endDate: Date,
  locationId?: string
): Shift[] => {
  return mockShifts.filter((shift) => {
    const shiftDate = new Date(shift.date);
    const matchesDate = shiftDate >= startDate && shiftDate <= endDate;
    const matchesLocation =
      !locationId || locationId === "all" || shift.locationId === locationId;
    return matchesDate && matchesLocation;
  });
};

export const getLaborCostsByDateRange = (
  startDate: Date,
  endDate: Date,
  locationId?: string
): LaborCost[] => {
  return mockLaborCosts.filter((cost) => {
    const costDate = new Date(cost.date);
    const matchesDate = costDate >= startDate && costDate <= endDate;
    const matchesLocation =
      !locationId || locationId === "all" || cost.locationId === locationId;
    return matchesDate && matchesLocation;
  });
};

export const getTopPerformers = (
  locationId?: string,
  limit: number = 5
): (StaffMember & { performance: StaffPerformance })[] => {
  const staffToConsider =
    locationId && locationId !== "all"
      ? mockStaffMembers.filter((staff) => staff.locationId === locationId)
      : mockStaffMembers;

  return staffToConsider
    .map((staff) => ({
      ...staff,
      performance: mockStaffPerformance.find((p) => p.staffId === staff.id)!,
    }))
    .filter((item) => item.performance)
    .sort((a, b) => b.performance.hoursWorked - a.performance.hoursWorked)
    .slice(0, limit);
};

export const calculateLaborMetrics = (locationId?: string) => {
  const laborCosts =
    locationId && locationId !== "all"
      ? mockLaborCosts.filter((cost) => cost.locationId === locationId)
      : mockLaborCosts;

  const totalLaborCost = laborCosts.reduce(
    (sum, cost) => sum + cost.totalCompensation,
    0
  );
  const totalRegularHours = laborCosts.reduce(
    (sum, cost) => sum + cost.regularHours,
    0
  );
  const totalOvertimeHours = laborCosts.reduce(
    (sum, cost) => sum + cost.overtimeHours,
    0
  );
  const totalTips = laborCosts.reduce((sum, cost) => sum + (cost.tips || 0), 0);

  // Get sales data for comparison
  const salesOrders =
    locationId && locationId !== "all"
      ? mockSalesOrders.filter((order) => order.locationId === locationId)
      : mockSalesOrders;

  const totalRevenue = salesOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const laborCostPercentage =
    totalRevenue > 0 ? (totalLaborCost / totalRevenue) * 100 : 0;

  return {
    totalLaborCost: Math.round(totalLaborCost * 100) / 100,
    totalRegularHours: Math.round(totalRegularHours * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    totalTips: Math.round(totalTips * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    laborCostPercentage: Math.round(laborCostPercentage * 100) / 100,
    averageHourlyRate:
      totalRegularHours > 0
        ? Math.round(
            ((totalLaborCost - totalTips) /
              (totalRegularHours + totalOvertimeHours * 1.5)) *
              100
          ) / 100
        : 0,
  };
};

// Helper function to generate random orders
function generateRandomOrder(
  orderId: string,
  orderNumber: string,
  baseDate: Date,
  locationId: string,
  locationName: string
): Order {
  const channels: Order["channel"][] = [
    "dine-in",
    "takeout",
    "delivery",
    "catering",
  ];
  const paymentMethods: Order["paymentMethod"][] = [
    "cash",
    "card",
    "digital_wallet",
    "online",
  ];

  const channel = channels[Math.floor(Math.random() * channels.length)];
  const paymentMethod =
    paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  // Generate random items (1-5 items per order)
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const orderItems: OrderItem[] = [];

  for (let i = 0; i < itemCount; i++) {
    const menuItem =
      mockMenuItems[Math.floor(Math.random() * mockMenuItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = menuItem.basePrice + (Math.random() * 2 - 1); // Small price variation
    const subtotal = quantity * unitPrice;

    orderItems.push({
      id: `${orderId}_item_${i}`,
      menuItemId: menuItem.id,
      menuItem,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = 0.0875; // 8.75% tax
  const taxAmount = subtotal * taxRate;

  // Random discount (20% chance)
  const hasDiscount = Math.random() < 0.2;
  const discountAmount = hasDiscount
    ? subtotal * (Math.random() * 0.15 + 0.05)
    : 0; // 5-20% discount

  const tipAmount =
    channel === "dine-in" ? subtotal * (Math.random() * 0.15 + 0.1) : 0; // 10-25% tip for dine-in
  const deliveryFee = channel === "delivery" ? 3.99 + Math.random() * 2 : 0; // $3.99-$5.99 delivery fee

  const totalAmount =
    subtotal + taxAmount - discountAmount + tipAmount + deliveryFee;

  // Random time within the day
  const orderTime = new Date(baseDate);
  const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
  const minute = Math.floor(Math.random() * 60);
  orderTime.setHours(hour, minute, 0, 0);

  const completedTime = new Date(orderTime);
  completedTime.setMinutes(
    completedTime.getMinutes() + Math.floor(Math.random() * 45) + 15
  ); // 15-60 min prep time

  return {
    id: orderId,
    orderNumber,
    locationId,
    locationName,
    channel,
    status: "completed",
    customerId: `customer_${Math.floor(Math.random() * 1000)}`,
    customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountType: hasDiscount
      ? Math.random() > 0.5
        ? "percentage"
        : "fixed"
      : undefined,
    discountReason: hasDiscount ? "Happy Hour Special" : undefined,
    tipAmount: Math.round(tipAmount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    paymentMethod,
    createdAt: orderTime.toISOString(),
    completedAt: completedTime.toISOString(),
    preparationTime: Math.floor(
      (completedTime.getTime() - orderTime.getTime()) / 60000
    ),
    staffId: `staff_${Math.floor(Math.random() * 20) + 1}`,
    staffName: `Staff Member ${Math.floor(Math.random() * 20) + 1}`,
    tableNumber:
      channel === "dine-in"
        ? `T${Math.floor(Math.random() * 20) + 1}`
        : undefined,
  };
}

// Generate comprehensive mock sales data for the last 90 days
export function generateMockSalesData(): Order[] {
  const orders: Order[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - dayOffset);

    // Skip if it's more than 90 days ago
    if (dayOffset >= 90) continue;

    // Generate different order volumes based on day of week
    const dayOfWeek = currentDate.getDay();
    let baseOrderCount = 25; // Base orders per day

    // Weekend boost
    if (dayOfWeek === 5 || dayOfWeek === 6) baseOrderCount = 45; // Friday/Saturday
    if (dayOfWeek === 0) baseOrderCount = 35; // Sunday

    // Random variation ±30%
    const orderCount = Math.floor(baseOrderCount * (0.7 + Math.random() * 0.6));

    for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
      const location =
        mockLocations[Math.floor(Math.random() * mockLocations.length)];
      const orderId = `order_${currentDate.getFullYear()}${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}_${orderIndex.toString().padStart(3, "0")}`;
      const orderNumber = `#${1000 + orders.length}`;

      orders.push(
        generateRandomOrder(
          orderId,
          orderNumber,
          currentDate,
          location.id,
          location.name
        )
      );
    }
  }

  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Export the generated mock data
export const mockSalesOrders = generateMockSalesData();

// Export helper functions for data access
export const getMockDataByDateRange = (
  startDate: Date,
  endDate: Date
): Order[] => {
  return mockSalesOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
};

export const getMockDataByLocation = (locationId: string): Order[] => {
  return mockSalesOrders.filter((order) => order.locationId === locationId);
};

export const getMockDataByChannel = (channel: Order["channel"]): Order[] => {
  return mockSalesOrders.filter((order) => order.channel === channel);
};
