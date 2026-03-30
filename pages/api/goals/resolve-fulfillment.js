import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleResolveFulfillment(req, res, session);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Resolve Fulfillment API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleResolveFulfillment(req, res, session) {
  const { goal_id, action } = req.body;
  // parent_id vem da sessão autenticada (não do body — evita spoofing)
  const parent_id = session.user.id;

  // Validation - campos obrigatórios
  if (!goal_id || !action) {
    return res.status(400).json({
      error: 'Missing required fields: goal_id, action',
    });
  }

  // Validar ação
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      error: 'Invalid action. Must be "approve" or "reject"',
    });
  }

  try {
    // 1. Buscar o sonho
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', goal_id)
      .single();

    if (goalError || !goal) {
      console.error('❌ Goal not found:', goalError);
      return res.status(404).json({
        error: 'Goal not found',
        details: goalError?.message,
      });
    }

    // 2. Validar que o sonho está com status 'pending'
    if (goal.fulfillment_status !== 'pending') {
      const statusMessages = {
        null: 'Goal fulfillment has not been requested yet',
        undefined: 'Goal fulfillment has not been requested yet',
        approved: 'Goal has already been approved',
        rejected: 'Goal has already been rejected',
      };

      return res.status(400).json({
        error:
          statusMessages[goal.fulfillment_status] ||
          'Goal is not pending approval',
        current_status: goal.fulfillment_status || 'not_requested',
      });
    }

    // 3. Se APROVAR, debitar saldo do sonho e criar transação
    let newChildBalance = null;
    if (action === 'approve') {
      // Buscar saldo atual da criança
      const { data: child, error: childError } = await supabaseAdmin
        .from('children')
        .select('balance, name')
        .eq('id', goal.child_id)
        .single();

      if (childError || !child) {
        console.error('❌ Child not found:', childError);
        return res.status(404).json({
          error: 'Child not found for this goal',
          details: childError?.message,
        });
      }

      const goalAmount = parseFloat(goal.current_amount || 0);

      // Criar transação de realização do sonho (goal_purchase)
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert([
          {
            child_id: goal.child_id,
            type: 'goal_purchase',
            amount: -goalAmount, // Negativo porque é débito (saiu do sonho)
            description: `Sonho realizado: ${goal.title}`,
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

      newChildBalance = child.balance; // Mantém o saldo da criança (dinheiro já estava no sonho)
    }

    // 4. Preparar dados de atualização baseado na ação
    const updateData = {
      fulfillment_resolved_at: new Date().toISOString(),
      fulfillment_resolved_by: parent_id,
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.fulfillment_status = 'approved';
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
      updateData.current_amount = 0; // Zerar saldo do sonho (dinheiro foi usado)
    } else if (action === 'reject') {
      updateData.fulfillment_status = 'rejected';
    }

    // 5. Atualizar o sonho
    const { data: updatedGoal, error: updateError } = await supabaseAdmin
      .from('goals')
      .update(updateData)
      .eq('id', goal_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating goal:', updateError);
      return res.status(500).json({
        error: 'Failed to resolve fulfillment',
        details: updateError.message,
      });
    }

    // 5. Buscar informações da criança para a resposta
    const { data: child, error: childError } = await supabaseAdmin
      .from('children')
      .select('name')
      .eq('id', goal.child_id)
      .single();

    const childName = child?.name || 'Criança';

    // 6. Preparar mensagem de sucesso
    const successMessage =
      action === 'approve'
        ? `Sonho aprovado! 🎉 Lembre-se de comprar: ${goal.title}`
        : `Solicitação recusada. ${childName} será notificado.`;

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        goal: updatedGoal,
        child_name: childName,
        action: action,
        resolved_at: updateData.fulfillment_resolved_at,
        resolved_by: parent_id,
      },
    });
  } catch (error) {
    console.error('❌ Error in resolve fulfillment transaction:', error);
    return res.status(500).json({
      error: 'Transaction failed',
      details: error.message,
    });
  }
}
