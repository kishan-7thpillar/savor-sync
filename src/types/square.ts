// Square API Types for Catalog Objects
export interface SquareMoney {
  amount: number;
  currency: string;
}

export interface SquareItemVariationData {
  item_id: string;
  name: string;
  ordinal: number;
  pricing_type: 'FIXED_PRICING' | 'VARIABLE_PRICING';
  price_money?: SquareMoney;
  stockable: boolean;
  track_inventory?: boolean;
  inventory_alert_type?: 'LOW_QUANTITY' | 'NONE';
  inventory_alert_threshold?: number;
  user_data?: string;
  service_duration?: number;
  available_for_booking?: boolean;
  item_option_values?: Array<{
    item_option_id: string;
    item_option_value_id: string;
  }>;
}

export interface SquareItemVariation {
  type: 'ITEM_VARIATION';
  id: string;
  updated_at: string;
  version: number;
  is_deleted: boolean;
  present_at_all_locations: boolean;
  item_variation_data: SquareItemVariationData;
}

export interface SquareItemData {
  name: string;
  description?: string;
  abbreviation?: string;
  label_color?: string;
  available_online?: boolean;
  available_for_pickup?: boolean;
  available_electronically?: boolean;
  category_id?: string;
  tax_ids?: string[];
  modifier_list_info?: Array<{
    modifier_list_id: string;
    modifier_overrides?: Array<{
      modifier_id: string;
      on_by_default?: boolean;
    }>;
    min_selected_modifiers?: number;
    max_selected_modifiers?: number;
    enabled?: boolean;
  }>;
  variations: SquareItemVariation[];
  product_type: 'REGULAR' | 'GIFT_CARD' | 'APPOINTMENTS_SERVICE' | 'FOOD_AND_BEV' | 'EVENT' | 'DIGITAL' | 'DONATION' | 'LEGACY_SQUARE_ONLINE_SERVICE' | 'LEGACY_SQUARE_ONLINE_MEMBERSHIP' | 'RESTAURANT_ITEM' | 'RETAIL_ITEM';
  skip_modifier_screen?: boolean;
  item_options?: Array<{
    item_option_id: string;
  }>;
  image_ids?: string[];
  sort_name?: string;
  description_html?: string;
  description_plaintext?: string;
}

export interface SquareCatalogObject {
  type: 'ITEM';
  id: string;
  updated_at: string;
  version: number;
  is_deleted: boolean;
  present_at_all_locations: boolean;
  item_data: SquareItemData;
}

export interface SquareIdMapping {
  client_object_id: string;
  object_id: string;
}

export interface SquareCatalogRequest {
  catalog_object: SquareCatalogObject;
  id_mappings: SquareIdMapping[];
}

// Local Product Types
export interface ProductVariation {
  id: string;
  name: string;
  pricing_type: 'FIXED_PRICING' | 'VARIABLE_PRICING';
  price?: number;
  currency?: string;
  stockable: boolean;
  track_inventory: boolean;
  inventory_alert_threshold?: number;
  ordinal: number;
}

// Recipe Types
export interface ProductIngredient {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  ingredients: ProductIngredient[];
  instructions?: string;
  prep_time?: number; // in minutes
  cook_time?: number; // in minutes
  servings?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  abbreviation?: string;
  category_id?: string;
  product_type: 'REGULAR' | 'GIFT_CARD' | 'APPOINTMENTS_SERVICE' | 'FOOD_AND_BEV' | 'EVENT' | 'DIGITAL' | 'DONATION' | 'LEGACY_SQUARE_ONLINE_SERVICE' | 'LEGACY_SQUARE_ONLINE_MEMBERSHIP' | 'RESTAURANT_ITEM' | 'RETAIL_ITEM';
  variations: ProductVariation[];
  image_urls?: string[];
  recipe?: Recipe;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

// Ingredient Types
export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: string;
  current_stock: number;
  unit: string;
  unit_cost: number;
  reorder_point: number;
  max_stock?: number;
  location_id: string;
  supplier_id?: string;
  supplier_name?: string;
  supplier_contact?: string;
  expiration_date?: string;
  storage_requirements?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  created_by: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface ProductFormData {
  name: string;
  description?: string;
  abbreviation?: string;
  category_id?: string;
  product_type: 'REGULAR' | 'GIFT_CARD' | 'APPOINTMENTS_SERVICE' | 'FOOD_AND_BEV' | 'EVENT' | 'DIGITAL' | 'DONATION' | 'LEGACY_SQUARE_ONLINE_SERVICE' | 'LEGACY_SQUARE_ONLINE_MEMBERSHIP' | 'RESTAURANT_ITEM' | 'RETAIL_ITEM';
  variations: Omit<ProductVariation, 'id'>[];
  ingredients: Omit<ProductIngredient, 'ingredient_name'>[];
  recipe_instructions?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
}

export interface IngredientFormData {
  name: string;
  description?: string;
  category: string;
  current_stock: number;
  unit: string;
  unit_cost: number;
  reorder_point: number;
  max_stock?: number;
  location_id: string;
  supplier_name?: string;
  supplier_contact?: string;
  expiration_date?: string;
  storage_requirements?: string;
}

// Square Team Member Types
export interface SquareWageSetting {
  team_member_id: string;
  job_assignments: Array<{
    job_title: string;
    pay_type: 'NONE' | 'HOURLY' | 'SALARY';
    hourly_rate?: SquareMoney;
    annual_rate?: SquareMoney;
    weekly_hours?: number;
    job_id: string;
  }>;
  is_overtime_exempt: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SquareAssignedLocations {
  assignment_type: 'ALL_CURRENT_AND_FUTURE_LOCATIONS' | 'EXPLICIT_LOCATIONS';
  location_ids?: string[];
}

export interface SquareTeamMember {
  id: string;
  reference_id?: string;
  is_owner: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  given_name: string;
  family_name: string;
  email_address?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  assigned_locations: SquareAssignedLocations;
  permission_set_id?: string;
  merchant_id: string;
  wage_setting?: SquareWageSetting;
}

export interface SquareTeamMembersResponse {
  team_members: SquareTeamMember[];
  cursor?: string;
}

export interface SquareTeamMemberSearchRequest {
  filter?: {
    location_ids?: string[];
    status?: 'ACTIVE' | 'INACTIVE';
    is_owner?: boolean;
  };
  query?: {
    filter?: {
      given_name?: string;
      family_name?: string;
      email_address?: string;
      phone_number?: string;
    };
  };
  limit?: number;
  cursor?: string;
}

// Processed Team Member Types
export interface ProcessedTeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  hourlyRate: number;
  payType: 'NONE' | 'HOURLY' | 'SALARY';
  status: 'ACTIVE' | 'INACTIVE';
  isOwner: boolean;
  assignedLocations: SquareAssignedLocations;
  createdAt: string;
  updatedAt: string;
  squareData: SquareTeamMember;
  shifts?: any[];
  shiftMetrics?: {
    totalShifts: number;
    totalHours: number;
    totalCost: number;
    totalTips: number;
    averageShiftLength: number;
  };
}
