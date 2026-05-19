-- Migration: 001_create_universities_table.sql
-- Description: Create universities reference table for campus data

CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_domain VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_universities_code ON universities(code);

-- Insert initial university data
INSERT INTO universities (code, name, email_domain) VALUES
  ('MAK', 'Makerere University', 'students.mak.ac.ug'),
  ('KYU', 'Kyambogo University', 'students.kyu.ac.ug'),
  ('KAB', 'Kabale University', 'students.kab.ac.ug'),
  ('MMU', 'Mountains of the Moon', 'students.mmu.ac.ug'),
  ('MUST', 'Mbarara University of Science and Technology', 'students.must.ac.ug'),
  ('BU', 'Busitema University', 'students.bu.ac.ug')
ON CONFLICT (code) DO NOTHING;

-- Add comment
COMMENT ON TABLE universities IS 'Reference table for supported universities and their email domains';
COMMENT ON COLUMN universities.code IS 'University abbreviation (e.g., MAK, MUST)';
COMMENT ON COLUMN universities.email_domain IS 'Email domain for student verification (e.g., students.mak.ac.ug)';