import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
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

  console.log('🚫 Cancelling goal:', {
    goal_id,
    child_id,
  });

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

    console.log('✅ Goal found:', {
      title: goal.title,
      current_amount: goal.current_amount,
      is_completed: goal.is_completed,
      is_active: goal.is_active,
    });

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

    // 4. Buscar saldo atual da criança
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

    const currentBalance = parseFloat(child.balance || 0);
    const goalAmount = parseFloat(goal.current_amount || 0);
    const newBalance = currentBalance + goalAmount;

    console.log('💰 Balance calculation:', {
      current_balance: currentBalance,
      goal_amount: goalAmount,
      new_balance: newBalance,
    });

    // 5. Atualizar saldo da criança (devolver dinheiro do sonho)
    const { error: balanceError } = await supabase
      .from('children')
      .update({ balance: newBalance })
      .eq('id', child_id);

    if (balanceError) {
      console.error('❌ Error updating child balance:', balanceError);
      return res.status(500).json({
        error: 'Failed to update child balance',
        details: balanceError.message,
      });
    }

    // 6. Marcar sonho como inativo (cancelado)
    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update({
        is_active: false,
        current_amount: 0, // Zerar o saldo do sonho
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating goal:', updateError);
      // Reverter atualização de saldo
      await supabase
        .from('children')
        .update({ balance: currentBalance })
        .eq('id', child_id);
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
      } else {
        console.log('✅ Transaction created for goal cancellation');
      }
    }

    console.log('✅ Goal cancelled successfully:', updatedGoal);

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
