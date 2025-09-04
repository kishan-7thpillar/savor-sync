import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const type = searchParams.get('type') // 'AUTO', 'MANUAL', or null for all
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Build query for inventory logs
    let query = supabase
      .from('inventory_logs')
      .select(`
        id,
        order_id,
        location_id,
        updates,
        type,
        reason,
        created_at,
        created_by,
        profiles!inventory_logs_created_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by location if provided
    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    // Filter by type if provided
    if (type && (type === 'AUTO' || type === 'MANUAL')) {
      query = query.eq('type', type)
    }

    // Execute query
    const { data: logs, error: logsError } = await query

    if (logsError) {
      console.error('Error fetching inventory logs:', logsError)
      return NextResponse.json(
        { error: 'Failed to fetch inventory logs' },
        { status: 500 }
      )
    }

    // Verify user has access to these locations
    const locationIds = [...new Set(logs.map((log: any) => log.location_id))]
    
    if (locationIds.length > 0) {
      const { data: accessibleLocations, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .eq('organization_id', userProfile.organization_id)
        .in('id', locationIds)

      if (locationError) {
        return NextResponse.json(
          { error: 'Failed to verify location access' },
          { status: 500 }
        )
      }

      const accessibleLocationIds = new Set(accessibleLocations.map((loc: any) => loc.id))
      
      // Filter logs to only include those from accessible locations
      const filteredLogs = logs.filter((log: any) => accessibleLocationIds.has(log.location_id))

      return NextResponse.json({
        success: true,
        data: filteredLogs,
        pagination: {
          limit,
          offset,
          hasMore: filteredLogs.length === limit
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        limit,
        offset,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('Error in inventory logs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
