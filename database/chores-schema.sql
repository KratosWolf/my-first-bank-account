-- Chores/Tasks System Schema
-- This extends the existing Banco da Familia database

-- Table for chore templates (recurring tasks)
CREATE TABLE chore_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'cleaning', 'academic', 'pets', 'outdoor', 'helping', 'other'
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estimated_minutes INTEGER, -- How long the task should take
    age_min INTEGER DEFAULT 3, -- Minimum age for this task
    age_max INTEGER DEFAULT 18, -- Maximum age for this task
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chore_templates_reward_positive CHECK (reward_amount >= 0),
    CONSTRAINT chore_templates_minutes_positive CHECK (estimated_minutes > 0),
    CONSTRAINT chore_templates_age_valid CHECK (age_min <= age_max)
);

-- Table for assigned chores (specific instances)
CREATE TABLE assigned_chores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chore_template_id UUID NOT NULL REFERENCES chore_templates(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    assigned_by_parent_id UUID REFERENCES children(id), -- Which parent assigned it
    name VARCHAR(100) NOT NULL, -- Can be customized from template
    description TEXT,
    reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'approved', 'rejected'
    completed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_parent_id UUID REFERENCES children(id),
    rejection_reason TEXT,
    notes TEXT, -- Child can add notes when completing
    photo_evidence TEXT, -- URL to uploaded photo (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT assigned_chores_reward_positive CHECK (reward_amount >= 0),
    CONSTRAINT assigned_chores_status_valid CHECK (status IN ('assigned', 'in_progress', 'completed', 'approved', 'rejected')),
    CONSTRAINT assigned_chores_priority_valid CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Table for chore completion history (for analytics)
CREATE TABLE chore_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_chore_id UUID NOT NULL REFERENCES assigned_chores(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    completion_time_minutes INTEGER, -- How long it actually took
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5), -- Parent rating
    child_satisfaction INTEGER CHECK (child_satisfaction BETWEEN 1 AND 5), -- Child's own rating
    bonus_reward DECIMAL(10,2) DEFAULT 0.00, -- Extra reward for good work
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chore_completions_bonus_positive CHECK (bonus_reward >= 0)
);

-- Indexes for better performance
CREATE INDEX idx_chore_templates_family_id ON chore_templates(family_id);
CREATE INDEX idx_chore_templates_category ON chore_templates(category);
CREATE INDEX idx_assigned_chores_child_id ON assigned_chores(child_id);
CREATE INDEX idx_assigned_chores_status ON assigned_chores(status);
CREATE INDEX idx_assigned_chores_due_date ON assigned_chores(due_date);
CREATE INDEX idx_chore_completions_child_id ON chore_completions(child_id);

-- Row Level Security (RLS) policies
ALTER TABLE chore_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (these would need to be adapted based on your auth system)
CREATE POLICY "Users can view their family's chore templates" ON chore_templates
    FOR SELECT USING (family_id IN (SELECT id FROM families WHERE id = family_id));

CREATE POLICY "Parents can manage chore templates" ON chore_templates
    FOR ALL USING (family_id IN (SELECT id FROM families WHERE id = family_id));

CREATE POLICY "Users can view their assigned chores" ON assigned_chores
    FOR SELECT USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT id FROM families WHERE id = (SELECT family_id FROM children WHERE id = child_id))));

CREATE POLICY "Children can update their own chores" ON assigned_chores
    FOR UPDATE USING (child_id = child_id);

CREATE POLICY "Parents can manage all chores in their family" ON assigned_chores
    FOR ALL USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT id FROM families WHERE id = (SELECT family_id FROM children WHERE id = child_id))));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chore_templates_updated_at BEFORE UPDATE ON chore_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assigned_chores_updated_at BEFORE UPDATE ON assigned_chores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO chore_templates (family_id, name, description, category, reward_amount, estimated_minutes, age_min, age_max) VALUES
-- Family ID will need to be replaced with actual family ID from your system
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Lavar a louça', 'Lavar pratos, copos e utensílios após as refeições', 'cleaning', 10.00, 20, 8, 18),
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Organizar o quarto', 'Fazer a cama, organizar roupas e brinquedos', 'cleaning', 5.00, 15, 5, 18),
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Fazer lição de casa', 'Completar todas as tarefas escolares do dia', 'academic', 15.00, 60, 6, 17),
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Passear com o cachorro', 'Levar o pet para passear por 30 minutos', 'pets', 8.00, 30, 10, 18),
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Ajudar a preparar o jantar', 'Auxiliar na preparação da refeição da família', 'helping', 12.00, 45, 8, 18),
('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36', 'Varrer o quintal', 'Limpar folhas e sujeira do quintal/área externa', 'outdoor', 7.00, 25, 7, 18);