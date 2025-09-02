import { Database } from './database'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']

export type UserRole = 'owner' | 'manager' | 'staff'
export type OrderType = 'dine-in' | 'takeout' | 'delivery'

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

export interface LocationWithMetrics extends Location {
  todaySales?: number
  todayOrders?: number
  avgOrderValue?: number
  status?: 'online' | 'offline' | 'syncing' | 'error'
  pos_integrations?: {
    pos_system: string
    sync_status: 'success' | 'error' | 'syncing'
    last_sync: string
    error_message?: string
  }[]
}

export interface DashboardMetrics {
  totalSales: number
  totalOrders: number
  avgOrderValue: number
  activeLocations: number
  salesChange: number
  ordersChange: number
  aovChange: number
}

export interface SalesData {
  date: string
  sales: number
  orders: number
  location?: string
}

export interface POSIntegration {
  id: string
  locationId: string
  posSystem: 'square' | 'toast' | 'generic'
  credentials: Record<string, any>
  lastSync: string
  syncStatus: 'success' | 'error' | 'syncing'
  errorMessage?: string
}
