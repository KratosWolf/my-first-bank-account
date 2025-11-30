-- Migração: Adicionar colunas de realização de sonhos à tabela goals
-- Data: 2025-11-30
-- Descrição: Sistema de solicitação de realização de sonhos completos

-- 1. Status da solicitação de realização
-- NULL = não solicitado ainda
-- 'pending' = aguardando aprovação dos pais
-- 'approved' = pais aprovaram a realização
-- 'rejected' = pais recusaram a realização
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT NULL;

-- 2. Data/hora em que a criança solicitou a realização
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Data/hora em que os pais aprovaram/recusaram
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 4. ID do pai que resolveu a solicitação
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS fulfillment_resolved_by TEXT DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN goals.fulfillment_status IS 'Status da solicitação de realização: NULL, pending, approved, rejected';
COMMENT ON COLUMN goals.fulfillment_requested_at IS 'Data/hora que a criança solicitou a realização do sonho';
COMMENT ON COLUMN goals.fulfillment_resolved_at IS 'Data/hora que os pais aprovaram/recusaram a realização';
COMMENT ON COLUMN goals.fulfillment_resolved_by IS 'ID do usuário (pai) que resolveu a solicitação';
