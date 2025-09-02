import { POSIntegration, POSOrder, POSMenuItem, POSStaffMember } from './base'

export class SquareIntegration extends POSIntegration {
  private baseUrl = 'https://connect.squareup.com/v2'
  private accessToken: string

  constructor(locationId: string, credentials: Record<string, any>) {
    super(locationId, credentials)
    this.accessToken = credentials.accessToken
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/locations`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Square-Version': '2023-10-18',
        },
      })
      return response.locations && response.locations.length > 0
    } catch (error) {
      console.error('Square connection validation failed:', error)
      return false
    }
  }

  async syncOrders(since?: Date): Promise<POSOrder[]> {
    try {
      const query: any = {
        location_ids: [this.credentials.squareLocationId],
        limit: 100,
      }

      if (since) {
        query.filter = {
          date_time_filter: {
            created_at: {
              start_at: since.toISOString(),
            },
          },
        }
      }

      const response = await this.makeRequest(`${this.baseUrl}/orders/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Square-Version': '2023-10-18',
        },
        body: JSON.stringify({ query }),
      })

      return response.orders?.map((order: any) => this.transformSquareOrder(order)) || []
    } catch (error) {
      console.error('Square orders sync failed:', error)
      return []
    }
  }

  async syncMenuItems(): Promise<POSMenuItem[]> {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/catalog/list?types=ITEM`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Square-Version': '2023-10-18',
          },
        }
      )

      return response.objects?.map((item: any) => this.transformSquareMenuItem(item)) || []
    } catch (error) {
      console.error('Square menu items sync failed:', error)
      return []
    }
  }

  async syncStaffData(): Promise<POSStaffMember[]> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/team-members`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Square-Version': '2023-10-18',
        },
      })

      return response.team_members?.map((member: any) => this.transformSquareStaffMember(member)) || []
    } catch (error) {
      console.error('Square staff data sync failed:', error)
      return []
    }
  }

  getWebhookEndpoint(): string {
    return `/api/webhooks/square`
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const { type, data } = payload

      switch (type) {
        case 'order.created':
        case 'order.updated':
          await this.processOrderWebhook(data.object.order)
          break
        case 'catalog.version.updated':
          // Trigger menu sync
          await this.syncMenuItems()
          break
        default:
          console.log('Unhandled Square webhook type:', type)
      }
    } catch (error) {
      console.error('Square webhook processing failed:', error)
      throw error
    }
  }

  private transformSquareOrder(squareOrder: any): POSOrder {
    const baseAmount = parseInt(squareOrder.total_money?.amount || '0') / 100
    const taxAmount = parseInt(squareOrder.total_tax_money?.amount || '0') / 100
    const tipAmount = parseInt(squareOrder.total_tip_money?.amount || '0') / 100
    const discountAmount = parseInt(squareOrder.total_discount_money?.amount || '0') / 100

    return {
      id: squareOrder.id,
      orderNumber: squareOrder.order_number || squareOrder.id,
      totalAmount: baseAmount,
      taxAmount,
      tipAmount,
      discountAmount,
      paymentMethod: this.getPaymentMethod(squareOrder.tenders),
      orderStatus: squareOrder.state?.toLowerCase() || 'pending',
      orderType: this.getOrderType(squareOrder.fulfillments),
      customerId: squareOrder.customer_id,
      staffId: squareOrder.created_by,
      orderPlacedAt: squareOrder.created_at,
      orderCompletedAt: squareOrder.closed_at,
      items: squareOrder.line_items?.map((item: any) => ({
        id: item.uid,
        itemName: item.name,
        category: item.catalog_object?.category_data?.name || 'Uncategorized',
        quantity: parseInt(item.quantity),
        unitPrice: parseInt(item.base_price_money?.amount || '0') / 100,
        totalPrice: parseInt(item.total_money?.amount || '0') / 100,
        modifiers: item.modifiers,
      })) || [],
    }
  }

  private transformSquareMenuItem(squareItem: any): POSMenuItem {
    const itemData = squareItem.item_data
    const variation = itemData.variations?.[0]

    return {
      id: squareItem.id,
      name: itemData.name,
      category: itemData.category?.name || 'Uncategorized',
      price: parseInt(variation?.item_variation_data?.price_money?.amount || '0') / 100,
      isActive: !squareItem.is_deleted,
    }
  }

  private transformSquareStaffMember(squareMember: any): POSStaffMember {
    return {
      id: squareMember.id,
      name: `${squareMember.given_name || ''} ${squareMember.family_name || ''}`.trim(),
      role: squareMember.assigned_locations?.[0]?.role || 'staff',
      hourlyRate: squareMember.wage?.hourly_rate ? parseInt(squareMember.wage.hourly_rate.amount) / 100 : undefined,
    }
  }

  private getPaymentMethod(tenders: any[]): string {
    if (!tenders || tenders.length === 0) return 'unknown'
    const tender = tenders[0]
    return tender.type?.toLowerCase() || 'unknown'
  }

  private getOrderType(fulfillments: any[]): 'dine-in' | 'takeout' | 'delivery' {
    if (!fulfillments || fulfillments.length === 0) return 'dine-in'
    const fulfillment = fulfillments[0]
    
    switch (fulfillment.type) {
      case 'PICKUP':
        return 'takeout'
      case 'DELIVERY':
        return 'delivery'
      default:
        return 'dine-in'
    }
  }

  private async processOrderWebhook(order: any): Promise<void> {
    // Transform and store the order in database
    const transformedOrder = this.transformSquareOrder(order)
    // This would typically call a service to store the order
    console.log('Processing Square order webhook:', transformedOrder.id)
  }
}
