-- Supabase Migration: Create products table for Square POS integration
-- Run this in Supabase SQL Editor or via migration

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    abbreviation TEXT,
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('FIXED_PRICING', 'VARIABLE_PRICING')),
    price_amount DECIMAL(10, 2), -- Price in dollars (e.g., 4.00 for $4.00)
    currency TEXT DEFAULT 'USD',
    square_id TEXT UNIQUE, -- Store Square item ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_square_id ON public.products(square_id);
CREATE INDEX IF NOT EXISTS idx_products_pricing_type ON public.products(pricing_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE public.products IS 'Products table with Square POS integration';
COMMENT ON COLUMN public.products.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN public.products.name IS 'Product name, required';
COMMENT ON COLUMN public.products.description IS 'Product description, optional';
COMMENT ON COLUMN public.products.abbreviation IS 'Short abbreviation for POS display';
COMMENT ON COLUMN public.products.pricing_type IS 'Pricing type: FIXED_PRICING or VARIABLE_PRICING';
COMMENT ON COLUMN public.products.price_amount IS 'Price in dollars (decimal format)';
COMMENT ON COLUMN public.products.currency IS 'Currency code, defaults to USD';
COMMENT ON COLUMN public.products.square_id IS 'Square POS item ID, unique when present';
COMMENT ON COLUMN public.products.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.products.updated_at IS 'Record last update timestamp';
