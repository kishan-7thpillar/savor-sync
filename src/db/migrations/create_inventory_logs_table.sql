-- Migration: Create inventory_logs table for tracking inventory updates from completed orders

-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT,
    location_id TEXT NOT NULL,
    updates JSONB NOT NULL,
    type TEXT DEFAULT 'AUTO' CHECK (type IN ('AUTO', 'MANUAL')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_logs_order_id ON inventory_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_location_id ON inventory_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON inventory_logs(type);

-- Add comment for documentation
COMMENT ON TABLE inventory_logs IS 'Tracks inventory updates from completed orders and manual adjustments';
COMMENT ON COLUMN inventory_logs.updates IS 'JSON array of ingredient updates with ingredient_id, quantity, and unit';
COMMENT ON COLUMN inventory_logs.type IS 'Type of inventory update: AUTO (from orders) or MANUAL (user adjustments)';
COMMENT ON COLUMN inventory_logs.reason IS 'Reason for manual inventory adjustments (e.g., "Buns expired", "Damaged during delivery")';

-- Enable Row Level Security
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for inventory_logs
CREATE POLICY "Users can view inventory logs in their organization" ON inventory_logs
    FOR SELECT USING (location_id IN (
        SELECT l.id::TEXT FROM locations l
        JOIN profiles p ON l.organization_id = p.organization_id
        WHERE p.id = auth.uid()
    ));
