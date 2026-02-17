-- Migration 004: Renomear annual_rate para monthly_rate
-- Task 1.2: Corrigir confusão de nomenclatura (taxa "anual" mas usada como mensal)
-- Motivo: Campo estava nomeado como "annual_rate" mas era aplicado mensalmente
--         Causava confusão: 9.9% "anual" na verdade era 9.9% mensal = 211% ao ano!

-- ========================================
-- 1. RENOMEAR COLUNA
-- ========================================

ALTER TABLE interest_config
  RENAME COLUMN annual_rate TO monthly_rate;

-- ========================================
-- 2. ATUALIZAR CONSTRAINT (permitir até 100%)
-- ========================================

-- Remover constraint antigo (se existir)
ALTER TABLE interest_config
  DROP CONSTRAINT IF EXISTS interest_config_annual_rate_check;

ALTER TABLE interest_config
  DROP CONSTRAINT IF EXISTS interest_config_monthly_rate_check;

-- Adicionar novo constraint: 0% a 100%
ALTER TABLE interest_config
  ADD CONSTRAINT interest_config_monthly_rate_check
  CHECK (monthly_rate >= 0 AND monthly_rate <= 100);

-- ========================================
-- 3. ATUALIZAR COMENTÁRIO DA COLUNA
-- ========================================

COMMENT ON COLUMN interest_config.monthly_rate IS
  'Taxa de juros mensal em percentual (0-100%). Aplicada mensalmente sobre saldo elegível (30+ dias). Exemplo: 9.9 = 9.9% ao mês.';

-- ========================================
-- 4. VERIFICAR VALORES ATUAIS (não altera dados)
-- ========================================

-- Os valores atuais (ex: 9.9) continuam sendo 9.9
-- Agora corretamente interpretado como 9.9% MENSAL (e não anual)
-- Nenhuma retroação de juros passados

-- SELECT id, child_id, monthly_rate, minimum_balance, is_active
-- FROM interest_config;

-- ========================================
-- 5. RESULTADO ESPERADO
-- ========================================

-- ANTES da migration:
--   Campo: annual_rate (CONFUSO - nome anual mas usado como mensal)
--   Valor: 9.9
--   Interpretação: 9.9% ao mês (errado - nome dizia "anual")
--   Problema: Confusão total de nomenclatura

-- DEPOIS da migration:
--   Campo: monthly_rate (CORRETO - nome bate com uso)
--   Valor: 9.9 (preservado)
--   Interpretação: 9.9% ao mês (correto - nome e uso batem)
--   Solução: Sem confusão, taxa mensal é taxa mensal
