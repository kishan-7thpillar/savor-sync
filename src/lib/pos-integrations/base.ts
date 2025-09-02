export interface POSOrder {
  id: string
  orderNumber: string
  totalAmount: number
  taxAmount: number
  tipAmount: number
  discountAmount: number
  paymentMethod: string
  orderStatus: string
  orderType: 'dine-in' | 'takeout' | 'delivery'
  customerId?: string
  staffId?: string
  orderPlacedAt: string
  orderCompletedAt?: string
  prepTimeMinutes?: number
  items: POSOrderItem[]
}

export interface POSOrderItem {
  id: string
  itemName: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  modifiers?: Record<string, any>
}

export interface POSMenuItem {
  id: string
  name: string
  category: string
  price: number
  isActive: boolean
}

export interface POSStaffMember {
  id: string
  name: string
  role: string
  hourlyRate?: number
}

export abstract class POSIntegration {
  protected locationId: string
  protected credentials: Record<string, any>

  constructor(locationId: string, credentials: Record<string, any>) {
    this.locationId = locationId
    this.credentials = credentials
  }

  abstract validateConnection(): Promise<boolean>
  abstract syncOrders(since?: Date): Promise<POSOrder[]>
  abstract syncMenuItems(): Promise<POSMenuItem[]>
  abstract syncStaffData(): Promise<POSStaffMember[]>
  abstract getWebhookEndpoint(): string
  abstract handleWebhook(payload: any): Promise<void>

  protected async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  protected transformOrder(rawOrder: any): POSOrder {
    // Default transformation - should be overridden by specific implementations
    return rawOrder
  }

  protected transformMenuItem(rawItem: any): POSMenuItem {
    // Default transformation - should be overridden by specific implementations
    return rawItem
  }

  protected transformStaffMember(rawStaff: any): POSStaffMember {
    // Default transformation - should be overridden by specific implementations
    return rawStaff
  }
}
