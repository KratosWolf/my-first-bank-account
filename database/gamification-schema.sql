-- Gamification System Schema
-- Add gamification tables to the existing database

-- Badges table - Define available badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('saving', 'spending', 'earning', 'goal', 'streak', 'level', 'special')),
  criteria JSONB NOT NULL,
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Child Badges - Track which badges each child has earned
CREATE TABLE IF NOT EXISTS child_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, badge_id)
);

-- Streaks table - Track child activity streaks
CREATE TABLE IF NOT EXISTS child_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  streak_type VARCHAR(30) NOT NULL CHECK (streak_type IN ('daily_save', 'weekly_goal', 'transaction_log', 'lesson_complete')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, streak_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_child_badges_child_id ON child_badges(child_id);
CREATE INDEX IF NOT EXISTS idx_child_badges_badge_id ON child_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_child_streaks_child_id ON child_streaks(child_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

-- Insert default badges
INSERT INTO badges (name, description, icon, category, criteria, rarity, xp_reward) VALUES
  -- Earning badges
  ('First Coin', 'Earned your first money!', '🪙', 'earning', '{"type": "amount_earned", "threshold": 1}', 'common', 10),
  ('Penny Saver', 'Earned R$ 10', '💰', 'earning', '{"type": "amount_earned", "threshold": 10}', 'common', 25),
  ('Money Maker', 'Earned R$ 100', '💵', 'earning', '{"type": "amount_earned", "threshold": 100}', 'rare', 100),
  ('Rich Kid', 'Earned R$ 500', '🤑', 'earning', '{"type": "amount_earned", "threshold": 500}', 'epic', 250),
  
  -- Saving badges
  ('Piggy Bank Start', 'Saved your first R$ 10', '🐷', 'saving', '{"type": "amount_saved", "threshold": 10}', 'common', 20),
  ('Smart Saver', 'Saved R$ 50', '💎', 'saving', '{"type": "amount_saved", "threshold": 50}', 'rare', 75),
  ('Treasure Hunter', 'Saved R$ 200', '🏆', 'saving', '{"type": "amount_saved", "threshold": 200}', 'epic', 200),
  ('Savings Master', 'Saved R$ 1000', '👑', 'saving', '{"type": "amount_saved", "threshold": 1000}', 'legendary', 500),
  
  -- Transaction badges
  ('First Steps', 'Made your first transaction', '👶', 'spending', '{"type": "transactions_count", "threshold": 1}', 'common', 15),
  ('Active Spender', 'Made 10 transactions', '🛒', 'spending', '{"type": "transactions_count", "threshold": 10}', 'common', 50),
  ('Transaction Pro', 'Made 50 transactions', '📊', 'spending', '{"type": "transactions_count", "threshold": 50}', 'rare', 150),
  
  -- Streak badges
  ('Consistent Saver', '7-day saving streak', '🔥', 'streak', '{"type": "days_streak", "threshold": 7}', 'rare', 100),
  ('Saving Streak Legend', '30-day saving streak', '⚡', 'streak', '{"type": "days_streak", "threshold": 30}', 'legendary', 400),
  
  -- Level badges
  ('Level Up!', 'Reached level 2', '⭐', 'level', '{"type": "level_reached", "threshold": 2}', 'common', 30),
  ('Rising Star', 'Reached level 5', '🌟', 'level', '{"type": "level_reached", "threshold": 5}', 'rare', 125),
  ('Financial Expert', 'Reached level 10', '💫', 'level', '{"type": "level_reached", "threshold": 10}', 'epic', 300),
  
  -- Goal badges
  ('Dream Achiever', 'Completed your first goal', '🎯', 'goal', '{"type": "goals_completed", "threshold": 1}', 'rare', 80),
  ('Goal Getter', 'Completed 5 goals', '🏅', 'goal', '{"type": "goals_completed", "threshold": 5}', 'epic', 250),
  
  -- Special badges
  ('Early Bird', 'Joined the family bank', '🐣', 'special', '{"type": "special_action", "threshold": 1}', 'common', 25),
  ('Family Helper', 'Helped a family member', '❤️', 'special', '{"type": "special_action", "threshold": 1}', 'rare', 100)
ON CONFLICT (name) DO NOTHING;

-- Update trigger for child_streaks
CREATE OR REPLACE FUNCTION update_child_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_child_streaks_updated_at
  BEFORE UPDATE ON child_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_child_streaks_updated_at();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_child_id UUID)
RETURNS TABLE (
  new_badge_id UUID,
  badge_name TEXT,
  badge_icon TEXT,
  xp_reward INTEGER
) AS $$
DECLARE
  child_data RECORD;
  badge_record RECORD;
  criteria_data JSONB;
  threshold_value NUMERIC;
  current_value NUMERIC;
BEGIN
  -- Get child data
  SELECT * INTO child_data FROM children WHERE id = p_child_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check all badges that the child hasn't earned yet
  FOR badge_record IN 
    SELECT b.* 
    FROM badges b 
    WHERE b.is_active = true
    AND b.id NOT IN (
      SELECT badge_id FROM child_badges WHERE child_id = p_child_id
    )
  LOOP
    criteria_data := badge_record.criteria;
    threshold_value := (criteria_data->>'threshold')::NUMERIC;
    current_value := 0;
    
    -- Check criteria based on type
    CASE criteria_data->>'type'
      WHEN 'amount_earned' THEN
        current_value := child_data.total_earned;
      WHEN 'amount_saved' THEN
        current_value := child_data.balance;
      WHEN 'level_reached' THEN
        current_value := child_data.level;
      WHEN 'transactions_count' THEN
        SELECT COUNT(*) INTO current_value 
        FROM transactions 
        WHERE child_id = p_child_id;
      WHEN 'goals_completed' THEN
        SELECT COUNT(*) INTO current_value 
        FROM goals 
        WHERE child_id = p_child_id AND is_completed = true;
      WHEN 'days_streak' THEN
        SELECT COALESCE(MAX(current_count), 0) INTO current_value 
        FROM child_streaks 
        WHERE child_id = p_child_id;
      ELSE
        CONTINUE;
    END CASE;
    
    -- Award badge if criteria is met
    IF current_value >= threshold_value THEN
      -- Insert the badge award
      INSERT INTO child_badges (child_id, badge_id) 
      VALUES (p_child_id, badge_record.id)
      ON CONFLICT (child_id, badge_id) DO NOTHING;
      
      -- Update child XP
      UPDATE children 
      SET xp = xp + badge_record.xp_reward,
          level = CASE 
            WHEN (xp + badge_record.xp_reward) >= level * 100 THEN level + 1
            ELSE level
          END
      WHERE id = p_child_id;
      
      -- Return the awarded badge info
      new_badge_id := badge_record.id;
      badge_name := badge_record.name;
      badge_icon := badge_record.icon;
      xp_reward := badge_record.xp_reward;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update streaks
CREATE OR REPLACE FUNCTION update_child_streak(
  p_child_id UUID,
  p_streak_type VARCHAR(30)
)
RETURNS VOID AS $$
DECLARE
  streak_record RECORD;
  days_diff INTEGER;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record 
  FROM child_streaks 
  WHERE child_id = p_child_id AND streak_type = p_streak_type;
  
  IF NOT FOUND THEN
    -- Create new streak
    INSERT INTO child_streaks (child_id, streak_type, current_count, best_count, last_activity, is_active)
    VALUES (p_child_id, p_streak_type, 1, 1, NOW(), true);
  ELSE
    -- Calculate days difference
    days_diff := EXTRACT(DAY FROM (NOW() - streak_record.last_activity));
    
    IF days_diff = 0 THEN
      -- Same day, no change needed
      RETURN;
    ELSIF days_diff = 1 THEN
      -- Consecutive day, increment streak
      UPDATE child_streaks 
      SET current_count = current_count + 1,
          best_count = GREATEST(best_count, current_count + 1),
          last_activity = NOW(),
          is_active = true,
          updated_at = NOW()
      WHERE id = streak_record.id;
    ELSE
      -- Streak broken, reset
      UPDATE child_streaks 
      SET current_count = 1,
          last_activity = NOW(),
          is_active = true,
          updated_at = NOW()
      WHERE id = streak_record.id;
    END IF;
  END IF;
  
  -- Check for streak badges
  PERFORM check_and_award_badges(p_child_id);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check badges on child updates
CREATE OR REPLACE FUNCTION trigger_check_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_children_badge_check
  AFTER UPDATE ON children
  FOR EACH ROW
  WHEN (OLD.balance != NEW.balance OR OLD.total_earned != NEW.total_earned OR OLD.level != NEW.level)
  EXECUTE FUNCTION trigger_check_badges();

-- Create trigger to check badges on new transactions
CREATE OR REPLACE FUNCTION trigger_transaction_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Update saving streak for earning transactions
  IF NEW.type IN ('earning', 'allowance') THEN
    PERFORM update_child_streak(NEW.child_id, 'daily_save');
  END IF;
  
  -- Check for new badges
  PERFORM check_and_award_badges(NEW.child_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transaction_badge_check
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_transaction_badges();

SELECT 'Gamification schema created successfully!' as result;