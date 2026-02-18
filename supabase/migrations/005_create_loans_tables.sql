-- Migration 005: Criar tabelas de empréstimos (loans e loan_installments)
-- Data: 2026-02-18
-- Descrição: Adiciona sistema de empréstimos com parcelas para as crianças

-- ============================================================
-- TABELA DE EMPRÉSTIMOS ATIVOS
-- ============================================================
CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  installment_count INTEGER NOT NULL CHECK (installment_count > 0),
  installment_amount DECIMAL(10,2) NOT NULL CHECK (installment_amount > 0),
  paid_amount DECIMAL(10,2) DEFAULT 0 CHECK (paid_amount >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA DE PARCELAS INDIVIDUAIS
-- ============================================================
CREATE TABLE loan_installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE NOT NULL,
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  paid_from TEXT CHECK (paid_from IN ('allowance', 'manual', 'gift') OR paid_from IS NULL),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_installment_per_loan UNIQUE(loan_id, installment_number)
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX idx_loans_child_id ON loans(child_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_created_at ON loans(created_at DESC);
CREATE INDEX idx_installments_loan_id ON loan_installments(loan_id);
CREATE INDEX idx_installments_status ON loan_installments(status);
CREATE INDEX idx_installments_due_date ON loan_installments(due_date);

-- ============================================================
-- TRIGGER PARA UPDATED_AT
-- ============================================================
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS nas tabelas
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES PARA LOANS
-- ============================================================

-- Permitir que pais visualizem empréstimos dos filhos da sua família
CREATE POLICY "View loans for family children" ON loans
  FOR SELECT USING (
    child_id IN (
      SELECT children.id FROM children
      WHERE children.family_id IN (SELECT families.id FROM families)
    )
  );

-- Permitir que pais criem empréstimos para filhos da sua família
CREATE POLICY "Insert loans for family children" ON loans
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT children.id FROM children
      WHERE children.family_id IN (SELECT families.id FROM families)
    )
  );

-- Permitir que pais atualizem empréstimos dos filhos da sua família
CREATE POLICY "Update loans for family children" ON loans
  FOR UPDATE USING (
    child_id IN (
      SELECT children.id FROM children
      WHERE children.family_id IN (SELECT families.id FROM families)
    )
  );

-- Permitir que pais cancelem empréstimos dos filhos da sua família
CREATE POLICY "Delete loans for family children" ON loans
  FOR DELETE USING (
    child_id IN (
      SELECT children.id FROM children
      WHERE children.family_id IN (SELECT families.id FROM families)
    )
  );

-- ============================================================
-- POLICIES PARA LOAN_INSTALLMENTS
-- ============================================================

-- Permitir que pais visualizem parcelas de empréstimos dos filhos da sua família
CREATE POLICY "View installments for family children" ON loan_installments
  FOR SELECT USING (
    loan_id IN (SELECT loans.id FROM loans)
  );

-- Permitir que pais criem parcelas de empréstimos para filhos da sua família
CREATE POLICY "Insert installments for family children" ON loan_installments
  FOR INSERT WITH CHECK (
    loan_id IN (SELECT loans.id FROM loans)
  );

-- Permitir que pais atualizem parcelas de empréstimos dos filhos da sua família
CREATE POLICY "Update installments for family children" ON loan_installments
  FOR UPDATE USING (
    loan_id IN (SELECT loans.id FROM loans)
  );

-- ============================================================
-- COMENTÁRIOS EXPLICATIVOS
-- ============================================================

COMMENT ON TABLE loans IS 'Empréstimos ativos das crianças com informações de parcelas';
COMMENT ON TABLE loan_installments IS 'Parcelas individuais de cada empréstimo';

COMMENT ON COLUMN loans.purchase_request_id IS 'Referência ao pedido de compra que originou este empréstimo (opcional)';
COMMENT ON COLUMN loans.paid_amount IS 'Valor total já pago deste empréstimo (soma das parcelas pagas)';
COMMENT ON COLUMN loans.status IS 'Status do empréstimo: active (ativo), paid_off (quitado), cancelled (cancelado)';

COMMENT ON COLUMN loan_installments.paid_from IS 'Origem do pagamento: allowance (mesada), manual (pagamento manual), gift (presente)';
COMMENT ON COLUMN loan_installments.status IS 'Status da parcela: pending (pendente), paid (paga), overdue (atrasada)';
