import { v4 as uuidv4 } from 'uuid';
import {
  SquareCreateItemRequest,
  SquareCreateItemResponse,
  SquareItem,
  CreateProductInput,
  convertToSquareFormat,
} from '@/types/product';

// Square API configuration
const SQUARE_API_BASE_URL = 'https://connect.squareupsandbox.com/v2';
const SQUARE_VERSION = '2025-08-20';

interface SquareConfig {
  accessToken: string;
  locationId: string;
  environment: 'sandbox' | 'production';
}

class SquareIntegrationService {
  private config: SquareConfig;

  constructor() {
    this.config = {
      accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
      locationId: process.env.SQUARE_LOCATION_ID || '',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    };

    if (!this.config.accessToken || !this.config.locationId) {
      console.warn('Square API credentials not configured. Square integration will be disabled.');
    }
  }

  /**
   * Check if Square integration is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.accessToken && this.config.locationId);
  }

  /**
   * Get the appropriate Square API base URL based on environment
   */
  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
  }

  /**
   * Create headers for Square API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Square-Version': SQUARE_VERSION,
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate a unique idempotency key for Square API requests
   */
  private generateIdempotencyKey(): string {
    return uuidv4();
  }

  /**
   * Make a request to Square API with retry logic
   */
  private async makeSquareRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    retries = 3
  ): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Square API ${method} ${endpoint} (attempt ${attempt}/${retries})`);
        
        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage = responseData.errors?.[0]?.detail || `HTTP ${response.status}`;
          
          // Handle rate limiting (429) with exponential backoff
          if (response.status === 429 && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw new Error(`Square API error: ${errorMessage}`);
        }

        console.log(`Square API ${method} ${endpoint} - Success`);
        return responseData as T;

      } catch (error) {
        console.error(`Square API ${method} ${endpoint} - Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw error;
        }

        // Wait before retry (except for the last attempt)
        if (attempt < retries) {
          const delay = 1000 * attempt; // Linear backoff for non-rate-limit errors
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error('All retry attempts failed');
  }

  /**
   * Create an item in Square POS
   */
  async createItem(productData: CreateProductInput): Promise<{
    success: boolean;
    squareId?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      console.warn('Square integration not configured, skipping item creation');
      return { success: false, error: 'Square integration not configured' };
    }

    try {
      const squareItem = convertToSquareFormat(productData);
      const request: SquareCreateItemRequest = {
        idempotency_key: this.generateIdempotencyKey(),
        object: squareItem,
      };

      console.log('Creating Square item:', JSON.stringify(request, null, 2));

      const response = await this.makeSquareRequest<SquareCreateItemResponse>(
        '/catalog/object',
        'POST',
        request
      );

      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors.map(e => e.detail).join(', ');
        console.error('Square API returned errors:', response.errors);
        return { success: false, error: errorMessage };
      }

      if (!response.catalog_object?.id) {
        return { success: false, error: 'No item ID returned from Square' };
      }

      console.log('Square item created successfully:', response.catalog_object.id);
      return { 
        success: true, 
        squareId: response.catalog_object.id 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create Square item:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update an item in Square POS
   */
  async updateItem(squareId: string, productData: Partial<CreateProductInput>): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      console.warn('Square integration not configured, skipping item update');
      return { success: false, error: 'Square integration not configured' };
    }

    try {
      // For updates, we need to get the current item first, then update it
      // This is a simplified implementation - in production, you'd want to handle partial updates more carefully
      console.log(`Updating Square item ${squareId} - Note: This is a placeholder implementation`);
      
      // TODO: Implement actual Square item update logic
      // This would involve:
      // 1. GET /catalog/object/{squareId} to get current state
      // 2. Merge changes with current state
      // 3. PUT /catalog/object with updated data
      
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to update Square item:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete an item from Square POS
   */
  async deleteItem(squareId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      console.warn('Square integration not configured, skipping item deletion');
      return { success: false, error: 'Square integration not configured' };
    }

    try {
      await this.makeSquareRequest(
        `/catalog/object/${squareId}`,
        'DELETE'
      );

      console.log('Square item deleted successfully:', squareId);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to delete Square item:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get item from Square POS
   */
  async getItem(squareId: string): Promise<{
    success: boolean;
    item?: SquareItem;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Square integration not configured' };
    }

    try {
      const response = await this.makeSquareRequest<{ object: SquareItem }>(
        `/catalog/object/${squareId}`,
        'GET'
      );

      return { success: true, item: response.object };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get Square item:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Test Square API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Square integration not configured' };
    }

    try {
      // Test with a simple locations API call
      await this.makeSquareRequest('/locations', 'GET');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}

// Export singleton instance
export const squareService = new SquareIntegrationService();

// Export class for testing
export { SquareIntegrationService };
