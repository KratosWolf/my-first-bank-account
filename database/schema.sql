-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) UNIQUE NOT NULL,
  parent_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  pin VARCHAR(4) NOT NULL,
  avatar VARCHAR(10) NOT NULL DEFAULT '👶',
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_pin_per_family UNIQUE(family_id, pin)
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('earning', 'spending', 'transfer', 'interest', 'allowance')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  from_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  to_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0.00,
  category VARCHAR(100) NOT NULL,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_requests table
CREATE TABLE purchase_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  parent_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_transactions_child_id ON transactions(child_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_goals_child_id ON goals(child_id);
CREATE INDEX idx_purchase_requests_child_id ON purchase_requests(child_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Families can view own data" ON families
  FOR SELECT USING (parent_email = auth.jwt() ->> 'email');

CREATE POLICY "Families can insert own data" ON families
  FOR INSERT WITH CHECK (parent_email = auth.jwt() ->> 'email');

CREATE POLICY "Families can update own data" ON families
  FOR UPDATE USING (parent_email = auth.jwt() ->> 'email');

-- Children policies  
CREATE POLICY "View children in family" ON children
  FOR SELECT USING (
    family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Insert children in family" ON children
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Update children in family" ON children
  FOR UPDATE USING (
    family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Delete children in family" ON children
  FOR DELETE USING (
    family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  );

-- Transactions policies
CREATE POLICY "View transactions for family children" ON transactions
  FOR SELECT USING (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Insert transactions for family children" ON transactions
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

-- Goals policies
CREATE POLICY "View goals for family children" ON goals
  FOR SELECT USING (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Insert goals for family children" ON goals
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Update goals for family children" ON goals
  FOR UPDATE USING (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

-- Purchase requests policies
CREATE POLICY "View purchase requests for family children" ON purchase_requests
  FOR SELECT USING (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Insert purchase requests for family children" ON purchase_requests
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Update purchase requests for family children" ON purchase_requests
  FOR UPDATE USING (
    child_id IN (
      SELECT c.id FROM children c 
      JOIN families f ON c.family_id = f.id 
      WHERE f.parent_email = auth.jwt() ->> 'email'
    )
  );