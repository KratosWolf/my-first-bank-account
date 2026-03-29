import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleRequestFulfillment(req, res);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Request Fulfillment API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleRequestFulfillment(req, res) {
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

    // 2. Validar que o sonho está completo (100%)
    if (goal.current_amount < goal.target_amount) {
      return res.status(400).json({
        error: 'Goal is not yet complete',
        current_amount: goal.current_amount,
        target_amount: goal.target_amount,
        percentage: Math.round(
          (goal.current_amount / goal.target_amount) * 100
        ),
      });
    }

    // 3. Validar que ainda não foi solicitado
    if (
      goal.fulfillment_status !== null &&
      goal.fulfillment_status !== undefined
    ) {
      const statusMessages = {
        pending: 'Goal fulfillment is already pending approval from parents',
        approved: 'Goal has already been approved and fulfilled',
        rejected: 'Goal fulfillment was rejected by parents',
      };

      return res.status(400).json({
        error:
          statusMessages[goal.fulfillment_status] ||
          'Goal fulfillment already requested',
        current_status: goal.fulfillment_status,
        requested_at: goal.fulfillment_requested_at,
      });
    }

    // 4. Atualizar o sonho com status 'pending'
    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update({
        fulfillment_status: 'pending',
        fulfillment_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating goal:', updateError);
      return res.status(500).json({
        error: 'Failed to request fulfillment',
        details: updateError.message,
      });
    }

    // 5. Buscar informações da criança para a resposta
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name')
      .eq('id', child_id)
      .single();

    const childName = child?.name || 'Criança';

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: 'Pedido enviado aos pais!',
      data: {
        goal: updatedGoal,
        child_name: childName,
        fulfillment_requested_at: updatedGoal.fulfillment_requested_at,
      },
    });
  } catch (error) {
    console.error('❌ Error in request fulfillment transaction:', error);
    return res.status(500).json({
      error: 'Transaction failed',
      details: error.message,
    });
  }
}
