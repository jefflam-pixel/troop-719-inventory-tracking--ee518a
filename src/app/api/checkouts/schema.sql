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