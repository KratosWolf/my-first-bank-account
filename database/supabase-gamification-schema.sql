-- Gamification Schema for My First Bank Account
-- Run these commands in Supabase SQL Editor

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('saving', 'spending', 'earning', 'goal', 'streak', 'level', 'special')),
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    xp_reward INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create child_badges table (earned badges)
CREATE TABLE IF NOT EXISTS child_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL, -- Will reference badge IDs from the API
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, badge_id)
);

-- Create child_streaks table
CREATE TABLE IF NOT EXISTS child_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_save', 'weekly_goal', 'transaction_log', 'lesson_complete')),
    current_count INTEGER NOT NULL DEFAULT 0,
    best_count INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, streak_type)
);

-- Add gamification columns to children table if they don't exist
ALTER TABLE children ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE children ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;

-- Create updated_at trigger for child_streaks
CREATE TRIGGER update_child_streaks_updated_at 
    BEFORE UPDATE ON child_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges
INSERT INTO badges (id, name, description, icon, category, rarity, xp_reward) VALUES
    ('first_goal', 'Primeiro Sonho', 'Criar sua primeira meta financeira', '🎯', 'goal', 'common', 50),
    ('saver_bronze', 'Poupador Bronze', 'Guardar R$ 50,00 em metas', '🥉', 'saving', 'common', 75),
    ('saver_silver', 'Poupador Prata', 'Guardar R$ 200,00 em metas', '🥈', 'saving', 'rare', 150),
    ('saver_gold', 'Poupador Ouro', 'Guardar R$ 500,00 em metas', '🥇', 'saving', 'epic', 300),
    ('goal_completer', 'Realizador de Sonhos', 'Completar sua primeira meta', '🏆', 'goal', 'rare', 200),
    ('transaction_master', 'Mestre das Transações', 'Realizar 10 transações', '💳', 'spending', 'common', 100),
    ('streak_starter', 'Início de Sequência', 'Manter uma sequência por 3 dias', '🔥', 'streak', 'common', 60),
    ('streak_champion', 'Campeão de Sequência', 'Manter uma sequência por 7 dias', '⚡', 'streak', 'rare', 150),
    ('level_up_5', 'Nível 5 Alcançado', 'Chegar ao nível 5', '⭐', 'level', 'epic', 250),
    ('first_purchase', 'Primeira Compra', 'Fazer o primeiro pedido de compra', '🛒', 'spending', 'common', 25)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON badges
FOR SELECT USING (true);

-- RLS Policies for child_badges
CREATE POLICY "Users can view their children's badges" ON child_badges
FOR SELECT USING (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

CREATE POLICY "Users can insert badges for their children" ON child_badges
FOR INSERT WITH CHECK (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

-- RLS Policies for child_streaks
CREATE POLICY "Users can view their children's streaks" ON child_streaks
FOR SELECT USING (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

CREATE POLICY "Users can manage their children's streaks" ON child_streaks
FOR ALL USING (
    child_id IN (
        SELECT id FROM children 
        WHERE family_id = auth.uid()::text
    )
);

-- Verification query
/*
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('badges', 'child_badges', 'child_streaks')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
*/