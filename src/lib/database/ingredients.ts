import { createClient } from '@/lib/supabase/client'
import { IngredientFormData } from '@/types/square'

export interface DatabaseIngredient {
  id: string
  organization_id: string
  name: string
  description?: string
  category: string
  current_stock: number
  unit: string
  unit_cost: number
  reorder_point: number
  max_stock?: number
  location_id: string
  supplier_name?: string
  supplier_contact?: string
  expiration_date?: string
  storage_requirements?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateIngredientData {
  name: string
  description?: string
  category: string
  current_stock: number
  unit: string
  unit_cost: number
  reorder_point: number
  max_stock?: number
  location_id: string
  supplier_name?: string
  supplier_contact?: string
  expiration_date?: string
  storage_requirements?: string
}

export class IngredientService {
  private supabase = createClient()

  async createIngredient(data: CreateIngredientData): Promise<{ success: boolean; data?: DatabaseIngredient; error?: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get user's organization
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' }
      }

      // Insert ingredient
      const { data: ingredient, error } = await this.supabase
        .from('ingredients')
        .insert({
          ...data,
          organization_id: profile.organization_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating ingredient:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: ingredient }
    } catch (error) {
      console.error('Unexpected error creating ingredient:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async updateIngredient(id: string, data: Partial<CreateIngredientData>): Promise<{ success: boolean; data?: DatabaseIngredient; error?: string }> {
    try {
      const { data: ingredient, error } = await this.supabase
        .from('ingredients')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating ingredient:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: ingredient }
    } catch (error) {
      console.error('Unexpected error updating ingredient:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getIngredients(filters?: {
    category?: string
    location_id?: string
    search?: string
  }): Promise<{ success: boolean; data?: DatabaseIngredient[]; error?: string }> {
    try {
      let query = this.supabase
        .from('ingredients')
        .select('*')
        .order('name')

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters?.location_id && filters.location_id !== 'all') {
        query = query.eq('location_id', filters.location_id)
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data: ingredients, error } = await query

      if (error) {
        console.error('Error fetching ingredients:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: ingredients || [] }
    } catch (error) {
      console.error('Unexpected error fetching ingredients:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getIngredientById(id: string): Promise<{ success: boolean; data?: DatabaseIngredient; error?: string }> {
    try {
      const { data: ingredient, error } = await this.supabase
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching ingredient:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: ingredient }
    } catch (error) {
      console.error('Unexpected error fetching ingredient:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async deleteIngredient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('ingredients')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting ingredient:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting ingredient:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getLocations(): Promise<{ success: boolean; data?: Array<{ id: string; name: string }>; error?: string }> {
    try {
      // Get current user's organization locations
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' }
      }

      const { data: locations, error } = await this.supabase
        .from('locations')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching locations:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: locations || [] }
    } catch (error) {
      console.error('Unexpected error fetching locations:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

export const ingredientService = new IngredientService()
