-- Goals and Dreams System Schema
-- Database tables for individual and family financial goals

-- Individual Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('toy', 'game', 'book', 'clothes', 'experience', 'education', 'charity', 'savings', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_date DATE,
  image_url TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal Contributions table - track money added to goals
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(50) DEFAULT 'manual' CHECK (contribution_type IN ('manual', 'automatic', 'allowance_percentage', 'chore_reward')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dream Boards table - collections of goals
CREATE TABLE IF NOT EXISTS dream_boards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_target_amount DECIMAL(10,2) DEFAULT 0.00,
  total_current_amount DECIMAL(10,2) DEFAULT 0.00,
  is_shared BOOLEAN DEFAULT false, -- Can family members see and contribute?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Goals table - goals that involve the whole family
CREATE TABLE IF NOT EXISTS family_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('vacation', 'house_improvement', 'family_activity', 'emergency_fund', 'education', 'charity', 'other')),
  target_date DATE,
  image_url TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Goal Contributions table
CREATE TABLE IF NOT EXISTS family_goal_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_goal_id UUID REFERENCES family_goals(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(50) DEFAULT 'manual' CHECK (contribution_type IN ('manual', 'challenge_reward', 'streak_bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_child_id ON goals(child_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);

CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_child_id ON goal_contributions(child_id);

CREATE INDEX IF NOT EXISTS idx_dream_boards_child_id ON dream_boards(child_id);
CREATE INDEX IF NOT EXISTS idx_dream_boards_is_shared ON dream_boards(is_shared);

CREATE INDEX IF NOT EXISTS idx_family_goals_family_id ON family_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_family_goals_is_active ON family_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_family_goals_created_by_child_id ON family_goals(created_by_child_id);

CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_family_goal_id ON family_goal_contributions(family_goal_id);
CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_child_id ON family_goal_contributions(child_id);

-- Update triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

CREATE TRIGGER trigger_update_dream_boards_updated_at
  BEFORE UPDATE ON dream_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

CREATE TRIGGER trigger_update_family_goals_updated_at
  BEFORE UPDATE ON family_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Function to update goal current_amount when contributions are added
CREATE OR REPLACE FUNCTION update_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the goal's current_amount
  UPDATE goals 
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM goal_contributions 
    WHERE goal_id = NEW.goal_id
  ),
  updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  -- Check if goal is completed
  UPDATE goals 
  SET is_completed = true,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = NEW.goal_id 
    AND current_amount >= target_amount 
    AND is_completed = false;
  
  -- Award XP and check badges when goal is completed
  IF (SELECT is_completed FROM goals WHERE id = NEW.goal_id) = true THEN
    -- Award XP to child (50 XP per goal completed)
    UPDATE children 
    SET xp = xp + 50,
        level = CASE 
          WHEN (xp + 50) >= level * 100 THEN level + 1
          ELSE level
        END
    WHERE id = NEW.child_id;
    
    -- Check for new badges (if gamification functions exist)
    BEGIN
      PERFORM check_and_award_badges(NEW.child_id);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if gamification functions don't exist yet
      NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_amount
  AFTER INSERT ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_amount();

-- Function to update family goal current_amount
CREATE OR REPLACE FUNCTION update_family_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the family goal's current_amount
  UPDATE family_goals 
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM family_goal_contributions 
    WHERE family_goal_id = NEW.family_goal_id
  ),
  updated_at = NOW()
  WHERE id = NEW.family_goal_id;
  
  -- Check if family goal is completed
  UPDATE family_goals 
  SET is_completed = true,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = NEW.family_goal_id 
    AND current_amount >= target_amount 
    AND is_completed = false;
  
  -- Award XP to contributing child (25 XP per family goal contribution)
  UPDATE children 
  SET xp = xp + 25,
      level = CASE 
        WHEN (xp + 25) >= level * 100 THEN level + 1
        ELSE level
      END
  WHERE id = NEW.child_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_family_goal_amount
  AFTER INSERT ON family_goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_family_goal_amount();

-- Function to update dream board totals
CREATE OR REPLACE FUNCTION update_dream_board_totals(p_child_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE dream_boards 
  SET total_target_amount = (
    SELECT COALESCE(SUM(target_amount), 0) 
    FROM goals 
    WHERE child_id = p_child_id AND is_active = true
  ),
  total_current_amount = (
    SELECT COALESCE(SUM(current_amount), 0) 
    FROM goals 
    WHERE child_id = p_child_id AND is_active = true
  ),
  updated_at = NOW()
  WHERE child_id = p_child_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample goal categories and data
INSERT INTO goals (child_id, title, description, target_amount, category, priority, target_date) 
SELECT 
  c.id,
  'My First Nintendo Switch',
  'I want to save money to buy a Nintendo Switch so I can play games with my friends!',
  1200.00,
  'toy',
  'high',
  CURRENT_DATE + INTERVAL '6 months'
FROM children c
WHERE c.name = 'Test Child'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO goals (child_id, title, description, target_amount, category, priority) 
SELECT 
  c.id,
  'Science Books Collection',
  'I want to buy science books to learn about space and animals.',
  150.00,
  'book',
  'medium'
FROM children c
WHERE c.name = 'Test Child'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample family goal
INSERT INTO family_goals (family_id, title, description, target_amount, category, target_date, created_by_child_id)
SELECT 
  f.id,
  'Family Trip to Disney World',
  'Let''s save together for an amazing family vacation to Disney World!',
  5000.00,
  'vacation',
  CURRENT_DATE + INTERVAL '1 year',
  c.id
FROM families f
CROSS JOIN children c
WHERE f.parent_email = 'test@example.com'
  AND c.name = 'Test Child'
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT 'Goals and Dreams schema created successfully!' as result;