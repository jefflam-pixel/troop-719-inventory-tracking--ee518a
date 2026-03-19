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