import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { POSIntegrationFactory } from "@/lib/pos-integrations/factory";
import { inventoryManager } from "@/lib/inventory-management";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
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

    console.log("Location ID Extract");

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

    console.log("Processing completed orders for inventory management");
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
    // const posIntegration = POSIntegrationFactory.create(
    //   "square",
    //   locationId,
    //   posIntegration.credentials
    // );

    // await posIntegration.handleWebhook(payload);

    return NextResponse.json({
      message: "Webhook processed successfully",
      type: type,
      orderId: data?.object?.order_updated?.order_id || null,
    });
  } catch (error) {
    console.error("❌ Square webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
