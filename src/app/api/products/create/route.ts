import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ProductFormValues } from "@/components/forms/product-form";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateProductRequest extends ProductFormValues {
  square_id?: string;
  square_data?: any;
}

/**
 * POST /api/products/create - Create product in Supabase after Square creation
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🟢 Products Create API: Request received");

    const body: CreateProductRequest = await request.json();
    console.log(
      "📋 Products Create API: Request body:",
      JSON.stringify(body, null, 2)
    );

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!body.variations || body.variations.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one variation is required" },
        { status: 400 }
      );
    }

    // Prepare ingredients JSON if provided
    const ingredientsJson = body.ingredients && body.ingredients.length > 0 
      ? body.ingredients.map(ingredient => ({
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          notes: ingredient.notes || null
        }))
      : [];

    // Insert product into Supabase
    console.log("📊 Products Create API: Inserting product into Supabase...");

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: body.name,
        description: body.description || null,
        abbreviation: body.abbreviation || null,
        pricing_type: body.variations[0].pricing_type,
        price_amount: body.variations[0].price
          ? Math.round(body.variations[0].price * 100)
          : null,
        currency: body.variations[0].currency || "USD",
        square_id: body.square_id || null,
        ingredients: ingredientsJson,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productError) {
      console.error(
        "❌ Products Create API: Supabase product error:",
        productError
      );
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create product: ${productError.message}`,
          details: productError,
        },
        { status: 500 }
      );
    }

    console.log("✅ Products Create API: Product created:", product);

    // Insert variations if there are multiple
    if (body.variations.length > 1) {
      console.log("📊 Products Create API: Inserting variations...");

      const variationsToInsert = body.variations.map((variation, index) => ({
        product_id: product.id,
        name: variation.name,
        pricing_type: variation.pricing_type,
        price_amount: variation.price
          ? Math.round(variation.price * 100)
          : null,
        currency: variation.currency || "USD",
        stockable: variation.stockable,
        track_inventory: variation.track_inventory,
        inventory_alert_threshold: variation.inventory_alert_threshold || null,
        ordinal: variation.ordinal || index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: variationsError } = await supabase
        .from("product_variations")
        .insert(variationsToInsert);

      if (variationsError) {
        console.error(
          "❌ Products Create API: Supabase variations error:",
          variationsError
        );
        // Don't fail the whole operation, just log the error
        console.warn(
          "⚠️ Products Create API: Variations not inserted, but product created successfully"
        );
      } else {
        console.log("✅ Products Create API: Variations created");
      }
    }

    // Log ingredients stored in product
    if (body.ingredients && body.ingredients.length > 0) {
      console.log(`✅ Products Create API: ${body.ingredients.length} ingredients stored in product table`);
    }

    // Insert recipe if provided
    if (
      body.recipe_instructions ||
      body.prep_time ||
      body.cook_time ||
      body.servings
    ) {
      console.log("📊 Products Create API: Inserting recipe...");

      const { error: recipeError } = await supabase.from("recipes").insert({
        product_id: product.id,
        instructions: body.recipe_instructions || null,
        prep_time: body.prep_time || null,
        cook_time: body.cook_time || null,
        servings: body.servings || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (recipeError) {
        console.error(
          "❌ Products Create API: Supabase recipe error:",
          recipeError
        );
        // Don't fail the whole operation, just log the error
        console.warn(
          "⚠️ Products Create API: Recipe not inserted, but product created successfully"
        );
      } else {
        console.log("✅ Products Create API: Recipe created");
      }
    }

    console.log(
      "🎉 Products Create API: Product creation completed successfully"
    );

    return NextResponse.json({
      success: true,
      data: {
        product,
        message: "Product created successfully in database",
      },
    });
  } catch (error) {
    console.error("❌ Products Create API: Exception:", error);
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
