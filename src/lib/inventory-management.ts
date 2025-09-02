import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface IngredientUpdate {
  ingredient_id: string;
  quantity: number;
  unit: string;
}

/**
 * Inventory Management Service
 * Handles updating ingredient inventory based on completed orders
 */
export class InventoryManagementService {
  /**
   * Process a completed order and update inventory
   * @param orderId Square order ID
   * @param locationId Square location ID
   */
  async processCompletedOrder(
    orderId: string,
    locationId: string
  ): Promise<{
    success: boolean;
    message: string;
    updatedIngredients?: IngredientUpdate[];
  }> {
    try {
      console.log(`🔄 Processing completed order: ${orderId}`);

      // 0. Check if this order has already been processed
      const { data: existingLog, error: logError } = await supabase
        .from("inventory_logs")
        .select("order_id")
        .eq("order_id", orderId)
        .single();

      if (existingLog && !logError) {
        console.log(`⚠️ Order ${orderId} has already been processed. Skipping inventory update.`);
        return {
          success: true,
          message: "Order already processed - skipping duplicate update",
          updatedIngredients: []
        };
      }

      // 1. Fetch order details from Square API
      const orderDetails = await this.fetchOrderFromSquare(orderId, locationId);
      if (!orderDetails) {
        return {
          success: false,
          message: "Failed to fetch order details from Square",
        };
      }

      console.log("Order details:", orderDetails);

      // 2. Extract line items from order
      const lineItems = orderDetails.line_items || [];
      if (lineItems.length === 0) {
        return { success: false, message: "No line items found in order" };
      }

      console.log(`📦 Found ${lineItems.length} items in order ${orderId}`);

      // 3. Process each line item and update inventory
      const updatedIngredients: IngredientUpdate[] = [];

      for (const item of lineItems) {
        const catalogObjectId = item.catalog_object_id;
        const quantity = parseInt(item.quantity);

        if (!catalogObjectId) continue;

        // Find corresponding product in our database
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, name, ingredients")
          .eq("square_id", catalogObjectId)
          .single();

        if (productError || !product) {
          console.warn(
            `⚠️ Product not found for Square item: ${catalogObjectId}`
          );
          continue;
        }

        // If product has ingredients, update inventory
        if (
          product.ingredients &&
          Array.isArray(product.ingredients) &&
          product.ingredients.length > 0
        ) {
          console.log(`🍲 Processing ingredients for product: ${product.name}`);

          // Update inventory for each ingredient
          for (const ingredient of product.ingredients) {
            const ingredientUpdate = await this.updateIngredientInventory(
              ingredient.ingredient_id,
              ingredient.quantity * quantity,
              ingredient.unit
            );

            if (ingredientUpdate) {
              updatedIngredients.push(ingredientUpdate);
            }
          }
        }
      }

      return {
        success: true,
        message: `Successfully updated inventory for ${updatedIngredients.length} ingredients`,
        updatedIngredients,
      };
    } catch (error) {
      console.error("❌ Error processing completed order:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Fetch order details from Square API
   * @param orderId Square order ID
   * @param locationId Square location ID
   */
  private async fetchOrderFromSquare(
    orderId: string,
    locationId: string
  ): Promise<any> {
    try {
      console.log("Fetching order from Square API");
      // Determine API URL based on environment
      const baseUrl = "https://connect.squareupsandbox.com/v2";

      // Fetch order from Square API
      const response = await fetch(`${baseUrl}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2023-10-18",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Square API error:", errorData);
        return null;
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error("❌ Error fetching order from Square:", error);
      return null;
    }
  }

  /**
   * Update inventory for a single ingredient
   * @param ingredientId Ingredient ID
   * @param quantityUsed Quantity used in the order
   * @param unit Unit of measurement
   */
  private async updateIngredientInventory(
    ingredientId: string,
    quantityUsed: number,
    unit: string
  ): Promise<IngredientUpdate | null> {
    try {
      // Get current ingredient data
      const { data: ingredient, error: ingredientError } = await supabase
        .from("ingredients")
        .select("id, name, current_stock, unit, reorder_point")
        .eq("id", ingredientId)
        .single();

      if (ingredientError || !ingredient) {
        console.warn(`⚠️ Ingredient not found: ${ingredientId}`);
        return null;
      }

      // Verify units match
      if (ingredient.unit.toLowerCase() !== unit.toLowerCase()) {
        console.warn(
          `⚠️ Unit mismatch for ingredient ${ingredient.name}: expected ${ingredient.unit}, got ${unit}`
        );
        // In a production system, you might want to add unit conversion logic here
      }

      // Calculate new stock level
      const newStock = Math.max(0, ingredient.current_stock - quantityUsed);

      // Update ingredient stock
      const { error: updateError } = await supabase
        .from("ingredients")
        .update({
          current_stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ingredientId);

      if (updateError) {
        console.error(
          `❌ Failed to update ingredient ${ingredient.name}:`,
          updateError
        );
        return null;
      }

      console.log(
        `✅ Updated inventory for ${ingredient.name}: ${ingredient.current_stock} -> ${newStock} ${ingredient.unit}`
      );

      // Check if stock is below reorder point and log warning
      if (newStock <= ingredient.reorder_point) {
        console.warn(
          `⚠️ Ingredient ${ingredient.name} is below reorder point (${newStock} ${ingredient.unit})`
        );
        // In a production system, you might want to trigger notifications or automatic reordering
      }

      return {
        ingredient_id: ingredientId,
        quantity: quantityUsed,
        unit: ingredient.unit,
      };
    } catch (error) {
      console.error("❌ Error updating ingredient inventory:", error);
      return null;
    }
  }
}

// Export singleton instance
export const inventoryManager = new InventoryManagementService();
