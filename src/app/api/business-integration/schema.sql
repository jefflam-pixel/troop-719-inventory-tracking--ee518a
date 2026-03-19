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