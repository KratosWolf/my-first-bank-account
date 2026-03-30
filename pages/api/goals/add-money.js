import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleAddMoney(req, res);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Add Money to Goal API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleAddMoney(req, res) {
  const { goal_id, child_id, amount } = req.body;

  // Validation - campos obrigatórios
  if (!goal_id || !child_id || amount === undefined || amount === null) {
    return res.status(400).json({
      error: 'Missing required fields: goal_id, child_id, amount',
    });
  }

  // Validar que amount é positivo
  const depositAmount = parseFloat(amount);
  if (depositAmount <= 0 || isNaN(depositAmount)) {
    return res.status(400).json({
      error: 'Amount must be a positive number',
      provided_amount: amount,
    });
  }

  try {
    // 1. Buscar o sonho e validar que pertence à criança
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', goal_id)
      .eq('child_id', child_id)
      .single();

    if (goalError || !goal) {
      console.error(
        '❌ Goal not found or does not belong to child:',
        goalError
      );
      return res.status(404).json({
        error: 'Goal not found or does not belong to this child',
        details: goalError?.message,
      });
    }

    // 2. Validar que o sonho está ativo
    if (!goal.is_active) {
      return res.status(400).json({
        error: 'Cannot add money to an inactive goal',
        goal_title: goal.title,
      });
    }

    // 3. Validar que o sonho não está completo
    if (goal.is_completed) {
      return res.status(400).json({
        error: 'Cannot add money to a completed goal',
        goal_title: goal.title,
      });
    }

    // 4. Buscar saldo atual da criança (para validação)
    const { data: child, error: childError } = await supabaseAdmin
      .from('children')
      .select('balance, name')
      .eq('id', child_id)
      .single();

    if (childError || !child) {
      console.error('❌ Child not found:', childError);
      return res.status(404).json({
        error: 'Child not found',
        details: childError?.message,
      });
    }

    const currentBalance = parseFloat(child.balance || 0);

    // 5. Validar que a criança tem saldo suficiente
    if (currentBalance < depositAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        current_balance: currentBalance,
        required_amount: depositAmount,
        missing_amount: depositAmount - currentBalance,
      });
    }

    // 6. Debitar saldo da criança (incremento atômico — evita race condition)
    const { data: balanceResult, error: balanceError } =
      await supabaseAdmin.rpc('adjust_child_balance', {
        p_child_id: child_id,
        p_balance_delta: -depositAmount,
        p_total_earned_delta: 0,
        p_total_spent_delta: 0,
      });

    if (balanceError) {
      console.error('❌ Error updating child balance:', balanceError);
      return res.status(500).json({
        error: 'Failed to update child balance',
        details: balanceError.message,
      });
    }

    const newBalance =
      balanceResult?.[0]?.new_balance ?? currentBalance - depositAmount;

    // 7. Creditar saldo do sonho (incremento atômico — evita race condition)
    const { data: goalResult, error: goalRpcError } = await supabaseAdmin.rpc(
      'adjust_goal_amount',
      {
        p_goal_id: goal_id,
        p_amount_delta: depositAmount,
      }
    );

    if (goalRpcError) {
      console.error('❌ Error updating goal:', goalRpcError);
      // Reverter atualização de saldo da criança (atômico)
      await supabaseAdmin.rpc('adjust_child_balance', {
        p_child_id: child_id,
        p_balance_delta: depositAmount,
        p_total_earned_delta: 0,
        p_total_spent_delta: 0,
      });
      return res.status(500).json({
        error: 'Failed to add money to goal',
        details: goalRpcError.message,
      });
    }

    const newGoalAmount =
      goalResult?.[0]?.new_amount ??
      parseFloat(goal.current_amount || 0) + depositAmount;

    // Buscar goal atualizado para resposta
    const { data: updatedGoal } = await supabaseAdmin
      .from('goals')
      .select()
      .eq('id', goal_id)
      .single();

    // 8. Criar transação de depósito no sonho (goal_deposit)
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          child_id: child_id,
          type: 'goal_deposit',
          amount: -depositAmount, // Negativo porque saiu da conta
          description: `Depósito no sonho: ${goal.title}`,
          category: goal.category || 'other',
          created_at: new Date().toISOString(),
        },
      ]);

    if (transactionError) {
      console.warn(
        '⚠️ Failed to create transaction (non-critical):',
        transactionError
      );
      // Não falhar a operação por causa da transação
    }

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: `R$ ${depositAmount.toFixed(2)} adicionado ao sonho "${goal.title}"! 🎯`,
      data: {
        goal: updatedGoal,
        child_name: child.name,
        amount_added: depositAmount,
        new_goal_amount: newGoalAmount,
        new_balance: newBalance,
        previous_balance: currentBalance,
      },
    });
  } catch (error) {
    console.error('❌ Error in add money transaction:', error);
    return res.status(500).json({
      error: 'Transaction failed',
      details: error.message,
    });
  }
}
