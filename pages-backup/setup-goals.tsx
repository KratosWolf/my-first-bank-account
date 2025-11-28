import { useState } from 'react';

export default function SetupGoals() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, result]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Goals & Dreams System Setup
          </h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-blue-900 mb-2">📋 Database Setup Required</h2>
              <p className="text-blue-800 text-sm">
                Execute the following SQL in your Supabase SQL Editor to create the Goals & Dreams tables:
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-3">SQL Schema to Execute:</h2>
            <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto">
              <pre>{`-- Goals and Dreams System Schema
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

-- Goal Contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  contribution_type VARCHAR(50) DEFAULT 'manual' CHECK (contribution_type IN ('manual', 'automatic', 'allowance_percentage', 'chore_reward')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dream Boards table
CREATE TABLE IF NOT EXISTS dream_boards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_target_amount DECIMAL(10,2) DEFAULT 0.00,
  total_current_amount DECIMAL(10,2) DEFAULT 0.00,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Goals table
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
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_dream_boards_child_id ON dream_boards(child_id);
CREATE INDEX IF NOT EXISTS idx_family_goals_family_id ON family_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_family_goal_id ON family_goal_contributions(family_goal_id);

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
  
  -- Award XP when goal is completed (if gamification exists)
  IF (SELECT is_completed FROM goals WHERE id = NEW.goal_id) = true THEN
    UPDATE children 
    SET xp = xp + 50,
        level = CASE 
          WHEN (xp + 50) >= level * 100 THEN level + 1
          ELSE level
        END
    WHERE id = NEW.child_id;
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
  
  -- Award XP to contributing child
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

SELECT 'Goals and Dreams schema created successfully!' as result;`}</pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex space-x-4">
              <a
                href="/gamification-test"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                ← Back to Gamification Test
              </a>
              
              <a
                href="/goals-test"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Test Goals & Dreams Features →
              </a>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">📝 Setup Instructions</h3>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Copy the SQL schema above</li>
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Paste and execute the SQL</li>
              <li>Click "Test Goals & Dreams Features" to start testing</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🎯 What This Creates</h3>
            <div className="text-sm text-green-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Individual Goals:</h4>
                <ul className="space-y-1">
                  <li>• Goal creation and tracking</li>
                  <li>• Progress visualization</li>
                  <li>• Category and priority system</li>
                  <li>• Automatic completion detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Family Goals:</h4>
                <ul className="space-y-1">
                  <li>• Collaborative family objectives</li>
                  <li>• Multi-child contributions</li>
                  <li>• Shared progress tracking</li>
                  <li>• XP rewards for participation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}