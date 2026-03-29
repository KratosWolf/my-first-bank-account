import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleCancelGoal(req, res);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cancel Goal API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleCancelGoal(req, res) {
  const { goal_id, child_id } = req.body;

  // Validation - campos obrigatórios
  if (!goal_id || !child_id) {
    return res.status(400).json({
      error: 'Missing required fields: goal_id, child_id',
    });
  }

  try {
    // 1. Buscar o sonho e validar que pertence à criança
    const { data: goal, error: goalError } = await supabase
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

    // 2. Validar que o sonho não está completo/realizado
    if (goal.is_completed) {
      return res.status(400).json({
        error: 'Cannot cancel a completed goal',
        goal_title: goal.title,
      });
    }

    // 3. Validar que o sonho já não foi cancelado
    if (goal.is_active === false) {
      return res.status(400).json({
        error: 'Goal is already cancelled',
        goal_title: goal.title,
      });
    }

    // 4. Buscar nome da criança (para resposta)
    const { data: child, error: childError } = await supabase
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

    const goalAmount = parseFloat(goal.current_amount || 0);

    // 5. Devolver dinheiro do sonho para a criança (incremento atômico — evita race condition)
    const { data: balanceResult, error: balanceError } = await supabase.rpc(
      'adjust_child_balance',
      {
        p_child_id: child_id,
        p_balance_delta: goalAmount,
        p_total_earned_delta: 0,
        p_total_spent_delta: 0,
      }
    );

    if (balanceError) {
      console.error('❌ Error updating child balance:', balanceError);
      return res.status(500).json({
        error: 'Failed to update child balance',
        details: balanceError.message,
      });
    }

    const newBalance =
      balanceResult?.[0]?.new_balance ??
      parseFloat(child.balance || 0) + goalAmount;

    // 6. Marcar sonho como inativo (cancelado)
    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update({
        is_active: false,
        current_amount: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating goal:', updateError);
      // Reverter atualização de saldo (atômico)
      await supabase.rpc('adjust_child_balance', {
        p_child_id: child_id,
        p_balance_delta: -goalAmount,
        p_total_earned_delta: 0,
        p_total_spent_delta: 0,
      });
      return res.status(500).json({
        error: 'Failed to cancel goal',
        details: updateError.message,
      });
    }

    // 7. Criar transação de devolução (goal_withdrawal)
    if (goalAmount > 0) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            child_id: child_id,
            type: 'goal_withdrawal',
            amount: goalAmount,
            description: `Sonho cancelado: ${goal.title}`,
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
    }

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: `Sonho "${goal.title}" cancelado! R$ ${goalAmount.toFixed(2)} voltou para sua conta.`,
      data: {
        goal: updatedGoal,
        child_name: child.name,
        returned_amount: goalAmount,
        new_balance: newBalance,
        previous_balance: currentBalance,
      },
    });
  } catch (error) {
    console.error('❌ Error in cancel goal transaction:', error);
    return res.status(500).json({
      error: 'Transaction failed',
      details: error.message,
    });
  }
}
