-- MyFirstBA Database Schema for Supabase
-- Financial Education App for Families

-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Create custom types
CREATE TYPE user_role AS ENUM ('parent', 'child');
CREATE TYPE transaction_type AS ENUM ('allowance', 'purchase', 'goal_deposit', 'bonus', 'interest', 'request_approved');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- Families table (main entity)
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  allowance_amount DECIMAL(10,2) DEFAULT 20.00,
  allowance_frequency VARCHAR(20) DEFAULT 'monthly',
  require_approval_over DECIMAL(10,2) DEFAULT 50.00,
  family_mission TEXT,
  savings_interest_rate DECIMAL(5,2) DEFAULT 1.0,
  interest_enabled BOOLEAN DEFAULT true,
  interest_application_day INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (parents and children)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  pin VARCHAR(4), -- For children
  role user_role NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  total_saved DECIMAL(10,2) DEFAULT 0.00,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  badges INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spending categories
CREATE TABLE spending_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  monthly_limit DECIMAL(10,2) DEFAULT 20.00,
  quarterly_limit DECIMAL(10,2) DEFAULT 60.00,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES spending_categories(id),
  balance_after DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0.00,
  icon VARCHAR(10) DEFAULT '🎯',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase requests
CREATE TABLE purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'purchase',
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES spending_categories(id),
  status request_status DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges/Achievements
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🏆',
  criteria JSONB, -- Flexible criteria for earning the badge
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (many-to-many)
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Minimum balance tracking for interest calculation
CREATE TABLE monthly_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  minimum_balance DECIMAL(10,2) NOT NULL,
  days_tracked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Indexes for better performance
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_family_id ON transactions(family_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_purchase_requests_user_id ON purchase_requests(user_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_monthly_balances_user_date ON monthly_balances(user_id, year, month);

-- Row Level Security (RLS) policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies (will be created after auth setup)
-- Users can only access data from their own family
-- Parents can see all family data
-- Children can only see their own data

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_balances_updated_at BEFORE UPDATE ON monthly_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default spending categories
INSERT INTO spending_categories (family_id, name, icon, monthly_limit, quarterly_limit) VALUES
  (NULL, 'Comida e Lanches', '🍕', 50, 150),
  (NULL, 'Jogos e Apps', '🎮', 20, 60),
  (NULL, 'Brinquedos', '🧸', 30, 90),
  (NULL, 'Roupas', '👕', 40, 120),
  (NULL, 'Livros e Material Escolar', '📚', 25, 75),
  (NULL, 'Entretenimento', '🎬', 35, 105);

-- Insert default badges
INSERT INTO badges (family_id, name, description, icon) VALUES
  (NULL, 'Primeiro Poupador', 'Economizou pela primeira vez', '💰'),
  (NULL, 'Meta Cumprida', 'Completou seu primeiro objetivo', '🎯'),
  (NULL, 'Gastador Consciente', 'Fez 10 compras responsáveis', '🛒'),
  (NULL, 'Poupador Expert', 'Acumulou R$ 100,00', '🏆'),
  (NULL, 'Planejador', 'Criou seu primeiro objetivo', '📋');