export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: 'owner' | 'manager' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role?: 'owner' | 'manager' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: 'owner' | 'manager' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string
          phone: string
          cuisine_type: string
          pos_system: string | null
          pos_config: any | null
          timezone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address: string
          phone: string
          cuisine_type: string
          pos_system?: string | null
          pos_config?: any | null
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string
          phone?: string
          cuisine_type?: string
          pos_system?: string | null
          pos_config?: any | null
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          location_id: string
          pos_order_id: string | null
          order_number: string
          total_amount: number
          tax_amount: number
          tip_amount: number
          discount_amount: number
          payment_method: string
          order_status: string
          order_type: 'dine-in' | 'takeout' | 'delivery'
          customer_id: string | null
          staff_id: string | null
          order_placed_at: string
          order_completed_at: string | null
          prep_time_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          pos_order_id?: string | null
          order_number: string
          total_amount: number
          tax_amount?: number
          tip_amount?: number
          discount_amount?: number
          payment_method: string
          order_status: string
          order_type: 'dine-in' | 'takeout' | 'delivery'
          customer_id?: string | null
          staff_id?: string | null
          order_placed_at: string
          order_completed_at?: string | null
          prep_time_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          pos_order_id?: string | null
          order_number?: string
          total_amount?: number
          tax_amount?: number
          tip_amount?: number
          discount_amount?: number
          payment_method?: string
          order_status?: string
          order_type?: 'dine-in' | 'takeout' | 'delivery'
          customer_id?: string | null
          staff_id?: string | null
          order_placed_at?: string
          order_completed_at?: string | null
          prep_time_minutes?: number | null
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          location_id: string
          pos_item_id: string | null
          name: string
          category: string
          selling_price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          pos_item_id?: string | null
          name: string
          category: string
          selling_price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          pos_item_id?: string | null
          name?: string
          category?: string
          selling_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'manager' | 'staff'
      order_type: 'dine-in' | 'takeout' | 'delivery'
    }
  }
}
