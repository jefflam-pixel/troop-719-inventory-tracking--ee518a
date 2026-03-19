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