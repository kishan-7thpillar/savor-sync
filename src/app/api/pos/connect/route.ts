import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  POSIntegrationFactory,
  POSSystem,
} from "@/lib/pos-integrations/factory";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { locationId, posSystem, credentials } = body;

    if (!locationId || !posSystem || !credentials) {
      return NextResponse.json(
        {
          error: "Missing required fields: locationId, posSystem, credentials",
        },
        { status: 400 }
      );
    }

    // Verify user has access to this location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("*, organizations!inner(id)")
      .eq("id", locationId)
      .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Verify user belongs to the same organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.organization_id !== location.organizations.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Test POS connection
    const integration = POSIntegrationFactory.create(
      posSystem as POSSystem,
      locationId,
      credentials
    );
    const isValid = await integration.validateConnection();

    if (!isValid) {
      return NextResponse.json(
        {
          error:
            "Failed to connect to POS system. Please check your credentials.",
        },
        { status: 400 }
      );
    }

    // Encrypt credentials (in production, use proper encryption)
    const encryptedCredentials = credentials; // TODO: Implement encryption

    // Store integration
    const { data: integration_data, error: integrationError } = await supabase
      .from("pos_integrations")
      .upsert({
        location_id: locationId,
        pos_system: posSystem,
        credentials: encryptedCredentials,
        sync_status: "success",
        last_sync: new Date().toISOString(),
      })
      .select()
      .single();

    if (integrationError) {
      return NextResponse.json(
        { error: "Failed to save integration" },
        { status: 500 }
      );
    }

    // Update location with POS system info
    await supabase
      .from("locations")
      .update({
        pos_system: posSystem,
        pos_config: { webhook_endpoint: integration.getWebhookEndpoint() },
      })
      .eq("id", locationId);

    return NextResponse.json({
      message: "POS integration connected successfully",
      integration: integration_data,
    });
  } catch (error) {
    console.error("POS connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
