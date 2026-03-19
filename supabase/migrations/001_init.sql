CREATE TABLE IF NOT EXISTS p_ee518a8e_checkouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scout_name varchar(255) NOT NULL,
  equipment_name varchar(255) NOT NULL,
  equipment_qr_code varchar(255) NOT NULL,
  checkout_date date NOT NULL,
  return_date date,
  status varchar(50) DEFAULT 'checked_out' CHECK (status IN ('checked_out', 'returned', 'overdue')),
  trip_name varchar(255) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_checkouts FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_checkouts_scout_name ON p_ee518a8e_checkouts(scout_name);
CREATE INDEX IF NOT EXISTS idx_checkouts_qr_code ON p_ee518a8e_checkouts(equipment_qr_code);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON p_ee518a8e_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_created_at ON p_ee518a8e_checkouts(created_at);

CREATE TABLE IF NOT EXISTS p_ee518a8e_equipment_checkin (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name text NOT NULL,
  scout_name text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Good', 'Bad', 'Missing/Lost')),
  notes text DEFAULT '',
  workflow_status text DEFAULT 'Pending' CHECK (workflow_status IN ('Pending', 'Complete', 'Requires Action')),
  checkout_date date NOT NULL,
  checkin_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_equipment_checkin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_equipment_checkin
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_p_ee518a8e_equipment_checkin_updated_at
    BEFORE UPDATE ON p_ee518a8e_equipment_checkin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS p_ee518a8e_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  bin_number integer NOT NULL CHECK (bin_number BETWEEN 1 AND 4),
  quantity_total integer NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'maintenance', 'retired')),
  qr_code text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_inventory FOR ALL USING (true) WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_type ON p_ee518a8e_inventory(type);
CREATE INDEX IF NOT EXISTS idx_inventory_bin ON p_ee518a8e_inventory(bin_number);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON p_ee518a8e_inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_qr_code ON p_ee518a8e_inventory(qr_code);

-- Add constraint to ensure available quantity doesn't exceed total quantity
ALTER TABLE p_ee518a8e_inventory ADD CONSTRAINT check_available_quantity CHECK (quantity_available <= quantity_total);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON p_ee518a8e_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS p_ee518a8e_chain_of_custody (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name varchar(255) NOT NULL,
  equipment_qr_code varchar(100) NOT NULL,
  scout_name varchar(255) NOT NULL,
  action_type varchar(50) NOT NULL DEFAULT 'checkout',
  status varchar(50) NOT NULL DEFAULT 'active',
  checkout_date date NOT NULL,
  return_date date,
  condition_at_checkout varchar(50) NOT NULL DEFAULT 'good',
  condition_at_return varchar(50),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_chain_of_custody ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_chain_of_custody FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chain_of_custody_equipment_qr ON p_ee518a8e_chain_of_custody(equipment_qr_code);
CREATE INDEX IF NOT EXISTS idx_chain_of_custody_scout_name ON p_ee518a8e_chain_of_custody(scout_name);
CREATE INDEX IF NOT EXISTS idx_chain_of_custody_status ON p_ee518a8e_chain_of_custody(status);
CREATE INDEX IF NOT EXISTS idx_chain_of_custody_checkout_date ON p_ee518a8e_chain_of_custody(checkout_date);

-- Inventory table for tracking equipment status
CREATE TABLE IF NOT EXISTS p_ee518a8e_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'available',
  location varchar(255) DEFAULT 'lockup',
  condition varchar(50) NOT NULL DEFAULT 'good',
  serial_number varchar(100),
  purchase_date date,
  cost decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Checkouts table for tracking equipment loans
CREATE TABLE IF NOT EXISTS p_ee518a8e_checkouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid REFERENCES p_ee518a8e_inventory(id) ON DELETE CASCADE,
  equipment_name varchar(255) NOT NULL,
  scout_name varchar(255) NOT NULL,
  checkout_date timestamptz NOT NULL DEFAULT now(),
  expected_return_date date,
  return_date timestamptz,
  status varchar(50) NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Condition reports table for equipment inspections
CREATE TABLE IF NOT EXISTS p_ee518a8e_condition_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id varchar(255) NOT NULL,
  equipment_name varchar(255) NOT NULL,
  condition varchar(50) NOT NULL,
  notes text,
  inspector varchar(255) NOT NULL,
  inspection_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE p_ee518a8e_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE p_ee518a8e_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE p_ee518a8e_condition_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for all access
CREATE POLICY "Allow all access" ON p_ee518a8e_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON p_ee518a8e_checkouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON p_ee518a8e_condition_reports FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for demo purposes
INSERT INTO p_ee518a8e_inventory (name, category, status, location, condition) VALUES
('Coleman 4-Person Tent', 'Tents', 'available', 'lockup', 'excellent'),
('MSR Pocket Rocket Stove', 'Cooking', 'checked_out', 'with_scout', 'good'),
('Osprey 65L Backpack', 'Backpacks', 'available', 'lockup', 'good'),
('Sleeping Bag - Winter', 'Sleep System', 'maintenance', 'repair_shop', 'poor'),
('First Aid Kit - Comprehensive', 'Safety', 'available', 'lockup', 'excellent');

INSERT INTO p_ee518a8e_checkouts (equipment_id, equipment_name, scout_name, checkout_date, expected_return_date, status) VALUES
((SELECT id FROM p_ee518a8e_inventory WHERE name = 'MSR Pocket Rocket Stove'), 'MSR Pocket Rocket Stove', 'Jake Thompson', '2024-01-15 10:00:00', '2024-01-20', 'overdue'),
((SELECT id FROM p_ee518a8e_inventory WHERE name = 'Coleman 4-Person Tent'), 'Coleman 4-Person Tent', 'Sarah Wilson', '2024-01-18 14:30:00', '2024-01-25', 'active');

INSERT INTO p_ee518a8e_condition_reports (equipment_id, equipment_name, condition, notes, inspector, inspection_date) VALUES
('TENT-001', 'Coleman 4-Person Tent', 'excellent', 'Recently cleaned and waterproofed. All zippers working smoothly.', 'Mike Rodriguez', '2024-01-10'),
('STOVE-003', 'MSR Pocket Rocket Stove', 'good', 'Minor scratches on body but functions perfectly. Ignition working well.', 'Lisa Chen', '2024-01-12'),
('BAG-007', 'Sleeping Bag - Winter', 'poor', 'Zipper is broken and insulation is clumping. Needs repair or replacement.', 'Tom Baker', '2024-01-14');

CREATE TABLE IF NOT EXISTS p_ee518a8e_access_control (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  role varchar(50) NOT NULL CHECK (role IN ('quartermaster', 'patrol_leader')),
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  phone varchar(20) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  troop_position varchar(100) NOT NULL,
  access_level varchar(20) NOT NULL DEFAULT 'standard' CHECK (access_level IN ('standard', 'admin')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_access_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_access_control FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_access_control_role ON p_ee518a8e_access_control(role);
CREATE INDEX IF NOT EXISTS idx_access_control_status ON p_ee518a8e_access_control(status);
CREATE INDEX IF NOT EXISTS idx_access_control_email ON p_ee518a8e_access_control(email);

CREATE TABLE IF NOT EXISTS p_ee518a8e_business_integration (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id text NOT NULL,
  requirement_title text NOT NULL,
  category text NOT NULL DEFAULT 'Business',
  priority text NOT NULL DEFAULT 'P2',
  status text NOT NULL DEFAULT 'Active',
  implementation_notes text NOT NULL,
  quartermaster_tool_feature text,
  cost_reduction_impact integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE p_ee518a8e_business_integration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON p_ee518a8e_business_integration FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for the requirements mentioned
INSERT INTO p_ee518a8e_business_integration (requirement_id, requirement_title, category, priority, status, implementation_notes, quartermaster_tool_feature, cost_reduction_impact) VALUES
('BUS-002', 'Reduce annual budget spent on replacing lost or neglected gear through better oversight', 'Business', 'P1', 'Active', 'Implement comprehensive tracking system with checkout/checkin workflows, condition reporting, and accountability measures to prevent gear loss and damage', 'Equipment Tracking Dashboard', 2500),
('BUS-004', 'Provide the Quartermaster with a professional-grade tool to fulfill their leadership requirements', 'Business', 'P1', 'Active', 'Develop intuitive web interface with mobile responsiveness, real-time inventory status, reporting capabilities, and streamlined workflows for equipment management', 'Quartermaster Dashboard', 0),
('INT-001', 'Must not require integration with existing Scout management systems', 'Integration', 'P2', 'Active', 'System will operate as standalone application with its own user management and data storage, eliminating dependency on external systems', 'Standalone Architecture', 0),
('INT-002', 'Must not require automated parent communication for damaged or lost gear', 'Integration', 'P2', 'Active', 'Manual notification processes will be used. System will generate reports and alerts for leadership to handle parent communication as needed', 'Manual Reporting Features', 0);