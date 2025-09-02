"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const Endpoint = ({
    method,
    path,
    description,
    requestBody,
    responseBody,
    authRequired = true,
  }: {
    method: string;
    path: string;
    description: string;
    requestBody?: string;
    responseBody: string;
    authRequired?: boolean;
  }) => {
    const methodColors: Record<string, string> = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800",
    };

    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                  methodColors[method] || "bg-gray-100"
                }`}
              >
                {method}
              </span>
              <CardTitle className="text-lg font-mono">{path}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(`${window.location.origin}/api${path}`, path)}
              className="h-8 px-2"
            >
              {copiedEndpoint === path ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <CardDescription>{description}</CardDescription>
          {authRequired && (
            <div className="mt-2 text-xs text-amber-600 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
              Requires authentication
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="response" className="w-full">
            <TabsList className="mb-2">
              {requestBody && <TabsTrigger value="request">Request</TabsTrigger>}
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            {requestBody && (
              <TabsContent value="request">
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{requestBody}</code>
                </pre>
              </TabsContent>
            )}
            <TabsContent value="response">
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                <code>{responseBody}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">SavorSync API Documentation</h1>
        <p className="text-gray-500">
          Comprehensive documentation for integrating with the SavorSync API.
        </p>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="pos">POS Integration</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="auth">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <p className="mb-6">
            SavorSync uses JWT tokens for authentication. Include the token in the
            Authorization header as a Bearer token for all authenticated requests.
          </p>

          <Endpoint
            method="POST"
            path="/auth/login"
            description="Authenticate a user and receive an access token"
            requestBody={`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
            responseBody={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "manager"
  }
}`}
            authRequired={false}
          />

          <Endpoint
            method="POST"
            path="/auth/register"
            description="Register a new user account"
            requestBody={`{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "organization_name": "My Restaurant"
}`}
            responseBody={`{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newuser@example.com"
  },
  "organization": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "My Restaurant"
  }
}`}
            authRequired={false}
          />

          <Endpoint
            method="POST"
            path="/auth/refresh"
            description="Refresh an expired access token"
            requestBody={`{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            responseBody={`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            authRequired={false}
          />
        </TabsContent>

        <TabsContent value="locations">
          <h2 className="text-xl font-semibold mb-4">Locations</h2>
          <p className="mb-6">
            Manage restaurant locations within your organization.
          </p>

          <Endpoint
            method="GET"
            path="/locations"
            description="Get all locations for the authenticated user's organization"
            responseBody={`{
  "locations": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Downtown Location",
      "address": "123 Main St, City, State 12345",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2023-01-15T00:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Uptown Location",
      "address": "456 Oak St, City, State 12345",
      "phone": "+1234567891",
      "is_active": true,
      "created_at": "2023-03-20T00:00:00Z"
    }
  ]
}`}
          />

          <Endpoint
            method="POST"
            path="/locations"
            description="Create a new location"
            requestBody={`{
  "name": "New Location",
  "address": "789 Pine St, City, State 12345",
  "phone": "+1234567892",
  "is_active": true
}`}
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "New Location",
  "address": "789 Pine St, City, State 12345",
  "phone": "+1234567892",
  "is_active": true,
  "created_at": "2023-08-25T00:00:00Z"
}`}
          />

          <Endpoint
            method="GET"
            path="/locations/:id"
            description="Get details for a specific location"
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Downtown Location",
  "address": "123 Main St, City, State 12345",
  "phone": "+1234567890",
  "is_active": true,
  "created_at": "2023-01-15T00:00:00Z",
  "metrics": {
    "daily_sales": 4500,
    "monthly_sales": 135000,
    "inventory_value": 25000,
    "staff_count": 12
  }
}`}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
          <p className="mb-6">
            Track and manage inventory across all locations.
          </p>

          <Endpoint
            method="GET"
            path="/inventory"
            description="Get inventory items across all locations or filtered by location"
            responseBody={`{
  "inventory": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Flour",
      "category": "Dry Goods",
      "unit": "kg",
      "quantity": 50.5,
      "cost_per_unit": 1.25,
      "location_id": "123e4567-e89b-12d3-a456-426614174000",
      "last_updated": "2023-08-20T00:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Chicken Breast",
      "category": "Meat",
      "unit": "kg",
      "quantity": 25.2,
      "cost_per_unit": 8.50,
      "location_id": "123e4567-e89b-12d3-a456-426614174000",
      "last_updated": "2023-08-22T00:00:00Z"
    }
  ]
}`}
          />

          <Endpoint
            method="POST"
            path="/inventory"
            description="Add a new inventory item"
            requestBody={`{
  "name": "Sugar",
  "category": "Dry Goods",
  "unit": "kg",
  "quantity": 30.0,
  "cost_per_unit": 2.00,
  "location_id": "123e4567-e89b-12d3-a456-426614174000"
}`}
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Sugar",
  "category": "Dry Goods",
  "unit": "kg",
  "quantity": 30.0,
  "cost_per_unit": 2.00,
  "location_id": "123e4567-e89b-12d3-a456-426614174000",
  "last_updated": "2023-08-25T00:00:00Z"
}`}
          />

          <Endpoint
            method="PUT"
            path="/inventory/:id"
            description="Update an inventory item"
            requestBody={`{
  "quantity": 45.0,
  "cost_per_unit": 2.15
}`}
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Sugar",
  "category": "Dry Goods",
  "unit": "kg",
  "quantity": 45.0,
  "cost_per_unit": 2.15,
  "location_id": "123e4567-e89b-12d3-a456-426614174000",
  "last_updated": "2023-08-25T00:00:00Z"
}`}
          />
        </TabsContent>

        <TabsContent value="sales">
          <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
          <p className="mb-6">
            Access sales data and analytics for your restaurants.
          </p>

          <Endpoint
            method="GET"
            path="/sales/analytics"
            description="Get sales analytics with optional date range and location filters"
            responseBody={`{
  "total_sales": 45250.75,
  "average_order_value": 32.50,
  "transaction_count": 1392,
  "period": "2023-08-01 to 2023-08-25",
  "by_day": [
    {
      "date": "2023-08-01",
      "sales": 1520.25,
      "transactions": 48
    },
    {
      "date": "2023-08-02",
      "sales": 1645.50,
      "transactions": 52
    }
  ],
  "by_category": [
    {
      "category": "Entrees",
      "sales": 22625.50,
      "percentage": 50.0
    },
    {
      "category": "Appetizers",
      "sales": 9050.25,
      "percentage": 20.0
    },
    {
      "category": "Beverages",
      "sales": 13575.00,
      "percentage": 30.0
    }
  ]
}`}
          />

          <Endpoint
            method="GET"
            path="/sales/reports/daily"
            description="Get detailed daily sales report"
            responseBody={`{
  "date": "2023-08-25",
  "total_sales": 1825.75,
  "transaction_count": 58,
  "average_order_value": 31.48,
  "peak_hour": {
    "hour": 18,
    "sales": 425.50,
    "transactions": 14
  },
  "sales_by_hour": [
    {
      "hour": 11,
      "sales": 225.25,
      "transactions": 7
    },
    {
      "hour": 12,
      "sales": 350.50,
      "transactions": 11
    }
  ],
  "top_items": [
    {
      "name": "Chicken Parmesan",
      "quantity": 24,
      "revenue": 359.76
    },
    {
      "name": "House Salad",
      "quantity": 18,
      "revenue": 179.82
    }
  ]
}`}
          />

          <Endpoint
            method="GET"
            path="/sales/reports/monthly"
            description="Get monthly sales summary and trends"
            responseBody={`{
  "month": "2023-08",
  "total_sales": 45250.75,
  "previous_month_sales": 42150.25,
  "change_percentage": 7.36,
  "average_daily_sales": 1810.03,
  "highest_day": {
    "date": "2023-08-15",
    "sales": 2450.75
  },
  "lowest_day": {
    "date": "2023-08-08",
    "sales": 1250.25
  },
  "sales_by_location": [
    {
      "location_name": "Downtown Location",
      "sales": 25350.50,
      "percentage": 56.0
    },
    {
      "location_name": "Uptown Location",
      "sales": 19900.25,
      "percentage": 44.0
    }
  ]
}`}
          />
        </TabsContent>

        <TabsContent value="recipes">
          <h2 className="text-xl font-semibold mb-4">Recipe Management</h2>
          <p className="mb-6">
            Create and manage recipes and track their costs.
          </p>

          <Endpoint
            method="GET"
            path="/recipes"
            description="Get all recipes for the organization"
            responseBody={`{
  "recipes": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Chicken Parmesan",
      "category": "Entrees",
      "serving_size": 1,
      "cost_per_serving": 4.75,
      "sale_price": 14.99,
      "profit_margin": 68.31,
      "created_at": "2023-06-15T00:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "House Salad",
      "category": "Appetizers",
      "serving_size": 1,
      "cost_per_serving": 2.25,
      "sale_price": 9.99,
      "profit_margin": 77.48,
      "created_at": "2023-06-20T00:00:00Z"
    }
  ]
}`}
          />

          <Endpoint
            method="POST"
            path="/recipes"
            description="Create a new recipe"
            requestBody={`{
  "name": "Spaghetti Carbonara",
  "category": "Entrees",
  "serving_size": 1,
  "sale_price": 12.99,
  "ingredients": [
    {
      "inventory_id": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 0.2
    },
    {
      "inventory_id": "123e4567-e89b-12d3-a456-426614174004",
      "quantity": 0.1
    }
  ],
  "instructions": "1. Boil pasta until al dente. 2. In a separate pan, cook pancetta..."
}`}
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "name": "Spaghetti Carbonara",
  "category": "Entrees",
  "serving_size": 1,
  "cost_per_serving": 3.50,
  "sale_price": 12.99,
  "profit_margin": 73.06,
  "created_at": "2023-08-25T00:00:00Z"
}`}
          />

          <Endpoint
            method="GET"
            path="/recipes/:id"
            description="Get detailed recipe information including ingredients"
            responseBody={`{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Chicken Parmesan",
  "category": "Entrees",
  "serving_size": 1,
  "cost_per_serving": 4.75,
  "sale_price": 14.99,
  "profit_margin": 68.31,
  "created_at": "2023-06-15T00:00:00Z",
  "ingredients": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174005",
      "name": "Chicken Breast",
      "quantity": 0.25,
      "unit": "kg",
      "cost": 2.13
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174006",
      "name": "Marinara Sauce",
      "quantity": 0.15,
      "unit": "L",
      "cost": 0.75
    }
  ],
  "instructions": "1. Pound chicken breasts to even thickness. 2. Dredge in flour..."
}`}
          />
        </TabsContent>

        <TabsContent value="pos">
          <h2 className="text-xl font-semibold mb-4">POS Integration</h2>
          <p className="mb-6">
            Integrate with various Point of Sale systems.
          </p>

          <Endpoint
            method="POST"
            path="/pos/connect"
            description="Connect to a POS system"
            requestBody={`{
  "pos_type": "toast",
  "location_id": "123e4567-e89b-12d3-a456-426614174000",
  "credentials": {
    "api_key": "YOUR_ENCRYPTED_API_KEY",
    "restaurant_id": "TOAST_RESTAURANT_ID"
  }
}`}
            responseBody={`{
  "connection_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "connected",
  "pos_type": "toast",
  "location_id": "123e4567-e89b-12d3-a456-426614174000",
  "connected_at": "2023-08-25T00:00:00Z"
}`}
          />

          <Endpoint
            method="GET"
            path="/pos/connections"
            description="List all POS connections"
            responseBody={`{
  "connections": [
    {
      "connection_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "connected",
      "pos_type": "toast",
      "location_id": "123e4567-e89b-12d3-a456-426614174000",
      "location_name": "Downtown Location",
      "connected_at": "2023-08-25T00:00:00Z",
      "last_sync": "2023-08-25T12:30:00Z"
    },
    {
      "connection_id": "123e4567-e89b-12d3-a456-426614174001",
      "status": "connected",
      "pos_type": "square",
      "location_id": "123e4567-e89b-12d3-a456-426614174001",
      "location_name": "Uptown Location",
      "connected_at": "2023-08-20T00:00:00Z",
      "last_sync": "2023-08-25T12:15:00Z"
    }
  ]
}`}
          />

          <Endpoint
            method="POST"
            path="/pos/sync"
            description="Manually trigger a sync with the POS system"
            requestBody={`{
  "connection_id": "123e4567-e89b-12d3-a456-426614174000",
  "sync_type": "full"
}`}
            responseBody={`{
  "sync_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "connection_id": "123e4567-e89b-12d3-a456-426614174000",
  "sync_type": "full",
  "started_at": "2023-08-25T12:45:00Z",
  "estimated_completion": "2023-08-25T12:50:00Z"
}`}
          />
        </TabsContent>

        <TabsContent value="health">
          <h2 className="text-xl font-semibold mb-4">Health Endpoints</h2>
          <p className="mb-6">
            Monitor the health and status of the SavorSync API.
          </p>

          <Endpoint
            method="GET"
            path="/health"
            description="Check the health status of the API and its dependencies"
            responseBody={`{
  "status": "healthy",
  "timestamp": "2023-08-25T12:45:00Z",
  "environment": "production",
  "database": {
    "status": "connected",
    "error": null
  },
  "performance": {
    "responseTime": "45ms",
    "memory": {
      "rss": "120 MB",
      "heapTotal": "80 MB",
      "heapUsed": "65 MB"
    }
  },
  "version": "1.0.0"
}`}
            authRequired={false}
          />

          <Endpoint
            method="GET"
            path="/health/database"
            description="Check detailed database connection status"
            responseBody={`{
  "status": "healthy",
  "connections": {
    "active": 5,
    "idle": 3,
    "max": 20
  },
  "latency": {
    "read": "3ms",
    "write": "5ms"
  },
  "tables": [
    {
      "name": "profiles",
      "rows": 250,
      "size": "2.5 MB"
    },
    {
      "name": "locations",
      "rows": 12,
      "size": "0.5 MB"
    }
  ]
}`}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Usage Guidelines</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All requests must include the <code>Authorization</code> header with a valid JWT token.</li>
          <li>Rate limits are set to 100 requests per minute per API key.</li>
          <li>All timestamps are returned in ISO 8601 format (UTC).</li>
          <li>For bulk operations, consider using the batch endpoints to minimize API calls.</li>
          <li>API versions are specified in the URL path (e.g., <code>/v1/locations</code>).</li>
        </ul>
      </div>
    </div>
  );
}
