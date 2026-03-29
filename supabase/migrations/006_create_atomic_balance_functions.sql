-- Migration 006: Funções atômicas para operações de saldo
-- Resolve race conditions em SELECT + UPDATE separados
-- Data: 2026-03-29

-- ============================================================
-- Função 1: Ajuste atômico de saldo da criança (children)
-- Aceita deltas para balance, total_earned e total_spent
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_child_balance(
  p_child_id UUID,
  p_balance_delta DECIMAL,
  p_total_earned_delta DECIMAL DEFAULT 0,
  p_total_spent_delta DECIMAL DEFAULT 0
)
RETURNS TABLE(new_balance DECIMAL, new_total_earned DECIMAL, new_total_spent DECIMAL)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE children
  SET
    balance = COALESCE(balance, 0) + p_balance_delta,
    total_earned = COALESCE(total_earned, 0) + p_total_earned_delta,
    total_spent = COALESCE(total_spent, 0) + p_total_spent_delta
  WHERE id = p_child_id
  RETURNING
    children.balance AS new_balance,
    children.total_earned AS new_total_earned,
    children.total_spent AS new_total_spent;
END;
$$;

-- ============================================================
-- Função 2: Ajuste atômico de saldo do sonho/meta (goals)
-- Aceita delta para current_amount
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_goal_amount(
  p_goal_id UUID,
  p_amount_delta DECIMAL
)
RETURNS TABLE(new_amount DECIMAL)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE goals
  SET
    current_amount = COALESCE(current_amount, 0) + p_amount_delta,
    updated_at = NOW()
  WHERE id = p_goal_id
  RETURNING goals.current_amount AS new_amount;
END;
$$;

-- ============================================================
-- Função 3: Ajuste atômico de valor pago do empréstimo (loans)
-- Retorna novo paid_amount e se está quitado
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_loan_paid(
  p_loan_id UUID,
  p_amount_delta DECIMAL
)
RETURNS TABLE(new_paid_amount DECIMAL, is_fully_paid BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE loans
  SET
    paid_amount = COALESCE(paid_amount, 0) + p_amount_delta,
    status = CASE
      WHEN (COALESCE(paid_amount, 0) + p_amount_delta) >= total_amount THEN 'paid_off'
      ELSE status
    END
  WHERE id = p_loan_id
  RETURNING
    loans.paid_amount AS new_paid_amount,
    (loans.paid_amount >= loans.total_amount) AS is_fully_paid;
END;
$$;
