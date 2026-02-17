-- ============================================================
-- MIGRATION 004: Renomear annual_rate → monthly_rate
-- ============================================================
-- Task 1.2 - Corrigir confusão de nomenclatura
--
-- COPIE ESTE ARQUIVO COMPLETO E COLE NO SUPABASE STUDIO SQL EDITOR
-- URL: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/sql
-- ============================================================

-- 1. Renomear coluna
ALTER TABLE interest_config
  RENAME COLUMN annual_rate TO monthly_rate;

-- 2. Remover constraints antigos
ALTER TABLE interest_config
  DROP CONSTRAINT IF EXISTS interest_config_annual_rate_check;

ALTER TABLE interest_config
  DROP CONSTRAINT IF EXISTS interest_config_monthly_rate_check;

-- 3. Adicionar novo constraint (0% a 100%)
ALTER TABLE interest_config
  ADD CONSTRAINT interest_config_monthly_rate_check
  CHECK (monthly_rate >= 0 AND monthly_rate <= 100);

-- 4. Atualizar comentário da coluna
COMMENT ON COLUMN interest_config.monthly_rate IS
  'Taxa de juros mensal em percentual (0-100%). Aplicada mensalmente sobre saldo elegível (30+ dias). Exemplo: 9.9 = 9.9% ao mês.';

-- 5. Verificar resultado
SELECT id, child_id, monthly_rate, minimum_balance, is_active
FROM interest_config;

-- ============================================================
-- RESULTADO ESPERADO:
-- ✅ Coluna "annual_rate" não existe mais
-- ✅ Coluna "monthly_rate" existe
-- ✅ Valores preservados (9.9 continua sendo 9.9)
-- ✅ Constraint permite até 100%
-- ============================================================
