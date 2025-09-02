import {
  SquareCatalogRequest,
  Product,
  ProductVariation,
  SquareCatalogObject,
  SquareItemVariation,
} from "@/types/square";

/**
 * Converts a local Product to Square API format
 */
export function convertProductToSquareFormat(
  product: Product
): SquareCatalogRequest {
  const now = new Date().toISOString();
  const baseVersion = Date.now();

  // Convert variations to Square format
  const squareVariations: SquareItemVariation[] = product.variations.map(
    (variation, index) => ({
      type: "ITEM_VARIATION",
      id: `#${variation.name.replace(/\s+/g, "")}`,
      updated_at: now,
      version: baseVersion + index,
      is_deleted: false,
      present_at_all_locations: true,
      item_variation_data: {
        item_id: `#${product.name.replace(/\s+/g, "")}`,
        name: variation.name,
        ordinal: variation.ordinal,
        pricing_type: variation.pricing_type,
        ...(variation.pricing_type === "FIXED_PRICING" &&
          variation.price && {
            price_money: {
              amount: Math.round(variation.price * 100), // Convert to cents
              currency: variation.currency || "USD",
            },
          }),
        stockable: variation.stockable,
        track_inventory: variation.track_inventory,
        ...(variation.inventory_alert_threshold && {
          inventory_alert_type: "LOW_QUANTITY" as const,
          inventory_alert_threshold: variation.inventory_alert_threshold,
        }),
      },
    })
  );

  const catalogObject: SquareCatalogObject = {
    type: "ITEM",
    id: `#${product.name.replace(/\s+/g, "")}`,
    updated_at: now,
    version: baseVersion,
    is_deleted: false,
    present_at_all_locations: true,
    item_data: {
      name: product.name,
      ...(product.description && { description: product.description }),
      ...(product.abbreviation && { abbreviation: product.abbreviation }),
      ...(product.category_id && { category_id: product.category_id }),
      variations: squareVariations,
      product_type: product.product_type,
      ...(product.image_urls &&
        product.image_urls.length > 0 && {
          image_ids: product.image_urls.map(
            (_, index) => `IMG_${product.id}_${index}`
          ),
        }),
    },
  };

  // Generate ID mappings
  const idMappings = [
    {
      client_object_id: `#${product.name.replace(/\s+/g, "")}`,
      object_id: `#${product.name.replace(/\s+/g, "")}`,
    },
    ...product.variations.map((variation) => ({
      client_object_id: `#${variation.name.replace(/\s+/g, "")}`,
      object_id: `#${variation.name.replace(/\s+/g, "")}`,
    })),
  ];

  return {
    catalog_object: catalogObject,
    id_mappings: idMappings,
  };
}

/**
 * Validates Square API request format
 */
export function validateSquareRequest(request: SquareCatalogRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate catalog object
  if (!request.catalog_object) {
    errors.push("catalog_object is required");
  } else {
    const { catalog_object } = request;

    if (catalog_object.type !== "ITEM") {
      errors.push('catalog_object.type must be "ITEM"');
    }

    if (!catalog_object.item_data) {
      errors.push("catalog_object.item_data is required");
    } else {
      const { item_data } = catalog_object;

      if (!item_data.name || item_data.name.trim().length === 0) {
        errors.push("item_data.name is required");
      }

      if (!item_data.variations || item_data.variations.length === 0) {
        errors.push("item_data.variations must contain at least one variation");
      } else {
        item_data.variations.forEach((variation, index) => {
          if (variation.type !== "ITEM_VARIATION") {
            errors.push(`variation[${index}].type must be "ITEM_VARIATION"`);
          }

          if (!variation.item_variation_data.name) {
            errors.push(
              `variation[${index}].item_variation_data.name is required`
            );
          }

          if (
            !["FIXED_PRICING", "VARIABLE_PRICING"].includes(
              variation.item_variation_data.pricing_type
            )
          ) {
            errors.push(
              `variation[${index}].item_variation_data.pricing_type must be "FIXED_PRICING" or "VARIABLE_PRICING"`
            );
          }

          if (
            variation.item_variation_data.pricing_type === "FIXED_PRICING" &&
            !variation.item_variation_data.price_money
          ) {
            errors.push(
              `variation[${index}].item_variation_data.price_money is required for FIXED_PRICING`
            );
          }
        });
      }
    }
  }

  // Validate ID mappings
  if (!request.id_mappings || request.id_mappings.length === 0) {
    errors.push(
      "id_mappings is required and must contain at least one mapping"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a unique client object ID
 */
export function generateClientObjectId(name: string): string {
  return `#${name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20)}_${Date.now()}`;
}

/**
 * Mock Square API call (replace with actual API integration)
 */
export async function createSquareProduct(
  request: SquareCatalogRequest
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate the request
    const validation = validateSquareRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
      };
    }

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Call our backend API instead of Square directly (to avoid CORS issues)
    const response = await fetch("/api/square/catalog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
