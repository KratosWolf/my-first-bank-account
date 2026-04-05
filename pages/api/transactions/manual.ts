import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth } from '@/lib/apiAuth';

/**
 * API route para depósitos e retiradas manuais (dashboard dos pais).
 * Usa supabaseAdmin para bypass RLS.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { child_id, type, amount, description, category } = req.body;

  if (!child_id || !type || !amount || !description) {
    return res.status(400).json({
      error: 'Missing required fields: child_id, type, amount, description',
    });
  }

  if (type !== 'earning' && type !== 'spending') {
    return res.status(400).json({
      error: 'Invalid type. Must be: earning or spending',
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    // 1. Get current child balance
    const { data: child, error: childError } = await supabaseAdmin
      .from('children')
      .select('id, balance, total_earned, total_spent')
      .eq('id', child_id)
      .single();

    if (childError || !child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const newBalance =
      type === 'earning'
        ? child.balance + parsedAmount
        : child.balance - parsedAmount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 2. Update balance atomically via RPC
    const balanceDelta = type === 'earning' ? parsedAmount : -parsedAmount;
    const earnedDelta = type === 'earning' ? parsedAmount : 0;
    const spentDelta = type === 'spending' ? parsedAmount : 0;

    const { error: balanceError } = await supabaseAdmin.rpc(
      'adjust_child_balance',
      {
        p_child_id: child_id,
        p_balance_delta: balanceDelta,
        p_total_earned_delta: earnedDelta,
        p_total_spent_delta: spentDelta,
      }
    );

    if (balanceError) {
      console.error('❌ Error updating balance:', balanceError);
      return res.status(500).json({
        error: 'Failed to update balance',
        details: balanceError.message,
      });
    }

    // 3. Create transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          child_id,
          type,
          amount: parsedAmount,
          description,
          category: category || (type === 'earning' ? 'Depósito' : 'Retirada'),
          status: 'completed',
          requires_approval: false,
          approved_by_parent: true,
        },
      ])
      .select()
      .single();

    if (txError) {
      console.error('❌ Error creating transaction:', txError);
      // Rollback balance
      await supabaseAdmin.rpc('adjust_child_balance', {
        p_child_id: child_id,
        p_balance_delta: -balanceDelta,
        p_total_earned_delta: -earnedDelta,
        p_total_spent_delta: -spentDelta,
      });
      return res.status(500).json({
        error: 'Failed to create transaction. Balance reverted.',
        details: txError.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: transaction,
      newBalance: child.balance + balanceDelta,
    });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
