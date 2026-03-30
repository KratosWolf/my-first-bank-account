import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetRequests(req, res);
      case 'POST':
        return await handleCreateRequest(req, res);
      case 'PUT':
        return await handleUpdateRequest(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetRequests(req, res) {
  const { child_id, status, limit = 20 } = req.query;

  let query = supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('requires_approval', true)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (child_id) {
    query = query.eq('child_id', child_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data: requests, error } = await query;

  if (error) {
    console.error('Error fetching purchase requests:', error);
    return res.status(400).json({
      error: 'Failed to fetch purchase requests',
      details: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    data: requests,
    count: requests.length,
  });
}

async function handleCreateRequest(req, res) {
  const {
    child_id,
    item_name,
    description,
    amount,
    category,
    type = 'spending',
  } = req.body;

  // Validation
  if (!child_id || !item_name || !amount || amount <= 0) {
    return res.status(400).json({
      error: 'Missing required fields: child_id, item_name, amount',
    });
  }

  // Primeiro tentar verificar se a criança existe no Supabase
  const { data: existingChild, error: childError } = await supabaseAdmin
    .from('children')
    .select('id, name')
    .eq('id', child_id)
    .single();

  let request;
  let usingLocalStorage = false;

  if (childError || !existingChild) {
    usingLocalStorage = true;

    // Criar um pedido simulado para localStorage
    request = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      child_id,
      type,
      amount: parseFloat(amount),
      description: `Pedido: ${item_name}${description ? ` - ${description}` : ''}`,
      category: category || 'Outros',
      status: 'pending',
      requires_approval: true,
      approved_by_parent: false,
      created_at: new Date().toISOString(),
      item_name: item_name,
    };

    // Salvar no localStorage do servidor (simulação)
    // TODO: Implementar storage real no localStorage do cliente
  } else {
    // Child exists in Supabase, create normally
    const { data: supabaseRequest, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          child_id,
          type,
          amount: parseFloat(amount),
          description: `Pedido: ${item_name}${description ? ` - ${description}` : ''}`,
          category: category || 'Outros',
          status: 'pending',
          requires_approval: true,
          approved_by_parent: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase request in Supabase:', error);
      return res.status(400).json({
        error: 'Failed to create purchase request',
        details: error.message,
      });
    }

    request = supabaseRequest;
  }

  // TODO: Send real-time notification to parents
  // await notifyParents(child_id, request);

  return res.status(201).json({
    success: true,
    data: request,
    message: 'Purchase request created successfully',
    storage_type: usingLocalStorage ? 'localStorage' : 'supabase',
  });
}

async function handleUpdateRequest(req, res) {
  const { request_id, status, parent_note, approved_by_parent } = req.body;

  if (!request_id || !status) {
    return res.status(400).json({
      error: 'Missing required fields: request_id, status',
    });
  }

  // Aceitar 'approved' do frontend e mapear para 'completed' (valor real no banco)
  const validStatuses = [
    'pending',
    'completed',
    'approved',
    'rejected',
    'cancelled',
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error:
        'Invalid status. Must be: pending, completed, approved, rejected, or cancelled',
    });
  }

  // Mapear 'approved' → 'completed' (compatibilidade frontend)
  const dbStatus = status === 'approved' ? 'completed' : status;

  // Update the request
  const { data: updatedRequest, error } = await supabaseAdmin
    .from('transactions')
    .update({
      status: dbStatus,
      parent_note: parent_note || null,
      approved_by_parent: dbStatus === 'completed',
      approved_at: dbStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', request_id)
    .eq('requires_approval', true)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase request:', error);
    return res.status(400).json({
      error: 'Failed to update purchase request',
      details: error.message,
    });
  }

  // If approved (completed), update child's balance (incremento atômico — evita race condition)
  if (dbStatus === 'completed') {
    const { data: balanceResult, error: balanceError } =
      await supabaseAdmin.rpc('adjust_child_balance', {
        p_child_id: updatedRequest.child_id,
        p_balance_delta: -updatedRequest.amount,
        p_total_earned_delta: 0,
        p_total_spent_delta: updatedRequest.amount,
      });

    if (balanceError) {
      console.error('Error updating child balance:', balanceError);

      // Reverter status da transação para 'pending' — não deixar aprovação sem débito
      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'pending',
          approved_by_parent: false,
          approved_at: null,
        })
        .eq('id', request_id);

      return res.status(500).json({
        error: 'Failed to update child balance. Approval was reverted.',
        details: balanceError.message,
      });
    }
  }

  return res.status(200).json({
    success: true,
    data: updatedRequest,
    message: `Purchase request ${status} successfully`,
  });
}
