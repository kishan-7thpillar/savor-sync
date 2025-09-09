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
