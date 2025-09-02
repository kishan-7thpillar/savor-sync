-- Staff Management System Schema

-- Staff master table
CREATE TABLE staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    employee_id VARCHAR(50) UNIQUE, -- Custom employee ID/number
    user_id UUID REFERENCES auth.users(id), -- Optional: if staff member has app access
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
    position VARCHAR(100) NOT NULL, -- Manager, Cook, Server, Cashier, etc.
    department VARCHAR(50), -- Kitchen, Front of House, Management
    hourly_rate DECIMAL(8,2) DEFAULT 0,
    salary_annual DECIMAL(10,2), -- For salaried employees
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff location assignments (many-to-many relationship)
CREATE TABLE staff_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    is_primary_location BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(staff_id, location_id, start_date)
);

-- Staff roles and permissions
CREATE TABLE staff_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL, -- Manager, Supervisor, Staff, etc.
    permissions JSONB, -- Store specific permissions
    location_id UUID REFERENCES locations(id), -- Role specific to location
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing staff_shifts table to reference new staff table
ALTER TABLE staff_shifts 
ADD COLUMN staff_table_id UUID REFERENCES staff(id),
ADD COLUMN shift_notes TEXT;

-- Create indexes for performance
CREATE INDEX idx_staff_organization ON staff(organization_id);
CREATE INDEX idx_staff_status ON staff(employment_status);
CREATE INDEX idx_staff_locations_staff ON staff_locations(staff_id);
CREATE INDEX idx_staff_locations_location ON staff_locations(location_id);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_timestamp
BEFORE UPDATE ON staff
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
