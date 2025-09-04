import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for manual inventory update
const manualInventoryUpdateSchema = z.object({
  ingredientId: z.string().uuid(),
  newStock: z.number().nonnegative(),
  reason: z.string().min(1, 'Reason is required for manual updates'),
  locationId: z.string().uuid()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = manualInventoryUpdateSchema.parse(body)
    
    const { ingredientId, newStock, reason, locationId } = validatedData

    // Get current ingredient data
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, unit, location_id')
      .eq('id', ingredientId)
      .single()

    if (ingredientError || !ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    // Verify the ingredient belongs to the specified location
    if (ingredient.location_id !== locationId) {
      return NextResponse.json(
        { error: 'Ingredient does not belong to the specified location' },
        { status: 400 }
      )
    }

    // Verify user has access to this location
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('organization_id')
      .eq('id', locationId)
      .single()

    if (locationError || !location || location.organization_id !== userProfile.organization_id) {
      return NextResponse.json(
        { error: 'Access denied to this location' },
        { status: 403 }
      )
    }

    const previousStock = ingredient.current_stock

    // Update ingredient stock
    const { error: updateError } = await supabase
      .from('ingredients')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', ingredientId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update ingredient stock' },
        { status: 500 }
      )
    }

    // Create inventory log entry
    const logEntry = {
      location_id: locationId,
      updates: [{
        ingredient_id: ingredientId,
        ingredient_name: ingredient.name,
        previousStock,
        newStock,
        quantity: newStock - previousStock,
        unit: ingredient.unit
      }],
      type: 'MANUAL',
      reason,
      created_by: user.id
    }

    const { error: logError } = await supabase
      .from('inventory_logs')
      .insert(logEntry)

    if (logError) {
      console.error('Failed to create inventory log:', logError)
      // Don't fail the request if logging fails, but log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        ingredientId,
        ingredientName: ingredient.name,
        previousStock,
        newStock,
        reason,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in manual inventory update:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch inventory items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    // Build query
    let query = supabase
      .from('ingredients')
      .select(`
        id,
        name,
        category,
        current_stock,
        unit,
        unit_cost,
        reorder_point,
        location_id,
        supplier_name,
        created_at,
        updated_at
      `)

    // Filter by location if provided
    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    // Get user's organization to filter results
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Join with locations to ensure user only sees ingredients from their organization
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select(`
        id,
        name,
        category,
        current_stock,
        unit,
        unit_cost,
        reorder_point,
        location_id,
        supplier_name,
        created_at,
        updated_at,
        locations!inner(organization_id)
      `)
      .eq('locations.organization_id', userProfile.organization_id)
      .eq(locationId ? 'location_id' : '', locationId || '')

    if (ingredientsError) {
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ingredients
    })

  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
