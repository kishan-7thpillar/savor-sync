import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { POSIntegrationFactory, POSSystem } from '@/lib/pos-integrations/factory'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { locationId, syncType = 'all', since } = body

    if (!locationId) {
      return NextResponse.json(
        { error: 'Missing required field: locationId' },
        { status: 400 }
      )
    }

    // Get POS integration for location
    const { data: integration, error: integrationError } = await supabase
      .from('pos_integrations')
      .select('*')
      .eq('location_id', locationId)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'No POS integration found for this location' },
        { status: 404 }
      )
    }

    // Create POS integration instance
    const posIntegration = POSIntegrationFactory.create(
      integration.pos_system as POSSystem,
      locationId,
      integration.credentials
    )

    const results: any = {}
    const sinceDate = since ? new Date(since) : undefined

    try {
      // Update sync status to syncing
      await supabase
        .from('pos_integrations')
        .update({ sync_status: 'syncing' })
        .eq('id', integration.id)

      // Sync orders
      if (syncType === 'all' || syncType === 'orders') {
        const orders = await posIntegration.syncOrders(sinceDate)
        results.orders = await syncOrdersToDatabase(supabase, locationId, orders)
      }

      // Sync menu items
      if (syncType === 'all' || syncType === 'menu') {
        const menuItems = await posIntegration.syncMenuItems()
        results.menuItems = await syncMenuItemsToDatabase(supabase, locationId, menuItems)
      }

      // Sync staff data
      if (syncType === 'all' || syncType === 'staff') {
        const staffMembers = await posIntegration.syncStaffData()
        results.staff = await syncStaffToDatabase(supabase, locationId, staffMembers)
      }

      // Update sync status to success
      await supabase
        .from('pos_integrations')
        .update({
          sync_status: 'success',
          last_sync: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', integration.id)

      return NextResponse.json({
        message: 'Sync completed successfully',
        results,
      })
    } catch (syncError: any) {
      // Update sync status to error
      await supabase
        .from('pos_integrations')
        .update({
          sync_status: 'error',
          error_message: syncError.message,
        })
        .eq('id', integration.id)

      throw syncError
    }
  } catch (error: any) {
    console.error('POS sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function syncOrdersToDatabase(supabase: any, locationId: string, orders: any[]) {
  const results = { inserted: 0, updated: 0, errors: 0 }

  for (const order of orders) {
    try {
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('pos_order_id', order.id)
        .eq('location_id', locationId)
        .single()

      const orderData = {
        location_id: locationId,
        pos_order_id: order.id,
        order_number: order.orderNumber,
        total_amount: order.totalAmount,
        tax_amount: order.taxAmount,
        tip_amount: order.tipAmount,
        discount_amount: order.discountAmount,
        payment_method: order.paymentMethod,
        order_status: order.orderStatus,
        order_type: order.orderType,
        customer_id: order.customerId,
        staff_id: order.staffId,
        order_placed_at: order.orderPlacedAt,
        order_completed_at: order.orderCompletedAt,
        prep_time_minutes: order.prepTimeMinutes,
      }

      if (existingOrder) {
        // Update existing order
        await supabase
          .from('orders')
          .update(orderData)
          .eq('id', existingOrder.id)
        results.updated++
      } else {
        // Insert new order
        const { data: newOrder } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
          .single()

        // Insert order items
        if (newOrder && order.items?.length > 0) {
          const orderItems = order.items.map((item: any) => ({
            order_id: newOrder.id,
            pos_item_id: item.id,
            item_name: item.itemName,
            category: item.category,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            modifiers: item.modifiers,
          }))

          await supabase.from('order_items').insert(orderItems)
        }
        results.inserted++
      }
    } catch (error) {
      console.error('Error syncing order:', order.id, error)
      results.errors++
    }
  }

  return results
}

async function syncMenuItemsToDatabase(supabase: any, locationId: string, menuItems: any[]) {
  const results = { inserted: 0, updated: 0, errors: 0 }

  for (const item of menuItems) {
    try {
      const { data: existingItem } = await supabase
        .from('menu_items')
        .select('id')
        .eq('pos_item_id', item.id)
        .eq('location_id', locationId)
        .single()

      const itemData = {
        location_id: locationId,
        pos_item_id: item.id,
        name: item.name,
        category: item.category,
        selling_price: item.price,
        is_active: item.isActive,
      }

      if (existingItem) {
        await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', existingItem.id)
        results.updated++
      } else {
        await supabase.from('menu_items').insert(itemData)
        results.inserted++
      }
    } catch (error) {
      console.error('Error syncing menu item:', item.id, error)
      results.errors++
    }
  }

  return results
}

async function syncStaffToDatabase(supabase: any, locationId: string, staffMembers: any[]) {
  const results = { inserted: 0, updated: 0, errors: 0 }

  for (const staff of staffMembers) {
    try {
      // For now, we'll just log staff data since we don't have a dedicated staff table
      // In a full implementation, you'd sync to a staff_members table
      console.log('Staff member synced:', staff)
      results.inserted++
    } catch (error) {
      console.error('Error syncing staff member:', staff.id, error)
      results.errors++
    }
  }

  return results
}
