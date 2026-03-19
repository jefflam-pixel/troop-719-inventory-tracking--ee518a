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