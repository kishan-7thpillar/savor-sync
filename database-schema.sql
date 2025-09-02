-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE order_type AS ENUM ('dine-in', 'takeout', 'delivery');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'digital_wallet', 'other');
CREATE TYPE sync_status AS ENUM ('success', 'error', 'syncing', 'pending');
CREATE TYPE complaint_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE wastage_reason AS ENUM ('spoilage', 'over_prep', 'mistake', 'theft', 'other');

-- Organizations table (Multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (Users with organization relationship)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (Restaurant branches)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    cuisine_type TEXT,
    pos_system TEXT,
    pos_config JSONB,
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POS Integrations table
CREATE TABLE pos_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    pos_system TEXT NOT NULL,
    credentials JSONB NOT NULL, -- Encrypted credentials
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu Items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    pos_item_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    pos_order_id TEXT,
    order_number TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_method payment_method DEFAULT 'cash',
    order_status order_status DEFAULT 'pending',
    order_type order_type DEFAULT 'dine-in',
    customer_id TEXT,
    staff_id TEXT,
    order_placed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_completed_at TIMESTAMP WITH TIME ZONE,
    prep_time_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    pos_item_id TEXT,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    modifiers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Sales table (Performance optimization)
CREATE TABLE daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    sales_date DATE NOT NULL,
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, sales_date)
);

-- Order Inaccuracies table
CREATE TABLE order_inaccuracies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    inaccuracy_type TEXT NOT NULL,
    description TEXT,
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Complaints table
CREATE TABLE customer_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    complaint_type TEXT NOT NULL,
    severity complaint_severity DEFAULT 'medium',
    description TEXT NOT NULL,
    customer_contact TEXT,
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Satisfaction table
CREATE TABLE customer_satisfaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comments TEXT,
    survey_method TEXT DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table (Organization-wide)
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    reorder_point DECIMAL(10,3) NOT NULL DEFAULT 0,
    max_stock DECIMAL(10,3),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    supplier_name TEXT,
    supplier_contact TEXT,
    expiration_date DATE,
    storage_requirements TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredient Purchases table
CREATE TABLE ingredient_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Shifts table
CREATE TABLE staff_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    pos_staff_id TEXT,
    role TEXT NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL,
    shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_end TIMESTAMP WITH TIME ZONE,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    total_pay DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    expense_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Counts table
CREATE TABLE inventory_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    current_stock DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    count_date DATE NOT NULL,
    counted_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wastage Records table
CREATE TABLE wastage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_wasted DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    wastage_reason wastage_reason DEFAULT 'other',
    cost_impact DECIMAL(10,2) DEFAULT 0,
    recorded_date DATE NOT NULL,
    recorded_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Predictions table
CREATE TABLE sales_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_sales DECIMAL(10,2) NOT NULL,
    predicted_orders INTEGER NOT NULL,
    confidence_score DECIMAL(5,4) DEFAULT 0,
    actual_sales DECIMAL(10,2),
    actual_orders INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, prediction_date)
);

-- Inventory Predictions table
CREATE TABLE inventory_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_usage DECIMAL(10,3) NOT NULL,
    recommended_order DECIMAL(10,3) DEFAULT 0,
    current_stock DECIMAL(10,3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, ingredient_id, prediction_date)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_orders_location ON orders(location_id);
CREATE INDEX idx_orders_date ON orders(order_placed_at);
CREATE INDEX idx_daily_sales_location_date ON daily_sales(location_id, sales_date);
CREATE INDEX idx_menu_items_location ON menu_items(location_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_ingredients_organization ON ingredients(organization_id);
CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);
CREATE INDEX idx_staff_shifts_location ON staff_shifts(location_id);
CREATE INDEX idx_inventory_counts_location ON inventory_counts(location_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_inaccuracies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wastage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Profiles: Users can view profiles in their organization
CREATE POLICY "Users can view profiles in organization" ON profiles
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Locations: Users can view locations in their organization
CREATE POLICY "Users can view locations in organization" ON locations
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Orders: Users can view orders from their organization's locations
CREATE POLICY "Users can view orders in organization" ON orders
    FOR SELECT USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON l.organization_id = p.organization_id
        WHERE p.id = auth.uid()
    ));

-- Similar policies for other tables...
CREATE POLICY "Users can view menu items in organization" ON menu_items
    FOR SELECT USING (location_id IN (
        SELECT l.id FROM locations l
        JOIN profiles p ON l.organization_id = p.organization_id
        WHERE p.id = auth.uid()
    ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate daily sales
CREATE OR REPLACE FUNCTION calculate_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_sales (location_id, sales_date, total_sales, total_orders, avg_order_value, total_customers)
    VALUES (
        NEW.location_id,
        DATE(NEW.order_placed_at),
        NEW.total_amount,
        1,
        NEW.total_amount,
        1
    )
    ON CONFLICT (location_id, sales_date)
    DO UPDATE SET
        total_sales = daily_sales.total_sales + NEW.total_amount,
        total_orders = daily_sales.total_orders + 1,
        avg_order_value = (daily_sales.total_sales + NEW.total_amount) / (daily_sales.total_orders + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for daily sales calculation
CREATE TRIGGER calculate_daily_sales_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_sales();
