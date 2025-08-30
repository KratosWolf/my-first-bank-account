-- Financial Transaction System Schema
-- Core banking functionality for family financial education

-- Transactions table - all financial movements
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earning', 'spending', 'transfer', 'interest', 'allowance', 'goal_deposit')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  
  -- Transfer specific fields
  from_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  to_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  
  -- Parent approval fields
  requires_approval BOOLEAN DEFAULT false,
  approved_by_parent BOOLEAN DEFAULT true,
  parent_note TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Goal integration
  related_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allowance Configuration table
CREATE TABLE IF NOT EXISTS allowance_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  frequency VARCHAR(20) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER DEFAULT 1 CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  day_of_month INTEGER DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN DEFAULT true,
  next_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spending Categories table
CREATE TABLE IF NOT EXISTS spending_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280', -- hex color
  requires_approval BOOLEAN DEFAULT true,
  spending_limit DECIMAL(10,2), -- optional limit per transaction
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child Spending Limits table
CREATE TABLE IF NOT EXISTS child_spending_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES spending_categories(id) ON DELETE CASCADE NOT NULL,
  daily_limit DECIMAL(10,2) DEFAULT 0,
  weekly_limit DECIMAL(10,2) DEFAULT 0,
  monthly_limit DECIMAL(10,2) DEFAULT 0,
  requires_approval_over DECIMAL(10,2) DEFAULT 0, -- require approval for amounts over this
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, category_id)
);

-- Interest Configuration table
CREATE TABLE IF NOT EXISTS interest_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_rate DECIMAL(5,4) DEFAULT 0.01, -- 1% monthly rate (educational)
  annual_rate DECIMAL(5,4) DEFAULT 0.01, -- DEPRECATED: use monthly_rate instead
  compound_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (compound_frequency IN ('daily', 'weekly', 'monthly')),
  minimum_balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_interest_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_child_id ON transactions(child_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_requires_approval ON transactions(requires_approval);

CREATE INDEX IF NOT EXISTS idx_allowance_config_child_id ON allowance_config(child_id);
CREATE INDEX IF NOT EXISTS idx_allowance_config_next_payment ON allowance_config(next_payment_date);

CREATE INDEX IF NOT EXISTS idx_spending_categories_is_active ON spending_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_child_spending_limits_child_id ON child_spending_limits(child_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

CREATE TRIGGER trigger_update_allowance_config_updated_at
  BEFORE UPDATE ON allowance_config
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- Function to update child balance when transaction is created/updated
CREATE OR REPLACE FUNCTION update_child_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed transactions
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Handle different transaction types
  CASE NEW.type
    WHEN 'earning', 'allowance', 'interest' THEN
      -- Add money to child's balance and total_earned
      UPDATE children 
      SET balance = balance + NEW.amount,
          total_earned = total_earned + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.child_id;
      
    WHEN 'spending' THEN
      -- Subtract money from child's balance and add to total_spent
      UPDATE children 
      SET balance = balance - NEW.amount,
          total_spent = total_spent + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.child_id;
      
    WHEN 'transfer' THEN
      -- Handle transfers between children
      IF NEW.from_child_id IS NOT NULL AND NEW.to_child_id IS NOT NULL THEN
        -- Subtract from sender
        UPDATE children 
        SET balance = balance - NEW.amount,
            total_spent = total_spent + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.from_child_id;
        
        -- Add to receiver
        UPDATE children 
        SET balance = balance + NEW.amount,
            total_earned = total_earned + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.to_child_id;
      END IF;
      
    WHEN 'goal_deposit' THEN
      -- Subtract from balance (money moved to goal)
      UPDATE children 
      SET balance = balance - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.child_id;
  END CASE;
  
  -- Award gamification XP for financial activities
  CASE NEW.type
    WHEN 'earning' THEN
      UPDATE children SET xp = xp + 10 WHERE id = NEW.child_id;
    WHEN 'allowance' THEN  
      UPDATE children SET xp = xp + 5 WHERE id = NEW.child_id;
    WHEN 'spending' THEN
      UPDATE children SET xp = xp + 3 WHERE id = NEW.child_id;
    WHEN 'transfer' THEN
      UPDATE children SET xp = xp + 15 WHERE id = NEW.child_id; -- sharing is caring
  END CASE;

  -- Check for gamification badges
  BEGIN
    PERFORM check_and_award_badges(NEW.child_id);
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if function doesn't exist
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_child_balance
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_child_balance();

-- Insert default spending categories
INSERT INTO spending_categories (name, description, icon, color, requires_approval, spending_limit) VALUES
('Toys & Games', 'Toys, games, and entertainment items', '🧸', '#F59E0B', true, 100.00),
('Food & Snacks', 'Snacks, treats, and food purchases', '🍿', '#10B981', false, 20.00),
('Books & Education', 'Books, educational materials, courses', '📚', '#3B82F6', false, 50.00),
('Clothes & Accessories', 'Clothing, shoes, and accessories', '👕', '#8B5CF6', true, 75.00),
('Digital & Apps', 'Games, apps, digital content', '📱', '#EF4444', true, 25.00),
('Sports & Activities', 'Sports equipment, activity fees', '⚽', '#06B6D4', true, 60.00),
('Art & Crafts', 'Art supplies, craft materials', '🎨', '#EC4899', false, 30.00),
('Charity & Giving', 'Donations and charitable giving', '❤️', '#F97316', false, NULL),
('Savings Transfer', 'Moving money to savings goals', '💰', '#22C55E', false, NULL),
('Other', 'Miscellaneous purchases', '🛍️', '#6B7280', true, 50.00)
ON CONFLICT (name) DO NOTHING;

-- Insert sample transactions for testing
INSERT INTO transactions (child_id, type, amount, description, category, status) 
SELECT 
  c.id,
  'earning',
  25.00,
  'Weekly allowance payment',
  'allowance',
  'completed'
FROM children c
WHERE c.name IN ('Test Child', 'Debug Child')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (child_id, type, amount, description, category, status) 
SELECT 
  c.id,
  'earning',
  50.00,
  'Completed all chores this week!',
  'chores',
  'completed'
FROM children c
WHERE c.name IN ('Test Child', 'Debug Child')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (child_id, type, amount, description, category, status) 
SELECT 
  c.id,
  'spending',
  15.00,
  'Bought a book about dinosaurs',
  'Books & Education',
  'completed'
FROM children c
WHERE c.name = 'Test Child'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample allowance configurations
INSERT INTO allowance_config (child_id, amount, frequency, day_of_week, is_active)
SELECT 
  c.id,
  25.00,
  'weekly',
  1, -- Monday
  true
FROM children c
WHERE c.name IN ('Test Child', 'Debug Child')
ON CONFLICT (child_id) DO NOTHING;

-- Insert sample interest config (5% annual rate)
INSERT INTO interest_config (child_id, annual_rate, compound_frequency, minimum_balance, is_active)
SELECT 
  c.id,
  0.05, -- 5% annual
  'monthly',
  10.00, -- minimum R$10 for interest
  true
FROM children c
WHERE c.name IN ('Test Child', 'Debug Child')
ON CONFLICT (child_id) DO NOTHING;

SELECT 'Financial Transaction System created successfully!' as result;