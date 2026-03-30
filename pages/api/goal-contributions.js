import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetContributions(req, res);
      case 'POST':
        return await handleCreateContribution(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Goal Contributions API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetContributions(req, res) {
  const { goal_id, child_id, limit = 50 } = req.query;

  // ✅ BUG FIX #7: Não podemos filtrar por 'goal_deposit' ou 'related_goal_id' (não existem no schema básico)
  // Filtrar por categoria 'Sonhos' e type 'spending' para pegar contribuições para metas
  let query = supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('type', 'spending')
    .eq('category', 'Sonhos')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  // Nota: 'related_goal_id' não existe no schema básico, então não podemos filtrar por goal_id específica
  // Este filtro foi removido até que o schema seja atualizado

  if (child_id) {
    query = query.eq('child_id', child_id);
  }

  const { data: contributions, error } = await query;

  if (error) {
    console.error('Error fetching contributions:', error);
    return res
      .status(400)
      .json({ error: 'Failed to fetch contributions', details: error.message });
  }

  return res.status(200).json({
    success: true,
    data: contributions,
    count: contributions.length,
  });
}

async function handleCreateContribution(req, res) {
  const {
    goal_id,
    child_id,
    amount,
    description,
    contribution_type = 'manual',
  } = req.body;

  // Validation
  if (!goal_id || !child_id || !amount || amount <= 0) {
    return res.status(400).json({
      error: 'Missing required fields: goal_id, child_id, amount',
    });
  }

  try {
    // Start transaction - buscar balance E total_spent
    const { data: child, error: childError } = await supabaseAdmin
      .from('children')
      .select('balance, total_spent')
      .eq('id', child_id)
      .single();

    if (childError) {
      return res.status(400).json({
        error: 'Child not found',
        details: childError.message,
      });
    }

    if (child.balance < amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        current_balance: child.balance,
        requested_amount: amount,
      });
    }

    // Get current goal data
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', goal_id)
      .single();

    if (goalError) {
      return res.status(400).json({
        error: 'Goal not found',
        details: goalError.message,
      });
    }

    if (goal.is_completed) {
      return res.status(400).json({
        error: 'Cannot contribute to completed goal',
      });
    }

    // ✅ BUG FIX #7: Schema básico só tem: child_id, type, amount, description, category
    // Campos removidos (não existem no schema básico): status, requires_approval, approved_by_parent, related_goal_id
    // Type alterado: 'goal_deposit' → 'spending' (goal_deposit não está no CHECK constraint)
    const { data: contribution, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          child_id,
          type: 'spending', // Usando 'spending' pois 'goal_deposit' não existe no schema básico
          amount: parseFloat(amount),
          description: description || `Contribuição para ${goal.title}`,
          category: 'Sonhos',
        },
      ])
      .select()
      .single();

    if (transactionError) {
      return res.status(400).json({
        error: 'Failed to create contribution transaction',
        details: transactionError.message,
      });
    }

    // Update child balance and total_spent (incremento atômico — evita race condition)
    const { data: balanceResult, error: balanceError } =
      await supabaseAdmin.rpc('adjust_child_balance', {
        p_child_id: child_id,
        p_balance_delta: -parseFloat(amount),
        p_total_earned_delta: 0,
        p_total_spent_delta: parseFloat(amount),
      });

    if (balanceError) {
      console.error('Error updating child balance:', balanceError);
      // Don't fail the request, just log the error
    }

    const newChildBalance =
      balanceResult?.[0]?.new_balance ?? child.balance - amount;

    // Update goal current amount (incremento atômico — evita race condition)
    const { data: goalResult, error: goalRpcError } = await supabaseAdmin.rpc(
      'adjust_goal_amount',
      {
        p_goal_id: goal_id,
        p_amount_delta: parseFloat(amount),
      }
    );

    const newGoalAmount =
      goalResult?.[0]?.new_amount ?? goal.current_amount + amount;
    const isCompleted = newGoalAmount >= goal.target_amount;

    // Se completou, atualizar flag is_completed
    let updatedGoal = null;
    if (isCompleted || goalRpcError) {
      const { data: goalData, error: goalUpdateError } = await supabaseAdmin
        .from('goals')
        .update({
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal_id)
        .select()
        .single();

      if (goalUpdateError) {
        console.error('Error updating goal:', goalUpdateError);
      }
      updatedGoal = goalData;
    } else {
      // Buscar goal atualizado para resposta
      const { data: goalData } = await supabaseAdmin
        .from('goals')
        .select()
        .eq('id', goal_id)
        .single();
      updatedGoal = goalData;
    }

    return res.status(201).json({
      success: true,
      data: {
        contribution,
        updated_goal: updatedGoal,
        new_child_balance: newChildBalance,
        goal_completed: isCompleted,
      },
      message: isCompleted
        ? 'Contribution made and goal completed! 🎉'
        : 'Contribution made successfully',
    });
  } catch (error) {
    console.error('Error in goal contribution transaction:', error);
    return res.status(500).json({
      error: 'Transaction failed',
      details: error.message,
    });
  }
}
