# Square Webhook Inventory Management

This document describes the implementation of the Square webhook endpoint for inventory management in SavorSync.

## Overview

The system automatically updates ingredient inventory levels when orders are completed in Square. This is achieved through:

1. A webhook endpoint that receives Square order update events
2. Verification of webhook signatures for security
3. Processing of completed orders to update inventory
4. Logging of inventory changes for audit purposes

## Components

### 1. Webhook Endpoint

Located at `/api/webhooks/square/route.ts`, this Next.js API route:
- Receives webhook events from Square
- Verifies the webhook signature using HMAC-SHA256
- Extracts the location ID and order information
- Delegates to the appropriate handler based on event type

### 2. Inventory Management Service

Located at `/lib/inventory-management.ts`, this service:
- Fetches complete order details from Square API
- Retrieves product and ingredient data from Supabase
- Calculates ingredient quantities used based on order quantities
- Updates inventory levels in the database
- Returns detailed results of the inventory update

### 3. Database Schema

The system uses the following tables:
- `products`: Stores product information including ingredients JSON
- `ingredients`: Tracks inventory levels with fields like `current_stock` and `reorder_point`
- `inventory_logs`: Records inventory changes for audit purposes

## Workflow

1. Square sends a webhook when an order status changes
2. The webhook endpoint verifies the signature and processes the event
3. For `order.updated` events with state `COMPLETED`:
   - The system fetches the full order details from Square
   - For each line item, it retrieves the corresponding product from Supabase
   - It calculates the ingredient quantities used based on the order quantity
   - It updates the `current_stock` for each ingredient
   - It logs the inventory changes to the `inventory_logs` table

## Security

- Webhook signatures are verified using HMAC-SHA256
- Supabase Row Level Security (RLS) protects database access
- Service role keys are used for backend operations

## Testing

Several test scripts are provided:
- `scripts/test-webhook.js`: Tests the webhook endpoint with mock data
- `scripts/mock-order-data.js`: Provides sample order data for testing
- `scripts/test-inventory-management.js`: Directly tests the inventory management logic

## Configuration

Required environment variables:
- `SQUARE_WEBHOOK_SECRET`: Secret for verifying webhook signatures
- `SQUARE_ACCESS_TOKEN`: For Square API access
- `SQUARE_LOCATION_ID`: Default Square location ID
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: For authenticated Supabase access

## Error Handling

The system includes comprehensive error handling:
- Webhook signature verification failures return 401 Unauthorized
- Missing location IDs return 400 Bad Request
- Missing integrations return 404 Not Found
- Processing errors are logged and return 500 Internal Server Error

## Logging

- Console logs provide detailed information about webhook processing
- Inventory updates are logged to the database in the `inventory_logs` table
- Error details are captured for troubleshooting

## Future Enhancements

Potential improvements to consider:
1. Unit conversion for ingredients with different measurement units
2. Notifications when ingredients fall below reorder points
3. Automatic reordering of low-stock ingredients
4. Dashboard visualization of inventory changes over time
5. Support for additional POS systems beyond Square
