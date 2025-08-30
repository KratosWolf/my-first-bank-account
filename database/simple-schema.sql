-- Simple schema without RLS for testing
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table (simple version)
CREATE TABLE families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table (simple version)
CREATE TABLE children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  pin VARCHAR(4) NOT NULL,
  avatar VARCHAR(10) DEFAULT '👶',
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table (simple version)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO families (parent_name, parent_email) 
VALUES ('Test Parent', 'test@example.com');

-- Check if everything was created
SELECT 'Tables created successfully!' as result;