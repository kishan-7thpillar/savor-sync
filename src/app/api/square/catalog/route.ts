import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/square/catalog - Create catalog object in Square
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🟡 Square Catalog API: Request received");

    const body = await request.json();
    console.log(
      "📋 Square Catalog API: Request body:",
      JSON.stringify(body, null, 2)
    );

    // Get environment variables
    const squareUrl = process.env.NEXT_PUBLIC_SQUARE_URL;
    const squareToken = process.env.SQUARE_ACCESS_TOKEN;

    if (!squareUrl || !squareToken) {
      console.error("❌ Square Catalog API: Missing environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "Square API configuration missing",
        },
        { status: 500 }
      );
    }

    // Generate idempotency key for Square API
    const idempotencyKey = uuidv4();

    // Prepare Square API request body with required structure
    const squareRequestBody = {
      idempotency_key: idempotencyKey,
      object: body.catalog_object || body.object || body,
    };

    console.log(
      "🔗 Square Catalog API: Calling Square API at:",
      `${squareUrl}/v2/catalog/object`
    );
    console.log("🔑 Square Catalog API: Idempotency key:", idempotencyKey);
    console.log(
      "📤 Square Catalog API: Final request body:",
      JSON.stringify(squareRequestBody, null, 2)
    );

    // Make the actual Square API call
    const squareResponse = await fetch(`${squareUrl}/v2/catalog/object`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${squareToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2025-08-20",
      },
      body: JSON.stringify(squareRequestBody),
    });

    console.log(
      "📡 Square Catalog API: Square response status:",
      squareResponse.status
    );

    const responseData = await squareResponse.json();
    console.log("📦 Square Catalog API: Square response data:", responseData);

    if (!squareResponse.ok) {
      console.error("❌ Square Catalog API: Square API error:", responseData);
      return NextResponse.json(
        {
          success: false,
          error:
            responseData.errors?.[0]?.detail ||
            `Square API error: ${squareResponse.status}`,
          squareError: responseData,
        },
        { status: squareResponse.status }
      );
    }

    console.log("✅ Square Catalog API: Success");
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Square Catalog API: Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
