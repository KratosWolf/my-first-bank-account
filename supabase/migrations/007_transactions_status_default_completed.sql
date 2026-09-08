-- Migration 007 — DEFAULT de transactions.status: 'pending' -> 'completed'
-- Task 3.14 (redefinida) — 2026-09-08
--
-- PORQUÊ
-- A tabela transactions foi desenhada para um modelo "criança pede, pai aprova"
-- (4 das suas colunas são de aprovação). Mesada, juros e depósito directo
-- chegaram depois e não precisam de aprovação nenhuma, mas o DEFAULT nunca foi
-- revisto. Resultado: qualquer INSERT que omita `status` cria uma transação
-- não-confirmada em silêncio — 17 transações no banco estão assim, e o extracto
-- (que filtra status='completed' desde 2026-04-05) nunca as mostrou.
--
-- Decisão do Tiago (2026-09-08): dinheiro lançado por ele é real no momento em
-- que é lançado. O estado 'pending' continua a existir, mas só quando o código
-- o pede EXPLICITAMENTE — nunca por omissão.
--
-- ÂMBITO
-- É SÓ o DEFAULT. Nenhuma linha de dados é alterada por esta migration.
-- As 17 transações pendentes antigas ficam intactas (ver Task 3.18).
-- Não é adicionado NOT NULL nem CHECK novo — o CHECK existente
-- (transactions_status_check) já aceita 'completed'.
--
-- NÃO AFECTA O FLUXO DE APROVAÇÃO
-- pages/api/purchase-requests.js escreve status:'pending' explicitamente nos
-- três sítios que importam (criação do pedido, transação associada e reversão
-- quando o débito falha). Um pedido continua estacionado à espera do pai.

ALTER TABLE transactions ALTER COLUMN status SET DEFAULT 'completed';

-- Rollback:
-- ALTER TABLE transactions ALTER COLUMN status SET DEFAULT 'pending';
