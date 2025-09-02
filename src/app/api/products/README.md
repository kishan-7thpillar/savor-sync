# Product Management API

A complete REST API for managing products with Square POS integration.

## Overview

This API provides full CRUD operations for products and automatically synchronizes with Square POS when configured. It includes proper error handling, validation, pagination, and health monitoring.

## Environment Variables

```bash
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Square POS Integration
SQUARE_ACCESS_TOKEN=EAAAl4W2NSeUXRHo4AhPsep9jdnOfxSeQ95sAoejuSzwbdxUFyU2Ye2npf8Pv7Cy
SQUARE_LOCATION_ID=LF138PJKQSCHR

# Environment
NODE_ENV=development
```

## API Endpoints

### Health Check
```
GET /api/products/health
```

Tests database and Square API connectivity.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-08-31T10:20:57.000Z",
  "services": {
    "database": { "status": "healthy", "error": null },
    "square": { "status": "healthy", "error": null },
    "overall": "healthy"
  }
}
```

### List Products
```
GET /api/products
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string) - Search in name and description
- `pricing_type` (enum) - Filter by FIXED_PRICING or VARIABLE_PRICING
- `sort_by` (enum) - Sort by: name, created_at, updated_at, price_amount
- `sort_order` (enum) - asc or desc

**Example:**
```
GET /api/products?page=1&limit=10&search=pizza&pricing_type=FIXED_PRICING&sort_by=name&sort_order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Classic pizza with tomato and mozzarella",
        "abbreviation": "MP",
        "pricing_type": "FIXED_PRICING",
        "price_amount": 12.99,
        "currency": "USD",
        "square_id": "ITEM_12345",
        "created_at": "2025-08-31T10:00:00.000Z",
        "updated_at": "2025-08-31T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Get Single Product
```
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato and mozzarella",
    "abbreviation": "MP",
    "pricing_type": "FIXED_PRICING",
    "price_amount": 12.99,
    "currency": "USD",
    "square_id": "ITEM_12345",
    "created_at": "2025-08-31T10:00:00.000Z",
    "updated_at": "2025-08-31T10:00:00.000Z"
  }
}
```

### Create Product
```
POST /api/products
```

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "abbreviation": "MP",
  "pricing_type": "FIXED_PRICING",
  "price_amount": 12.99,
  "currency": "USD"
}
```

**Required Fields:**
- `name` (string, 1-255 chars)
- `pricing_type` (enum: FIXED_PRICING, VARIABLE_PRICING)

**Optional Fields:**
- `description` (string)
- `abbreviation` (string, max 10 chars)
- `price_amount` (number, >= 0)
- `currency` (string, 3 chars, default: USD)

**Response:** Same as Get Single Product (201 status)

### Update Product
```
PUT /api/products/:id
```

**Request Body:** Same as Create Product, but all fields are optional

**Response:** Same as Get Single Product

### Delete Product
```
DELETE /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Deleted product data
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (health check)

## Square POS Integration

When properly configured, the API automatically:

1. **Creates items in Square POS** when products are created
2. **Updates items in Square POS** when products are updated
3. **Deletes items from Square POS** when products are deleted
4. **Stores Square item IDs** in the database for reference
5. **Handles Square API errors gracefully** without breaking database operations

### Square API Features

- **Idempotency keys** - Prevents duplicate item creation
- **Rate limiting** - Automatic retry with exponential backoff
- **Error handling** - Graceful degradation when Square is unavailable
- **Transaction safety** - Rollback database changes if Square operations fail

### Square Item Format

Products are converted to Square's catalog format:

```json
{
  "idempotency_key": "uuid-v4-here",
  "object": {
    "id": "#ProductName",
    "type": "ITEM",
    "item_data": {
      "abbreviation": "MP",
      "description": "Classic pizza with tomato and mozzarella",
      "name": "Margherita Pizza",
      "variations": [
        {
          "id": "#ProductNameVariation1",
          "type": "ITEM_VARIATION",
          "item_variation_data": {
            "item_id": "#ProductName",
            "name": "Default",
            "pricing_type": "FIXED_PRICING",
            "price_money": {
              "amount": 1299,
              "currency": "USD"
            }
          }
        }
      ]
    }
  }
}
```

## Supabase Database Schema

The products table is created in your Supabase database with Row Level Security (RLS) enabled:

```sql
CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    abbreviation TEXT,
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('FIXED_PRICING', 'VARIABLE_PRICING')),
    price_amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    square_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install uuid @types/uuid
   ```

2. **Set up Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration script from `src/db/migrations/001_create_products_table.sql`

3. **Configure environment variables** in `.env`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SQUARE_ACCESS_TOKEN=EAAAl4W2NSeUXRHo4AhPsep9jdnOfxSeQ95sAoejuSzwbdxUFyU2Ye2npf8Pv7Cy
   SQUARE_LOCATION_ID=LF138PJKQSCHR
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/api/products/health
   ```

## Error Handling

The API includes comprehensive error handling:

- **Validation errors** - Zod schema validation with detailed messages
- **Database errors** - Connection issues, constraint violations
- **Square API errors** - Rate limiting, authentication, network issues
- **Not found errors** - Missing resources
- **Transaction safety** - Rollback on partial failures

## Logging

All operations are logged with appropriate levels:
- **Info** - Successful operations
- **Warn** - Square API failures (non-critical)
- **Error** - Database failures, validation errors

## Rate Limiting

Square API requests include:
- **Exponential backoff** for rate limit responses (429)
- **Linear backoff** for other errors
- **Maximum retry attempts** (3 by default)
- **Idempotency keys** to prevent duplicate operations
