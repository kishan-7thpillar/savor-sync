import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { POSIntegrationFactory } from "@/lib/pos-integrations/factory";
import { inventoryManager } from "@/lib/inventory-management";
import crypto from "crypto";

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log("OPTIONS request received at /webhooks/square");
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-square-signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log("Square webhook received at /webhooks/square");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);
  console.log("Request headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  try {
    const body = await request.text();
    console.log("Request body:", body.substring(0, 1000) + (body.length > 1000 ? '...(truncated)' : ''));
    const signature = request.headers.get("x-square-signature");

    if (!signature) {
      console.log("⚠️ Missing Square signature in webhook request");
      const errorResponse = NextResponse.json({ error: "Missing signature" }, { status: 400 });
      
      // Add CORS headers even to error responses
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-square-signature');
      
      return errorResponse;
    }

    // Verify webhook signature (in production, use proper webhook secret)
    const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("base64");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(body);
    const { type, data, merchant_id } = payload;
    console.log(
      `📥 Square webhook received: ${type}`,
      JSON.stringify(payload, null, 2)
    );

    // Extract location ID from the webhook data
    const locationId =
      data?.object?.order_updated?.location_id ||
      data?.object?.location_id ||
      data?.location_id;

    if (!locationId) {
      return NextResponse.json(
        { error: "No location ID in webhook" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get POS integration for this location
    const { data: integration, error: integrationError } = await supabase
      .from("pos_integrations")
      .select("*")
      .eq("location_id", locationId)
      .eq("pos_system", "square")
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: "No Square integration found for location" },
        { status: 404 }
      );
    }

    // Process completed orders for inventory management
    if (
      type === "order.updated" &&
      data?.object?.order_updated?.state === "COMPLETED"
    ) {
      console.log("🔔 Processing completed order for inventory management");
      const orderId = data.object.order_updated.order_id;

      // Update inventory based on order contents
      const inventoryResult = await inventoryManager.processCompletedOrder(
        orderId,
        locationId
      );

      console.log(`🧾 Inventory update result: ${inventoryResult.message}`);

      // Log inventory updates to database for audit trail
      if (inventoryResult.success && inventoryResult.updatedIngredients) {
        await supabase.from("inventory_logs").insert({
          order_id: orderId,
          location_id: locationId,
          updates: inventoryResult.updatedIngredients,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Create integration instance and handle webhook for other processing
    const posIntegration = POSIntegrationFactory.create(
      "square",
      locationId,
      integration.credentials
    );

    await posIntegration.handleWebhook(payload);

    const response = NextResponse.json({
      message: "Webhook processed successfully",
      type: type,
      orderId: data?.object?.order_updated?.order_id || null,
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-square-signature');
    
    return response;
  } catch (error) {
    console.error("❌ Square webhook error:", error);
    const errorResponse = NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    
    // Add CORS headers to error response
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-square-signature');
    
    return errorResponse;
  }
}
