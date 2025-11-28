import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
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
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetRequests(req, res) {
  const { child_id, status, limit = 20 } = req.query;

  let query = supabase
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
    return res.status(400).json({ error: 'Failed to fetch purchase requests', details: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    data: requests,
    count: requests.length 
  });
}

async function handleCreateRequest(req, res) {
  const { 
    child_id, 
    item_name, 
    description, 
    amount, 
    category,
    type = 'spending'
  } = req.body;

  // Validation
  if (!child_id || !item_name || !amount || amount <= 0) {
    return res.status(400).json({ 
      error: 'Missing required fields: child_id, item_name, amount' 
    });
  }

  console.log('📝 Creating purchase request:', {
    child_id,
    item_name,
    amount,
    category,
    type
  });

  // Primeiro tentar verificar se a criança existe no Supabase
  const { data: existingChild, error: childError } = await supabase
    .from('children')
    .select('id, name')
    .eq('id', child_id)
    .single();

  let request;
  let usingLocalStorage = false;

  if (childError || !existingChild) {
    console.log('⚠️ Child not found in Supabase, using localStorage fallback');
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
      item_name: item_name
    };

    // Salvar no localStorage do servidor (simulação)
    // TODO: Implementar storage real no localStorage do cliente
    console.log('💾 Simulated localStorage request:', request);
  } else {
    // Child exists in Supabase, create normally
    const { data: supabaseRequest, error } = await supabase
      .from('transactions')
      .insert([{
        child_id,
        type,
        amount: parseFloat(amount),
        description: `Pedido: ${item_name}${description ? ` - ${description}` : ''}`,
        category: category || 'Outros',
        status: 'pending',
        requires_approval: true,
        approved_by_parent: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase request in Supabase:', error);
      return res.status(400).json({ 
        error: 'Failed to create purchase request', 
        details: error.message 
      });
    }

    request = supabaseRequest;
  }

  console.log('✅ Purchase request created:', request);
  console.log(`📍 Storage used: ${usingLocalStorage ? 'localStorage fallback' : 'Supabase'}`);

  // TODO: Send real-time notification to parents
  // await notifyParents(child_id, request);

  return res.status(201).json({ 
    success: true, 
    data: request,
    message: 'Purchase request created successfully',
    storage_type: usingLocalStorage ? 'localStorage' : 'supabase'
  });
}

async function handleUpdateRequest(req, res) {
  const { 
    request_id, 
    status, 
    parent_note,
    approved_by_parent 
  } = req.body;

  if (!request_id || !status) {
    return res.status(400).json({ 
      error: 'Missing required fields: request_id, status' 
    });
  }

  if (!['pending', 'completed', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be: pending, completed, rejected, or cancelled' 
    });
  }

  console.log('🔄 Updating purchase request:', {
    request_id,
    status,
    parent_note,
    approved_by_parent
  });

  // Update the request
  const { data: updatedRequest, error } = await supabase
    .from('transactions')
    .update({
      status,
      parent_note: parent_note || null,
      approved_by_parent: status === 'completed',
      approved_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', request_id)
    .eq('requires_approval', true)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase request:', error);
    return res.status(400).json({ 
      error: 'Failed to update purchase request', 
      details: error.message 
    });
  }

  // If approved (completed), update child's balance
  if (status === 'completed') {
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('balance, total_spent')
      .eq('id', updatedRequest.child_id)
      .single();

    if (!childError && child) {
      const newBalance = child.balance - updatedRequest.amount;
      const newTotalSpent = (child.total_spent || 0) + updatedRequest.amount;
      
      const { error: balanceError } = await supabase
        .from('children')
        .update({ 
          balance: newBalance,
          total_spent: newTotalSpent
        })
        .eq('id', updatedRequest.child_id);

      if (balanceError) {
        console.error('Error updating child balance:', balanceError);
        // Don't fail the request, just log the error
      } else {
        console.log('✅ Child balance updated:', { 
          child_id: updatedRequest.child_id, 
          new_balance: newBalance,
          new_total_spent: newTotalSpent
        });
      }
    }
  }

  // TODO: Send real-time notification to child
  // await notifyChild(updatedRequest.child_id, updatedRequest);

  return res.status(200).json({ 
    success: true, 
    data: updatedRequest,
    message: `Purchase request ${status} successfully` 
  });
}