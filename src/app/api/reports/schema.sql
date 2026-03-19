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