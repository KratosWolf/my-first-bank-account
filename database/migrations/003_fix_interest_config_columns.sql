-- Migration 003: Corrigir tipos de dados da tabela interest_config
-- Problema: annual_rate está como NUMERIC(2,1) (max 9.9)
-- Solução: Alterar para NUMERIC(5,2) para aceitar até 999.99%

-- ========================================
-- 1. VERIFICAR TIPOS ATUAIS (apenas para referência)
-- ========================================
-- SELECT
--   column_name,
--   data_type,
--   numeric_precision,
--   numeric_scale
-- FROM information_schema.columns
-- WHERE table_name = 'interest_config'
--   AND column_name IN ('annual_rate', 'minimum_balance');

-- Resultado esperado ANTES da migração:
-- annual_rate:      NUMERIC, precision 2, scale 1 (máx 9.9) ❌
-- minimum_balance:  NUMERIC, precision 2, scale 1 (máx 9.9) ❌


-- ========================================
-- 2. ALTERAR TIPOS DE DADOS
-- ========================================

-- Alterar annual_rate para NUMERIC(5,2)
-- Permite valores de 0.00 até 999.99 (suficiente para taxas de até 999.99% ao ano)
ALTER TABLE interest_config
  ALTER COLUMN annual_rate TYPE NUMERIC(5,2);

-- Alterar minimum_balance para NUMERIC(10,2)
-- Permite valores de 0.00 até 99,999,999.99 (suficiente para qualquer saldo)
ALTER TABLE interest_config
  ALTER COLUMN minimum_balance TYPE NUMERIC(10,2);


-- ========================================
-- 3. VERIFICAR ALTERAÇÕES (executar após a migração)
-- ========================================
-- SELECT
--   column_name,
--   data_type,
--   numeric_precision,
--   numeric_scale
-- FROM information_schema.columns
-- WHERE table_name = 'interest_config'
--   AND column_name IN ('annual_rate', 'minimum_balance');

-- Resultado esperado DEPOIS da migração:
-- annual_rate:      NUMERIC, precision 5, scale 2 (máx 999.99) ✅
-- minimum_balance:  NUMERIC, precision 10, scale 2 (máx 99999999.99) ✅


-- ========================================
-- 4. COMENTÁRIOS ADICIONAIS
-- ========================================
COMMENT ON COLUMN interest_config.annual_rate IS 'Taxa de juros anual em percentual (ex: 12.00 = 12% ao ano). Máximo: 999.99%';
COMMENT ON COLUMN interest_config.minimum_balance IS 'Saldo mínimo necessário para render juros (em reais). Máximo: R$ 99.999.999,99';


-- ========================================
-- 5. TESTE APÓS MIGRAÇÃO
-- ========================================
-- Depois de executar esta migração, teste com:
-- INSERT INTO interest_config (child_id, annual_rate, compound_frequency, minimum_balance, is_active)
-- VALUES (
--   (SELECT id FROM children LIMIT 1),
--   12.00,
--   'monthly',
--   10.00,
--   true
-- );
--
-- SELECT * FROM interest_config;
--
-- DELETE FROM interest_config WHERE id = (SELECT id FROM interest_config ORDER BY created_at DESC LIMIT 1);
