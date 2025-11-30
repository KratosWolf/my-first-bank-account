-- FASE 2.5.1: Adicionar coluna color à tabela spending_categories
-- Execute este SQL no Supabase Dashboard (SQL Editor)

-- Adicionar coluna color
ALTER TABLE spending_categories
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

-- Atualizar cores para categorias existentes (opcional, o script JS fará isso)
-- UPDATE spending_categories SET color = '#EC4899' WHERE name = 'Toys & Games';
-- UPDATE spending_categories SET color = '#8B5CF6' WHERE name = 'Books & Education';
-- UPDATE spending_categories SET color = '#06B6D4' WHERE name = 'Clothes & Accessories';
-- UPDATE spending_categories SET color = '#F59E0B' WHERE name = 'Food & Snacks';
-- UPDATE spending_categories SET color = '#3B82F6' WHERE name = 'Digital & Apps';
-- UPDATE spending_categories SET color = '#10B981' WHERE name = 'Sports & Activities';
-- UPDATE spending_categories SET color = '#F97316' WHERE name = 'Art & Crafts';
-- UPDATE spending_categories SET color = '#6B7280' WHERE name = 'Other';
-- UPDATE spending_categories SET color = '#14B8A6' WHERE name = 'Savings Transfer';
-- UPDATE spending_categories SET color = '#EF4444' WHERE name = 'Charity & Giving';

-- Verificar resultado
SELECT id, name, icon, color, monthly_limit, quarterly_limit, enabled
FROM spending_categories
ORDER BY name;
