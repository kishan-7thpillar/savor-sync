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

// Task Management Interfaces
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled";
export type TaskCategory =
  | "cleaning"
  | "inventory"
  | "customer_service"
  | "maintenance"
  | "training"
  | "compliance"
  | "sales"
  | "operations";
export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedDuration: number; // in minutes
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  roleAssignment: StaffRole[];
  kpiImpact: {
    salesImpact: number; // -100 to 100 percentage impact
    customerSatisfaction: number; // -100 to 100 percentage impact
    operationalEfficiency: number; // -100 to 100 percentage impact
    costReduction: number; // -100 to 100 percentage impact
  };
  qualityChecklist: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  templateId?: string; // Reference to TaskTemplate if generated from template
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string; // staffId
  assignedBy: string; // staffId of who assigned the task
  locationId: string;
  locationName: string;
  dueDate: string; // ISO timestamp
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  qualityScore?: number; // 1-10 scale
  qualityNotes?: string;
  evidence?: {
    photos: string[]; // URLs or base64 strings
    notes: string;
    checkedBy?: string; // staffId of who verified
    checkedAt?: string; // ISO timestamp
  };
  financialImpact?: {
    estimatedCostSavings: number;
    actualCostSavings?: number;
    revenueImpact?: number;
  };
  comments: TaskComment[];
  recurrence?: {
    type: TaskRecurrence;
    nextDueDate?: string;
    completedCount: number;
  };
  escalation?: {
    isEscalated: boolean;
    escalatedAt?: string;
    escalatedBy?: string;
    escalationReason?: string;
    escalatedTo?: string; // staffId
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string; // staffId
  authorName: string;
  content: string;
  createdAt: string;
}

export interface TaskPerformanceMetrics {
  staffId: string;
  locationId: string;
  period: string; // YYYY-MM format
  tasksAssigned: number;
  tasksCompleted: number;
  tasksOverdue: number;
  averageCompletionTime: number; // in minutes
  averageQualityScore: number; // 1-10 scale
  onTimeCompletionRate: number; // percentage
  taskCategories: {
    [key in TaskCategory]: {
      assigned: number;
      completed: number;
      averageQuality: number;
    };
  };
  kpiContribution: {
    salesImpact: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
    costReduction: number;
  };
  tier: "bronze" | "silver" | "gold" | "platinum";
  improvementAreas: string[];
}

export interface DailyActionPlan {
  id: string;
  locationId: string;
  date: string; // YYYY-MM-DD format
  generatedAt: string; // ISO timestamp
  generatedBy: "ai" | "manager";
  priorities: {
    high: Task[];
    medium: Task[];
    low: Task[];
  };
  staffAllocations: {
    [staffId: string]: {
      staffName: string;
      role: StaffRole;
      assignedTasks: string[]; // task IDs
      estimatedWorkload: number; // in minutes
      capacityUtilization: number; // percentage
    };
  };
  kpiTargets: {
    salesTarget: number;
    customerSatisfactionTarget: number;
    operationalEfficiencyTarget: number;
    costReductionTarget: number;
  };
  insights: string[];
  recommendations: string[];
}

// Inventory Management Interfaces
export type IngredientCategory =
  | "produce"
  | "meat"
  | "dairy"
  | "dry_goods"
  | "beverages"
  | "condiments"
  | "spices";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type StockChangeReason =
  | "sale"
  | "spoilage"
  | "theft"
  | "over_prep"
  | "supplier_error"
  | "manual_adjustment"
  | "delivery"
  | "return";
export type UnitOfMeasure =
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "pieces"
  | "cups"
  | "tbsp"
  | "tsp";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  paymentTerms: string;
  isActive: boolean;
  categories: IngredientCategory[];
  rating: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number; // cost per unit
  supplierId: string;
  supplierName: string;
  reorderLevel: number; // minimum stock level
  maxStockLevel: number;
  shelfLifeDays: number;
  storageRequirements: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  cost: number; // calculated cost for this quantity
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  recipe: RecipeIngredient[];
  sellingPrice: number;
  totalIngredientCost: number;
  grossMargin: number; // percentage
  foodCostPercentage: number;
  preparationTime: number; // in minutes
  posProductId?: string; // POS system product ID
  isActive: boolean;
  availableAtLocations: string[]; // location IDs
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  ingredientId: string;
  ingredientName: string;
  locationId: string;
  locationName: string;
  currentStock: number;
  unitOfMeasure: UnitOfMeasure;
  stockStatus: StockStatus;
  lastUpdated: string;
  lastStockTake: string;
  expirationDate?: string;
  batchNumber?: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  locationId: string;
  locationName: string;
  movementType: "in" | "out";
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  reason: StockChangeReason;
  orderId?: string; // if related to a sale
  staffId: string;
  staffName: string;
  notes?: string;
  timestamp: string;
  previousStock: number;
  newStock: number;
}

export interface WastageReport {
  id: string;
  locationId: string;
  locationName: string;
  ingredientId: string;
  ingredientName: string;
  period: string; // YYYY-MM format
  expectedUsage: number; // based on sales and recipes
  actualUsage: number; // based on stock movements
  variance: number; // difference between expected and actual
  variancePercentage: number;
  estimatedWastageCost: number;
  primaryReasons: StockChangeReason[];
  generatedAt: string;
}

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "expiring_soon" | "overstock";
  ingredientId: string;
  ingredientName: string;
  locationId: string;
  locationName: string;
  currentStock: number;
  threshold: number;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
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

// Inventory Management Mock Data

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: "supplier_001",
    name: "Fresh Farm Produce Co.",
    contactPerson: "John Martinez",
    email: "john@freshfarm.com",
    phone: "(555) 123-4567",
    address: "123 Farm Road, Fresno, CA 93701",
    leadTimeDays: 2,
    paymentTerms: "Net 30",
    isActive: true,
    categories: ["produce"],
    rating: 4.8,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "supplier_002",
    name: "Premium Meats & Poultry",
    contactPerson: "Sarah Wilson",
    email: "sarah@premiummeats.com",
    phone: "(555) 234-5678",
    address: "456 Butcher Lane, Sacramento, CA 95814",
    leadTimeDays: 1,
    paymentTerms: "Net 15",
    isActive: true,
    categories: ["meat"],
    rating: 4.9,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  },
  {
    id: "supplier_003",
    name: "Golden State Dairy",
    contactPerson: "Mike Thompson",
    email: "mike@goldenstatedairy.com",
    phone: "(555) 345-6789",
    address: "789 Dairy Drive, Modesto, CA 95350",
    leadTimeDays: 1,
    paymentTerms: "Net 21",
    isActive: true,
    categories: ["dairy"],
    rating: 4.6,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-18T09:15:00Z",
  },
  {
    id: "supplier_004",
    name: "Bay Area Beverages",
    contactPerson: "Lisa Chen",
    email: "lisa@bayareabev.com",
    phone: "(555) 456-7890",
    address: "321 Beverage Blvd, Oakland, CA 94607",
    leadTimeDays: 3,
    paymentTerms: "Net 30",
    isActive: true,
    categories: ["beverages"],
    rating: 4.4,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-25T16:20:00Z",
  },
  {
    id: "supplier_005",
    name: "Pacific Dry Goods",
    contactPerson: "Robert Kim",
    email: "robert@pacificdry.com",
    phone: "(555) 567-8901",
    address: "654 Storage Street, San Jose, CA 95110",
    leadTimeDays: 5,
    paymentTerms: "Net 45",
    isActive: true,
    categories: ["dry_goods", "condiments", "spices"],
    rating: 4.7,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-22T11:30:00Z",
  },
];

// Mock Ingredients
export const mockIngredients: Ingredient[] = [
  {
    id: "ingredient_001",
    name: "Ground Beef (80/20)",
    category: "meat",
    unitOfMeasure: "kg",
    unitCost: 8.5,
    supplierId: "supplier_002",
    supplierName: "Premium Meats & Poultry",
    reorderLevel: 10,
    maxStockLevel: 50,
    shelfLifeDays: 3,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "ingredient_002",
    name: "Hamburger Buns",
    category: "dry_goods",
    unitOfMeasure: "pieces",
    unitCost: 0.45,
    supplierId: "supplier_005",
    supplierName: "Pacific Dry Goods",
    reorderLevel: 50,
    maxStockLevel: 200,
    shelfLifeDays: 5,
    storageRequirements: "Room temperature, dry place",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-12T14:20:00Z",
  },
  {
    id: "ingredient_003",
    name: "Cheddar Cheese Slices",
    category: "dairy",
    unitOfMeasure: "pieces",
    unitCost: 0.35,
    supplierId: "supplier_003",
    supplierName: "Golden State Dairy",
    reorderLevel: 100,
    maxStockLevel: 500,
    shelfLifeDays: 14,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-18T09:45:00Z",
  },
  {
    id: "ingredient_004",
    name: "Lettuce (Iceberg)",
    category: "produce",
    unitOfMeasure: "kg",
    unitCost: 2.8,
    supplierId: "supplier_001",
    supplierName: "Fresh Farm Produce Co.",
    reorderLevel: 5,
    maxStockLevel: 25,
    shelfLifeDays: 7,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T16:15:00Z",
  },
  {
    id: "ingredient_005",
    name: "Tomatoes (Fresh)",
    category: "produce",
    unitOfMeasure: "kg",
    unitCost: 3.2,
    supplierId: "supplier_001",
    supplierName: "Fresh Farm Produce Co.",
    reorderLevel: 8,
    maxStockLevel: 30,
    shelfLifeDays: 5,
    storageRequirements: "Room temperature until ripe, then refrigerated",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-22T11:30:00Z",
  },
  {
    id: "ingredient_006",
    name: "Pizza Dough",
    category: "dry_goods",
    unitOfMeasure: "kg",
    unitCost: 1.8,
    supplierId: "supplier_005",
    supplierName: "Pacific Dry Goods",
    reorderLevel: 15,
    maxStockLevel: 60,
    shelfLifeDays: 3,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-25T13:45:00Z",
  },
  {
    id: "ingredient_007",
    name: "Mozzarella Cheese",
    category: "dairy",
    unitOfMeasure: "kg",
    unitCost: 6.5,
    supplierId: "supplier_003",
    supplierName: "Golden State Dairy",
    reorderLevel: 10,
    maxStockLevel: 40,
    shelfLifeDays: 21,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-28T10:20:00Z",
  },
  {
    id: "ingredient_008",
    name: "Tomato Sauce",
    category: "condiments",
    unitOfMeasure: "l",
    unitCost: 2.4,
    supplierId: "supplier_005",
    supplierName: "Pacific Dry Goods",
    reorderLevel: 20,
    maxStockLevel: 80,
    shelfLifeDays: 365,
    storageRequirements: "Room temperature, sealed containers",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T15:30:00Z",
  },
  {
    id: "ingredient_009",
    name: "Chicken Breast",
    category: "meat",
    unitOfMeasure: "kg",
    unitCost: 12.0,
    supplierId: "supplier_002",
    supplierName: "Premium Meats & Poultry",
    reorderLevel: 8,
    maxStockLevel: 35,
    shelfLifeDays: 4,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T12:15:00Z",
  },
  {
    id: "ingredient_010",
    name: "Pasta (Penne)",
    category: "dry_goods",
    unitOfMeasure: "kg",
    unitCost: 1.2,
    supplierId: "supplier_005",
    supplierName: "Pacific Dry Goods",
    reorderLevel: 25,
    maxStockLevel: 100,
    shelfLifeDays: 730,
    storageRequirements: "Room temperature, dry place",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-18T14:45:00Z",
  },
  {
    id: "ingredient_011",
    name: "Olive Oil (Extra Virgin)",
    category: "condiments",
    unitOfMeasure: "l",
    unitCost: 8.5,
    supplierId: "supplier_005",
    supplierName: "Pacific Dry Goods",
    reorderLevel: 5,
    maxStockLevel: 20,
    shelfLifeDays: 540,
    storageRequirements: "Room temperature, dark place",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-22T09:30:00Z",
  },
  {
    id: "ingredient_012",
    name: "Onions (Yellow)",
    category: "produce",
    unitOfMeasure: "kg",
    unitCost: 1.5,
    supplierId: "supplier_001",
    supplierName: "Fresh Farm Produce Co.",
    reorderLevel: 15,
    maxStockLevel: 50,
    shelfLifeDays: 30,
    storageRequirements: "Room temperature, dry and ventilated",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
  },
  {
    id: "ingredient_013",
    name: "Bell Peppers (Mixed)",
    category: "produce",
    unitOfMeasure: "kg",
    unitCost: 4.2,
    supplierId: "supplier_001",
    supplierName: "Fresh Farm Produce Co.",
    reorderLevel: 6,
    maxStockLevel: 25,
    shelfLifeDays: 10,
    storageRequirements: "Refrigerated at 2-4°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-28T16:45:00Z",
  },
  {
    id: "ingredient_014",
    name: "Coca-Cola (500ml)",
    category: "beverages",
    unitOfMeasure: "pieces",
    unitCost: 0.85,
    supplierId: "supplier_004",
    supplierName: "Bay Area Beverages",
    reorderLevel: 100,
    maxStockLevel: 500,
    shelfLifeDays: 365,
    storageRequirements: "Room temperature or refrigerated",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T13:30:00Z",
  },
  {
    id: "ingredient_015",
    name: "French Fries (Frozen)",
    category: "produce",
    unitOfMeasure: "kg",
    unitCost: 2.2,
    supplierId: "supplier_001",
    supplierName: "Fresh Farm Produce Co.",
    reorderLevel: 20,
    maxStockLevel: 80,
    shelfLifeDays: 365,
    storageRequirements: "Frozen at -18°C",
    isActive: true,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-24T10:15:00Z",
  },
];

// Mock Products with Recipes
export const mockProducts: Product[] = [
  {
    id: "product_001",
    name: "Classic Cheeseburger",
    category: "Burgers",
    description:
      "Juicy beef patty with cheddar cheese, lettuce, tomato on a fresh bun",
    recipe: [
      {
        ingredientId: "ingredient_001",
        ingredientName: "Ground Beef (80/20)",
        quantity: 0.15,
        unitOfMeasure: "kg",
        cost: 1.28,
      },
      {
        ingredientId: "ingredient_002",
        ingredientName: "Hamburger Buns",
        quantity: 1,
        unitOfMeasure: "pieces",
        cost: 0.45,
      },
      {
        ingredientId: "ingredient_003",
        ingredientName: "Cheddar Cheese Slices",
        quantity: 1,
        unitOfMeasure: "pieces",
        cost: 0.35,
      },
      {
        ingredientId: "ingredient_004",
        ingredientName: "Lettuce (Iceberg)",
        quantity: 0.03,
        unitOfMeasure: "kg",
        cost: 0.08,
      },
      {
        ingredientId: "ingredient_005",
        ingredientName: "Tomatoes (Fresh)",
        quantity: 0.05,
        unitOfMeasure: "kg",
        cost: 0.16,
      },
    ],
    sellingPrice: 12.99,
    totalIngredientCost: 2.32,
    grossMargin: 82.14,
    foodCostPercentage: 17.86,
    preparationTime: 8,
    posProductId: "item_001",
    isActive: true,
    availableAtLocations: ["loc_001", "loc_002", "loc_003"],
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "product_002",
    name: "Margherita Pizza",
    category: "Pizza",
    description:
      "Fresh mozzarella, tomato sauce, and basil on our signature dough",
    recipe: [
      {
        ingredientId: "ingredient_006",
        ingredientName: "Pizza Dough",
        quantity: 0.25,
        unitOfMeasure: "kg",
        cost: 0.45,
      },
      {
        ingredientId: "ingredient_007",
        ingredientName: "Mozzarella Cheese",
        quantity: 0.12,
        unitOfMeasure: "kg",
        cost: 0.78,
      },
      {
        ingredientId: "ingredient_008",
        ingredientName: "Tomato Sauce",
        quantity: 0.08,
        unitOfMeasure: "l",
        cost: 0.19,
      },
      {
        ingredientId: "ingredient_011",
        ingredientName: "Olive Oil (Extra Virgin)",
        quantity: 0.01,
        unitOfMeasure: "l",
        cost: 0.09,
      },
    ],
    sellingPrice: 16.99,
    totalIngredientCost: 1.51,
    grossMargin: 91.11,
    foodCostPercentage: 8.89,
    preparationTime: 15,
    posProductId: "item_002",
    isActive: true,
    availableAtLocations: ["loc_001", "loc_002", "loc_003"],
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "product_003",
    name: "Grilled Chicken Pasta",
    category: "Pasta",
    description: "Grilled chicken breast over penne pasta with vegetables",
    recipe: [
      {
        ingredientId: "ingredient_009",
        ingredientName: "Chicken Breast",
        quantity: 0.18,
        unitOfMeasure: "kg",
        cost: 2.16,
      },
      {
        ingredientId: "ingredient_010",
        ingredientName: "Pasta (Penne)",
        quantity: 0.12,
        unitOfMeasure: "kg",
        cost: 0.14,
      },
      {
        ingredientId: "ingredient_013",
        ingredientName: "Bell Peppers (Mixed)",
        quantity: 0.08,
        unitOfMeasure: "kg",
        cost: 0.34,
      },
      {
        ingredientId: "ingredient_012",
        ingredientName: "Onions (Yellow)",
        quantity: 0.05,
        unitOfMeasure: "kg",
        cost: 0.08,
      },
      {
        ingredientId: "ingredient_011",
        ingredientName: "Olive Oil (Extra Virgin)",
        quantity: 0.02,
        unitOfMeasure: "l",
        cost: 0.17,
      },
    ],
    sellingPrice: 18.99,
    totalIngredientCost: 2.89,
    grossMargin: 84.78,
    foodCostPercentage: 15.22,
    preparationTime: 12,
    posProductId: "item_003",
    isActive: true,
    availableAtLocations: ["loc_001", "loc_002", "loc_003"],
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T09:45:00Z",
  },
  {
    id: "product_004",
    name: "French Fries",
    category: "Sides",
    description: "Crispy golden french fries",
    recipe: [
      {
        ingredientId: "ingredient_015",
        ingredientName: "French Fries (Frozen)",
        quantity: 0.15,
        unitOfMeasure: "kg",
        cost: 0.33,
      },
    ],
    sellingPrice: 4.99,
    totalIngredientCost: 0.33,
    grossMargin: 93.39,
    foodCostPercentage: 6.61,
    preparationTime: 5,
    posProductId: "item_004",
    isActive: true,
    availableAtLocations: ["loc_001", "loc_002", "loc_003"],
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-22T11:15:00Z",
  },
  {
    id: "product_005",
    name: "Coca-Cola",
    category: "Beverages",
    description: "Refreshing Coca-Cola 500ml",
    recipe: [
      {
        ingredientId: "ingredient_014",
        ingredientName: "Coca-Cola (500ml)",
        quantity: 1,
        unitOfMeasure: "pieces",
        cost: 0.85,
      },
    ],
    sellingPrice: 2.99,
    totalIngredientCost: 0.85,
    grossMargin: 71.57,
    foodCostPercentage: 28.43,
    preparationTime: 1,
    posProductId: "item_005",
    isActive: true,
    availableAtLocations: ["loc_001", "loc_002", "loc_003"],
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-25T16:30:00Z",
  },
];

// Mock Stock Levels
export const mockStockLevels: StockLevel[] = [
  // Location 1 - Downtown
  {
    id: "stock_001",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 25.5,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T14:30:00Z",
    lastStockTake: "2024-01-28T08:00:00Z",
    expirationDate: "2024-01-31T23:59:59Z",
    batchNumber: "BEEF240128",
  },
  {
    id: "stock_002",
    ingredientId: "ingredient_002",
    ingredientName: "Hamburger Buns",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 45,
    unitOfMeasure: "pieces",
    stockStatus: "low_stock",
    lastUpdated: "2024-01-28T16:15:00Z",
    lastStockTake: "2024-01-28T08:00:00Z",
    expirationDate: "2024-02-02T23:59:59Z",
    batchNumber: "BUNS240127",
  },
  {
    id: "stock_003",
    ingredientId: "ingredient_003",
    ingredientName: "Cheddar Cheese Slices",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 180,
    unitOfMeasure: "pieces",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T12:45:00Z",
    lastStockTake: "2024-01-28T08:00:00Z",
    expirationDate: "2024-02-11T23:59:59Z",
    batchNumber: "CHED240125",
  },
  {
    id: "stock_004",
    ingredientId: "ingredient_004",
    ingredientName: "Lettuce (Iceberg)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 8.2,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T11:20:00Z",
    lastStockTake: "2024-01-28T08:00:00Z",
    expirationDate: "2024-02-04T23:59:59Z",
    batchNumber: "LETT240126",
  },
  {
    id: "stock_005",
    ingredientId: "ingredient_005",
    ingredientName: "Tomatoes (Fresh)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 12.8,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T13:30:00Z",
    lastStockTake: "2024-01-28T08:00:00Z",
    expirationDate: "2024-02-02T23:59:59Z",
    batchNumber: "TOMA240127",
  },
  // Location 2 - Mall
  {
    id: "stock_006",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    currentStock: 18.3,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T15:45:00Z",
    lastStockTake: "2024-01-28T09:00:00Z",
    expirationDate: "2024-01-31T23:59:59Z",
    batchNumber: "BEEF240128",
  },
  {
    id: "stock_007",
    ingredientId: "ingredient_006",
    ingredientName: "Pizza Dough",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    currentStock: 22.5,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T10:30:00Z",
    lastStockTake: "2024-01-28T09:00:00Z",
    expirationDate: "2024-01-31T23:59:59Z",
    batchNumber: "DOUGH240128",
  },
  {
    id: "stock_008",
    ingredientId: "ingredient_007",
    ingredientName: "Mozzarella Cheese",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    currentStock: 15.8,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T14:15:00Z",
    lastStockTake: "2024-01-28T09:00:00Z",
    expirationDate: "2024-02-18T23:59:59Z",
    batchNumber: "MOZZ240125",
  },
  // Location 3 - Airport
  {
    id: "stock_009",
    ingredientId: "ingredient_014",
    ingredientName: "Coca-Cola (500ml)",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    currentStock: 85,
    unitOfMeasure: "pieces",
    stockStatus: "low_stock",
    lastUpdated: "2024-01-28T17:00:00Z",
    lastStockTake: "2024-01-28T07:30:00Z",
    expirationDate: "2024-12-31T23:59:59Z",
    batchNumber: "COLA240120",
  },
  {
    id: "stock_010",
    ingredientId: "ingredient_015",
    ingredientName: "French Fries (Frozen)",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    currentStock: 35.2,
    unitOfMeasure: "kg",
    stockStatus: "in_stock",
    lastUpdated: "2024-01-28T16:30:00Z",
    lastStockTake: "2024-01-28T07:30:00Z",
    expirationDate: "2024-12-31T23:59:59Z",
    batchNumber: "FRIES240115",
  },
];

// Mock Stock Movements (Audit Trail)
export const mockStockMovements: StockMovement[] = [
  {
    id: "movement_001",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    movementType: "out",
    quantity: 1.5,
    unitOfMeasure: "kg",
    reason: "sale",
    orderId: "order_001",
    staffId: "staff_001",
    staffName: "John Smith",
    notes: "Cheeseburger orders during lunch rush",
    timestamp: "2024-01-28T12:30:00Z",
    previousStock: 27.0,
    newStock: 25.5,
  },
  {
    id: "movement_002",
    ingredientId: "ingredient_002",
    ingredientName: "Hamburger Buns",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    movementType: "out",
    quantity: 15,
    unitOfMeasure: "pieces",
    reason: "sale",
    orderId: "order_002",
    staffId: "staff_002",
    staffName: "Sarah Johnson",
    notes: "Burger orders during lunch",
    timestamp: "2024-01-28T13:15:00Z",
    previousStock: 60,
    newStock: 45,
  },
  {
    id: "movement_003",
    ingredientId: "ingredient_004",
    ingredientName: "Lettuce (Iceberg)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    movementType: "out",
    quantity: 0.5,
    unitOfMeasure: "kg",
    reason: "spoilage",
    staffId: "staff_003",
    staffName: "Mike Wilson",
    notes: "Outer leaves turned brown, discarded",
    timestamp: "2024-01-28T09:30:00Z",
    previousStock: 8.7,
    newStock: 8.2,
  },
  {
    id: "movement_004",
    ingredientId: "ingredient_007",
    ingredientName: "Mozzarella Cheese",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    movementType: "in",
    quantity: 20.0,
    unitOfMeasure: "kg",
    reason: "delivery",
    staffId: "staff_004",
    staffName: "Lisa Chen",
    notes: "Weekly delivery from Golden State Dairy",
    timestamp: "2024-01-28T08:45:00Z",
    previousStock: 8.8,
    newStock: 28.8,
  },
  {
    id: "movement_005",
    ingredientId: "ingredient_014",
    ingredientName: "Coca-Cola (500ml)",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    movementType: "out",
    quantity: 25,
    unitOfMeasure: "pieces",
    reason: "sale",
    staffId: "staff_005",
    staffName: "Robert Kim",
    notes: "High beverage sales during morning rush",
    timestamp: "2024-01-28T10:00:00Z",
    previousStock: 110,
    newStock: 85,
  },
  {
    id: "movement_006",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    movementType: "out",
    quantity: 2.0,
    unitOfMeasure: "kg",
    reason: "over_prep",
    staffId: "staff_006",
    staffName: "David Brown",
    notes: "Prepared too many patties, had to discard excess",
    timestamp: "2024-01-27T18:30:00Z",
    previousStock: 29.0,
    newStock: 27.0,
  },
];

// Mock Wastage Reports
export const mockWastageReports: WastageReport[] = [
  {
    id: "wastage_001",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    period: "2024-01",
    expectedUsage: 45.2,
    actualUsage: 48.7,
    variance: 3.5,
    variancePercentage: 7.74,
    estimatedWastageCost: 29.75,
    primaryReasons: ["over_prep", "spoilage"],
    generatedAt: "2024-01-28T18:00:00Z",
  },
  {
    id: "wastage_002",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    ingredientId: "ingredient_004",
    ingredientName: "Lettuce (Iceberg)",
    period: "2024-01",
    expectedUsage: 12.8,
    actualUsage: 15.3,
    variance: 2.5,
    variancePercentage: 19.53,
    estimatedWastageCost: 7.0,
    primaryReasons: ["spoilage"],
    generatedAt: "2024-01-28T18:00:00Z",
  },
  {
    id: "wastage_003",
    locationId: "loc_002",
    locationName: "SavorSync Marina",
    ingredientId: "ingredient_006",
    ingredientName: "Pizza Dough",
    period: "2024-01",
    expectedUsage: 28.5,
    actualUsage: 30.2,
    variance: 1.7,
    variancePercentage: 5.96,
    estimatedWastageCost: 3.06,
    primaryReasons: ["over_prep"],
    generatedAt: "2024-01-28T18:00:00Z",
  },
];

// Mock Inventory Alerts
export const mockInventoryAlerts: InventoryAlert[] = [
  {
    id: "alert_001",
    type: "low_stock",
    ingredientId: "ingredient_002",
    ingredientName: "Hamburger Buns",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 45,
    threshold: 50,
    message:
      "Hamburger Buns are running low at SavorSync Downtown (45 pieces remaining)",
    severity: "medium",
    isResolved: false,
    createdAt: "2024-01-28T16:15:00Z",
  },
  {
    id: "alert_002",
    type: "low_stock",
    ingredientId: "ingredient_014",
    ingredientName: "Coca-Cola (500ml)",
    locationId: "loc_003",
    locationName: "SavorSync Mission",
    currentStock: 85,
    threshold: 100,
    message:
      "Coca-Cola (500ml) is running low at SavorSync Mission (85 pieces remaining)",
    severity: "medium",
    isResolved: false,
    createdAt: "2024-01-28T17:00:00Z",
  },
  {
    id: "alert_003",
    type: "expiring_soon",
    ingredientId: "ingredient_001",
    ingredientName: "Ground Beef (80/20)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 25.5,
    threshold: 3,
    message: "Ground Beef (80/20) expires in 3 days at SavorSync Downtown",
    severity: "high",
    isResolved: false,
    createdAt: "2024-01-28T14:30:00Z",
  },
  {
    id: "alert_004",
    type: "expiring_soon",
    ingredientId: "ingredient_005",
    ingredientName: "Tomatoes (Fresh)",
    locationId: "loc_001",
    locationName: "SavorSync Downtown",
    currentStock: 12.8,
    threshold: 5,
    message: "Tomatoes (Fresh) expire in 5 days at SavorSync Downtown",
    severity: "medium",
    isResolved: false,
    createdAt: "2024-01-28T13:30:00Z",
  },
];

// Inventory Helper Functions
export const getStockLevelsByLocation = (locationId: string): StockLevel[] => {
  return mockStockLevels.filter((stock) => stock.locationId === locationId);
};

export const getStockMovementsByLocation = (
  locationId: string
): StockMovement[] => {
  return mockStockMovements.filter(
    (movement) => movement.locationId === locationId
  );
};

export const getStockMovementsByIngredient = (
  ingredientId: string
): StockMovement[] => {
  return mockStockMovements.filter(
    (movement) => movement.ingredientId === ingredientId
  );
};

export const getWastageReportsByLocation = (
  locationId: string
): WastageReport[] => {
  return mockWastageReports.filter(
    (report) => report.locationId === locationId
  );
};

export const getInventoryAlertsByLocation = (
  locationId: string
): InventoryAlert[] => {
  return mockInventoryAlerts.filter((alert) => alert.locationId === locationId);
};

export const getActiveInventoryAlerts = (): InventoryAlert[] => {
  return mockInventoryAlerts.filter((alert) => !alert.isResolved);
};

export const getLowStockItems = (locationId?: string): StockLevel[] => {
  const stockLevels = locationId
    ? getStockLevelsByLocation(locationId)
    : mockStockLevels;
  return stockLevels.filter(
    (stock) =>
      stock.stockStatus === "low_stock" || stock.stockStatus === "out_of_stock"
  );
};

// Task Management Mock Data

// Mock Task Templates
export const mockTaskTemplates: TaskTemplate[] = [
  {
    id: "template_001",
    title: "Daily Opening Checklist",
    description:
      "Complete all opening procedures including equipment checks, cleaning verification, and inventory count",
    category: "operations",
    estimatedDuration: 45,
    priority: "high",
    recurrence: "daily",
    roleAssignment: ["Manager", "FOH"],
    kpiImpact: {
      salesImpact: 15,
      customerSatisfaction: 20,
      operationalEfficiency: 25,
      costReduction: 5,
    },
    qualityChecklist: [
      "All equipment is functioning properly",
      "Dining area is clean and organized",
      "POS system is operational",
      "Inventory levels are adequate",
      "Staff schedules are confirmed",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "template_002",
    title: "Kitchen Deep Clean",
    description:
      "Thorough cleaning of kitchen equipment, surfaces, and storage areas",
    category: "cleaning",
    estimatedDuration: 120,
    priority: "high",
    recurrence: "weekly",
    roleAssignment: ["Kitchen", "BOH"],
    kpiImpact: {
      salesImpact: 5,
      customerSatisfaction: 15,
      operationalEfficiency: 10,
      costReduction: 20,
    },
    qualityChecklist: [
      "All cooking equipment cleaned and sanitized",
      "Food storage areas organized and clean",
      "Floors mopped and sanitized",
      "Trash disposed of properly",
      "Cleaning supplies restocked",
    ],
    isActive: true,
    createdBy: "staff_002",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
  },
  {
    id: "template_003",
    title: "Inventory Count and Reorder",
    description:
      "Count current inventory levels and place orders for low-stock items",
    category: "inventory",
    estimatedDuration: 90,
    priority: "medium",
    recurrence: "weekly",
    roleAssignment: ["Manager", "BOH"],
    kpiImpact: {
      salesImpact: 25,
      customerSatisfaction: 10,
      operationalEfficiency: 30,
      costReduction: 35,
    },
    qualityChecklist: [
      "All items counted accurately",
      "Reorder points checked",
      "Orders placed for low-stock items",
      "Expiration dates verified",
      "Storage conditions optimal",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "template_004",
    title: "Customer Feedback Review",
    description: "Review and respond to customer feedback from all channels",
    category: "customer_service",
    estimatedDuration: 60,
    priority: "medium",
    recurrence: "daily",
    roleAssignment: ["Manager", "FOH"],
    kpiImpact: {
      salesImpact: 20,
      customerSatisfaction: 40,
      operationalEfficiency: 5,
      costReduction: 0,
    },
    qualityChecklist: [
      "All reviews read and categorized",
      "Responses drafted for negative reviews",
      "Improvement opportunities identified",
      "Staff feedback shared when relevant",
      "Follow-up actions scheduled",
    ],
    isActive: true,
    createdBy: "staff_002",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "template_005",
    title: "Staff Training Session",
    description: "Conduct training session on new procedures or menu items",
    category: "training",
    estimatedDuration: 180,
    priority: "medium",
    recurrence: "weekly",
    roleAssignment: ["Manager"],
    kpiImpact: {
      salesImpact: 15,
      customerSatisfaction: 25,
      operationalEfficiency: 20,
      costReduction: 10,
    },
    qualityChecklist: [
      "Training materials prepared",
      "All staff members present",
      "Key concepts covered thoroughly",
      "Questions answered satisfactorily",
      "Follow-up assessments scheduled",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-12T11:30:00Z",
  },
  {
    id: "template_006",
    title: "Equipment Maintenance Check",
    description:
      "Perform routine maintenance checks on kitchen and dining equipment",
    category: "maintenance",
    estimatedDuration: 75,
    priority: "medium",
    recurrence: "weekly",
    roleAssignment: ["BOH", "Manager"],
    kpiImpact: {
      salesImpact: 10,
      customerSatisfaction: 5,
      operationalEfficiency: 35,
      costReduction: 25,
    },
    qualityChecklist: [
      "All equipment inspected for wear and tear",
      "Maintenance logs updated",
      "Safety protocols followed",
      "Replacement parts ordered if needed",
      "Equipment cleaned and calibrated",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-22T13:15:00Z",
  },
  {
    id: "template_007",
    title: "Daily Closing Procedures",
    description:
      "Complete all closing procedures including cash reconciliation and security checks",
    category: "operations",
    estimatedDuration: 60,
    priority: "high",
    recurrence: "daily",
    roleAssignment: ["Manager", "FOH"],
    kpiImpact: {
      salesImpact: 5,
      customerSatisfaction: 10,
      operationalEfficiency: 30,
      costReduction: 15,
    },
    qualityChecklist: [
      "Cash register reconciled",
      "All equipment turned off",
      "Doors and windows secured",
      "Alarm system activated",
      "Daily sales report completed",
    ],
    isActive: true,
    createdBy: "staff_002",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-25T17:45:00Z",
  },
  {
    id: "template_008",
    title: "Food Safety Inspection",
    description: "Conduct thorough food safety and hygiene inspection",
    category: "compliance",
    estimatedDuration: 90,
    priority: "high",
    recurrence: "weekly",
    roleAssignment: ["Manager", "Kitchen"],
    kpiImpact: {
      salesImpact: 0,
      customerSatisfaction: 30,
      operationalEfficiency: 15,
      costReduction: 5,
    },
    qualityChecklist: [
      "Temperature logs verified",
      "Food storage areas inspected",
      "Hygiene protocols followed",
      "Expiration dates checked",
      "Compliance documentation updated",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-20T09:30:00Z",
  },
  {
    id: "template_009",
    title: "Customer Area Sanitization",
    description: "Deep sanitization of customer seating and high-touch areas",
    category: "cleaning",
    estimatedDuration: 45,
    priority: "high",
    recurrence: "daily",
    roleAssignment: ["FOH", "Cleaning"],
    kpiImpact: {
      salesImpact: 5,
      customerSatisfaction: 35,
      operationalEfficiency: 10,
      costReduction: 0,
    },
    qualityChecklist: [
      "All tables and chairs sanitized",
      "High-touch surfaces disinfected",
      "Restrooms cleaned and stocked",
      "Floor mopped and dried",
      "Sanitization logs updated",
    ],
    isActive: true,
    createdBy: "staff_003",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-28T14:20:00Z",
  },
  {
    id: "template_010",
    title: "Menu Item Quality Check",
    description: "Taste test and quality verification of menu items",
    category: "sales",
    estimatedDuration: 30,
    priority: "medium",
    recurrence: "daily",
    roleAssignment: ["Kitchen", "Manager"],
    kpiImpact: {
      salesImpact: 25,
      customerSatisfaction: 40,
      operationalEfficiency: 5,
      costReduction: 0,
    },
    qualityChecklist: [
      "Sample items from each category tested",
      "Presentation standards verified",
      "Temperature requirements met",
      "Portion sizes consistent",
      "Quality feedback documented",
    ],
    isActive: true,
    createdBy: "staff_002",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-26T11:45:00Z",
  },
  {
    id: "template_011",
    title: "Staff Performance Review",
    description: "Conduct individual staff performance evaluations",
    category: "training",
    estimatedDuration: 120,
    priority: "medium",
    recurrence: "monthly",
    roleAssignment: ["Manager"],
    kpiImpact: {
      salesImpact: 20,
      customerSatisfaction: 25,
      operationalEfficiency: 30,
      costReduction: 10,
    },
    qualityChecklist: [
      "Performance metrics reviewed",
      "Feedback provided to staff member",
      "Development goals set",
      "Training needs identified",
      "Documentation completed",
    ],
    isActive: true,
    createdBy: "staff_001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T16:30:00Z",
  },
  {
    id: "template_012",
    title: "Supply Chain Coordination",
    description: "Coordinate with suppliers and manage delivery schedules",
    category: "inventory",
    estimatedDuration: 60,
    priority: "medium",
    recurrence: "weekly",
    roleAssignment: ["Manager", "BOH"],
    kpiImpact: {
      salesImpact: 15,
      customerSatisfaction: 5,
      operationalEfficiency: 25,
      costReduction: 30,
    },
    qualityChecklist: [
      "Delivery schedules confirmed",
      "Supplier communications logged",
      "Quality standards communicated",
      "Payment schedules verified",
      "Backup suppliers identified",
    ],
    isActive: true,
    createdBy: "staff_002",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-24T10:15:00Z",
  },
];

// Generate Mock Tasks
function generateMockTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  const staffIds = mockStaffMembers.map((staff) => staff.id);
  const locationIds = mockLocations.map((loc) => loc.id);

  // Generate tasks for the past 30 days and next 7 days
  for (let dayOffset = -30; dayOffset <= 7; dayOffset++) {
    const taskDate = new Date(now);
    taskDate.setDate(taskDate.getDate() + dayOffset);

    // Generate more tasks per location per day to reach ~40 tasks per location
    // With 3 locations and 37 days, we need about 4-5 tasks per location per day
    mockLocations.forEach((location) => {
      const tasksPerLocationPerDay = Math.floor(Math.random() * 4) + 4; // 4-7 tasks per location per day

      for (let i = 0; i < tasksPerLocationPerDay; i++) {
        const template =
          mockTaskTemplates[
            Math.floor(Math.random() * mockTaskTemplates.length)
          ];
        const assignedStaff =
          mockStaffMembers.find(
            (staff) =>
              staff.locationId === location.id &&
              template.roleAssignment.includes(staff.role)
          ) ||
          mockStaffMembers.find((staff) => staff.locationId === location.id);

        if (!assignedStaff) continue;

        const assignedBy =
          mockStaffMembers.find(
            (staff) =>
              staff.locationId === location.id && staff.role === "Manager"
          ) || assignedStaff;

        const taskId = `task_${dayOffset + 30}_${i}_${location.id}`;
        const dueDate = new Date(taskDate);
        dueDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM

        let status: TaskStatus = "pending";
        let completedAt: string | undefined;
        let startedAt: string | undefined;
        let actualDuration: number | undefined;
        let qualityScore: number | undefined;

        // For past tasks, randomly assign completion status
        if (dayOffset < 0) {
          const completionChance = Math.random();
          if (completionChance > 0.15) {
            // 85% completion rate
            status = "completed";
            startedAt = new Date(
              dueDate.getTime() - Math.random() * 60 * 60 * 1000
            ).toISOString();
            actualDuration =
              template.estimatedDuration + (Math.random() * 60 - 30); // ±30 minutes
            completedAt = new Date(
              dueDate.getTime() + actualDuration * 60 * 1000
            ).toISOString();
            qualityScore = Math.floor(Math.random() * 4) + 7; // 7-10 scale
          } else if (completionChance > 0.05) {
            // 10% overdue
            status = "overdue";
          } else {
            // 5% cancelled
            status = "cancelled";
          }
        } else if (dayOffset === 0) {
          // Today's tasks - some in progress
          if (Math.random() > 0.6) {
            status = "in_progress";
            startedAt = new Date(
              dueDate.getTime() - Math.random() * 2 * 60 * 60 * 1000
            ).toISOString();
          }
        }

        const task: Task = {
          id: taskId,
          templateId: template.id,
          title: template.title,
          description: template.description,
          category: template.category,
          priority: template.priority,
          status,
          assignedTo: assignedStaff.id,
          assignedBy: assignedBy.id,
          locationId: location.id,
          locationName: location.name,
          dueDate: dueDate.toISOString(),
          estimatedDuration: template.estimatedDuration,
          actualDuration,
          startedAt,
          completedAt,
          qualityScore,
          qualityNotes: qualityScore
            ? `Task completed with ${
                qualityScore >= 9
                  ? "excellent"
                  : qualityScore >= 8
                  ? "good"
                  : "satisfactory"
              } quality.`
            : undefined,
          evidence:
            status === "completed" && Math.random() > 0.5
              ? {
                  photos: [`evidence_${taskId}_1.jpg`],
                  notes: "Task completed as per checklist requirements.",
                  checkedBy: assignedBy.id,
                  checkedAt: completedAt,
                }
              : undefined,
          financialImpact: {
            estimatedCostSavings: Math.floor(Math.random() * 200) + 50,
            actualCostSavings:
              status === "completed"
                ? Math.floor(Math.random() * 250) + 40
                : undefined,
            revenueImpact:
              template.kpiImpact.salesImpact > 0
                ? Math.floor(Math.random() * 500) + 100
                : undefined,
          },
          comments: [],
          recurrence:
            template.recurrence !== "none"
              ? {
                  type: template.recurrence,
                  nextDueDate:
                    status === "completed"
                      ? new Date(
                          dueDate.getTime() +
                            (template.recurrence === "daily"
                              ? 24 * 60 * 60 * 1000
                              : 7 * 24 * 60 * 60 * 1000)
                        ).toISOString()
                      : undefined,
                  completedCount: Math.floor(Math.random() * 30),
                }
              : undefined,
          escalation:
            status === "overdue" && Math.random() > 0.7
              ? {
                  isEscalated: true,
                  escalatedAt: new Date(
                    dueDate.getTime() + 2 * 60 * 60 * 1000
                  ).toISOString(),
                  escalatedBy: assignedStaff.id,
                  escalationReason: "Task overdue by more than 2 hours",
                  escalatedTo: assignedBy.id,
                }
              : {
                  isEscalated: false,
                },
          createdAt: new Date(
            dueDate.getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt:
            completedAt ||
            startedAt ||
            new Date(dueDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        };

        // Add some comments for completed or overdue tasks
        if (
          (status === "completed" || status === "overdue") &&
          Math.random() > 0.6
        ) {
          task.comments.push({
            id: `comment_${taskId}_1`,
            taskId: taskId,
            authorId: assignedStaff.id,
            authorName: assignedStaff.name,
            content:
              status === "completed"
                ? "Task completed successfully. All checklist items verified."
                : "Encountered delays due to equipment issues. Working on resolution.",
            createdAt:
              completedAt ||
              new Date(dueDate.getTime() + 60 * 60 * 1000).toISOString(),
          });
        }

        tasks.push(task);
      }
    });
  }

  return tasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockTasks = generateMockTasks();

// Generate Mock Task Performance Metrics
export const mockTaskPerformanceMetrics: TaskPerformanceMetrics[] =
  mockStaffMembers.map((staff) => {
    const staffTasks = mockTasks.filter((task) => task.assignedTo === staff.id);
    const completedTasks = staffTasks.filter(
      (task) => task.status === "completed"
    );
    const overdueTasks = staffTasks.filter((task) => task.status === "overdue");

    const avgCompletionTime =
      completedTasks.length > 0
        ? completedTasks.reduce(
            (sum, task) =>
              sum + (task.actualDuration || task.estimatedDuration),
            0
          ) / completedTasks.length
        : 0;

    const avgQualityScore =
      completedTasks.filter((task) => task.qualityScore).length > 0
        ? completedTasks
            .filter((task) => task.qualityScore)
            .reduce((sum, task) => sum + (task.qualityScore || 0), 0) /
          completedTasks.filter((task) => task.qualityScore).length
        : 0;

    const onTimeRate =
      staffTasks.length > 0
        ? ((staffTasks.length - overdueTasks.length) / staffTasks.length) * 100
        : 100;

    // Calculate task categories breakdown
    const taskCategories = {} as TaskPerformanceMetrics["taskCategories"];
    const categories: TaskCategory[] = [
      "cleaning",
      "inventory",
      "customer_service",
      "maintenance",
      "training",
      "compliance",
      "sales",
      "operations",
    ];

    categories.forEach((category) => {
      const categoryTasks = staffTasks.filter(
        (task) => task.category === category
      );
      const categoryCompleted = categoryTasks.filter(
        (task) => task.status === "completed"
      );
      const categoryQuality =
        categoryCompleted.filter((task) => task.qualityScore).length > 0
          ? categoryCompleted
              .filter((task) => task.qualityScore)
              .reduce((sum, task) => sum + (task.qualityScore || 0), 0) /
            categoryCompleted.filter((task) => task.qualityScore).length
          : 0;

      taskCategories[category] = {
        assigned: categoryTasks.length,
        completed: categoryCompleted.length,
        averageQuality: Math.round(categoryQuality * 100) / 100,
      };
    });

    // Determine tier based on performance
    let tier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
    const completionRate =
      staffTasks.length > 0
        ? (completedTasks.length / staffTasks.length) * 100
        : 0;

    if (completionRate >= 95 && avgQualityScore >= 9 && onTimeRate >= 95) {
      tier = "platinum";
    } else if (
      completionRate >= 90 &&
      avgQualityScore >= 8 &&
      onTimeRate >= 90
    ) {
      tier = "gold";
    } else if (
      completionRate >= 80 &&
      avgQualityScore >= 7 &&
      onTimeRate >= 85
    ) {
      tier = "silver";
    }

    return {
      staffId: staff.id,
      locationId: staff.locationId,
      period: "2024-01",
      tasksAssigned: staffTasks.length,
      tasksCompleted: completedTasks.length,
      tasksOverdue: overdueTasks.length,
      averageCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      averageQualityScore: Math.round(avgQualityScore * 100) / 100,
      onTimeCompletionRate: Math.round(onTimeRate * 100) / 100,
      taskCategories,
      kpiContribution: {
        salesImpact: Math.floor(Math.random() * 20) + 5,
        customerSatisfaction: Math.floor(Math.random() * 25) + 10,
        operationalEfficiency: Math.floor(Math.random() * 30) + 15,
        costReduction: Math.floor(Math.random() * 15) + 5,
      },
      tier,
      improvementAreas:
        tier === "bronze"
          ? ["Time management", "Quality consistency"]
          : tier === "silver"
          ? ["Task prioritization"]
          : [],
    };
  });

// Generate Mock Daily Action Plans
export const mockDailyActionPlans: DailyActionPlan[] = mockLocations.map(
  (location) => {
    const today = new Date();
    const todayTasks = mockTasks.filter(
      (task) =>
        task.locationId === location.id &&
        new Date(task.dueDate).toDateString() === today.toDateString()
    );

    const highPriorityTasks = todayTasks.filter(
      (task) => task.priority === "high" || task.priority === "critical"
    );
    const mediumPriorityTasks = todayTasks.filter(
      (task) => task.priority === "medium"
    );
    const lowPriorityTasks = todayTasks.filter(
      (task) => task.priority === "low"
    );

    const locationStaff = mockStaffMembers.filter(
      (staff) => staff.locationId === location.id
    );
    const staffAllocations: DailyActionPlan["staffAllocations"] = {};

    locationStaff.forEach((staff) => {
      const staffTasks = todayTasks.filter(
        (task) => task.assignedTo === staff.id
      );
      const totalWorkload = staffTasks.reduce(
        (sum, task) => sum + task.estimatedDuration,
        0
      );
      const capacityUtilization = Math.min((totalWorkload / 480) * 100, 100); // 8-hour workday

      staffAllocations[staff.id] = {
        staffName: staff.name,
        role: staff.role,
        assignedTasks: staffTasks.map((task) => task.id),
        estimatedWorkload: totalWorkload,
        capacityUtilization: Math.round(capacityUtilization * 100) / 100,
      };
    });

    return {
      id: `plan_${location.id}_${today.toISOString().split("T")[0]}`,
      locationId: location.id,
      date: today.toISOString().split("T")[0],
      generatedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // Generated 2 hours ago
      generatedBy: "ai",
      priorities: {
        high: highPriorityTasks,
        medium: mediumPriorityTasks,
        low: lowPriorityTasks,
      },
      staffAllocations,
      kpiTargets: {
        salesTarget: Math.floor(Math.random() * 5000) + 3000,
        customerSatisfactionTarget: 4.5,
        operationalEfficiencyTarget: 85,
        costReductionTarget: 12,
      },
      insights: [
        "High customer traffic expected during lunch hours",
        "Kitchen deep clean scheduled for optimal timing",
        "Inventory levels are adequate for weekend rush",
      ],
      recommendations: [
        "Focus on customer service tasks during peak hours",
        "Schedule maintenance tasks during slower periods",
        "Ensure adequate staffing for high-priority tasks",
      ],
    };
  }
);

// Task Management Helper Functions
export const getTasksByLocation = (locationId: string): Task[] => {
  return mockTasks.filter((task) => task.locationId === locationId);
};

export const getTasksByStaff = (staffId: string): Task[] => {
  return mockTasks.filter((task) => task.assignedTo === staffId);
};

export const getTasksByStatus = (status: TaskStatus): Task[] => {
  return mockTasks.filter((task) => task.status === status);
};

export const getTasksByDateRange = (startDate: Date, endDate: Date): Task[] => {
  return mockTasks.filter((task) => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= startDate && taskDate <= endDate;
  });
};

export const getTaskPerformanceByStaff = (
  staffId: string
): TaskPerformanceMetrics | undefined => {
  return mockTaskPerformanceMetrics.find(
    (metrics) => metrics.staffId === staffId
  );
};

export const getDailyActionPlan = (
  locationId: string,
  date: string
): DailyActionPlan | undefined => {
  return mockDailyActionPlans.find(
    (plan) => plan.locationId === locationId && plan.date === date
  );
};
