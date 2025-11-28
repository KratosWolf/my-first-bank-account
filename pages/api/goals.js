import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetGoals(req, res);
      case 'POST':
        return await handleCreateGoal(req, res);
      case 'PUT':
        return await handleUpdateGoal(req, res);
      case 'DELETE':
        return await handleDeleteGoal(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Goals API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetGoals(req, res) {
  const { child_id, is_completed, limit = 50 } = req.query;

  let query = supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (child_id) {
    query = query.eq('child_id', child_id);
  }

  if (is_completed !== undefined) {
    query = query.eq('is_completed', is_completed === 'true');
  }

  const { data: goals, error } = await query;

  if (error) {
    console.error('Error fetching goals:', error);
    return res.status(400).json({ error: 'Failed to fetch goals', details: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    data: goals,
    count: goals.length 
  });
}

async function handleCreateGoal(req, res) {
  const {
    child_id,
    title,
    description,
    target_amount,
    category,
    target_date
  } = req.body;

  // Validation
  if (!child_id || !title || !target_amount || target_amount <= 0) {
    return res.status(400).json({
      error: 'Missing required fields: child_id, title, target_amount'
    });
  }

  // ✅ BUG FIX #5: Map category to valid values (CHECK constraint exists)
  const validCategories = ['toy', 'game', 'book', 'clothes', 'experience', 'education', 'charity', 'savings', 'other'];
  const normalizedCategory = category && validCategories.includes(category.toLowerCase())
    ? category.toLowerCase()
    : 'other';

  console.log('🎯 Creating goal:', {
    child_id,
    title,
    target_amount,
    category: normalizedCategory
  });

  const { data: goal, error } = await supabase
    .from('goals')
    .insert([{
      child_id,
      title,
      description: description || null,
      target_amount: parseFloat(target_amount),
      current_amount: 0,
      category: normalizedCategory,
      target_date: target_date || null,
      is_completed: false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating goal:', error);
    return res.status(400).json({ 
      error: 'Failed to create goal', 
      details: error.message 
    });
  }

  console.log('✅ Goal created:', goal);

  return res.status(201).json({ 
    success: true, 
    data: goal,
    message: 'Goal created successfully' 
  });
}

async function handleUpdateGoal(req, res) {
  const {
    goal_id,
    title,
    description,
    target_amount,
    current_amount,
    category,
    target_date,
    is_completed
  } = req.body;

  if (!goal_id) {
    return res.status(400).json({
      error: 'Missing required field: goal_id'
    });
  }

  console.log('🔄 Updating goal:', { goal_id, ...req.body });

  // Build update object with only provided fields
  // ✅ BUG FIX #5: Removed 'priority' and 'is_active' fields that don't exist in table
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (target_amount !== undefined) updateData.target_amount = parseFloat(target_amount);
  if (current_amount !== undefined) updateData.current_amount = parseFloat(current_amount);
  if (category !== undefined) updateData.category = category;
  if (target_date !== undefined) updateData.target_date = target_date;
  if (is_completed !== undefined) {
    updateData.is_completed = is_completed;
    // Note: 'completed_at' column doesn't exist in schema either
  }

  updateData.updated_at = new Date().toISOString();

  const { data: updatedGoal, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', goal_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating goal:', error);
    return res.status(400).json({ 
      error: 'Failed to update goal', 
      details: error.message 
    });
  }

  console.log('✅ Goal updated:', updatedGoal);

  return res.status(200).json({ 
    success: true, 
    data: updatedGoal,
    message: 'Goal updated successfully' 
  });
}

async function handleDeleteGoal(req, res) {
  const { goal_id } = req.body;

  if (!goal_id) {
    return res.status(400).json({ 
      error: 'Missing required field: goal_id' 
    });
  }

  console.log('🗑️ Deleting goal:', goal_id);

  const { data: deletedGoal, error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goal_id)
    .select()
    .single();

  if (error) {
    console.error('Error deleting goal:', error);
    return res.status(400).json({ 
      error: 'Failed to delete goal', 
      details: error.message 
    });
  }

  console.log('✅ Goal deleted:', deletedGoal);

  return res.status(200).json({ 
    success: true, 
    data: deletedGoal,
    message: 'Goal deleted successfully' 
  });
}