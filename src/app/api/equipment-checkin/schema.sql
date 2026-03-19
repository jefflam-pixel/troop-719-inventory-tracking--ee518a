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