import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetAnalytics(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetAnalytics(req, res) {
  const { family_id, child_id, period = '30' } = req.query;

  if (!family_id && !child_id) {
    return res.status(400).json({ error: 'family_id or child_id is required' });
  }

  try {
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Base query conditions
    let childQuery = supabase.from('children').select('*');
    
    if (family_id) {
      childQuery = childQuery.eq('family_id', family_id);
    } else if (child_id) {
      childQuery = childQuery.eq('id', child_id);
    }

    const { data: children, error: childrenError } = await childQuery;

    if (childrenError) {
      return res.status(400).json({ error: 'Failed to fetch children', details: childrenError.message });
    }

    if (!children || children.length === 0) {
      return res.status(404).json({ error: 'No children found' });
    }

    const childIds = children.map(c => c.id);

    // Get comprehensive analytics data
    const [
      transactionStats,
      goalStats,
      categorySpending,
      weeklyActivity,
      achievementStats,
      financialSummary
    ] = await Promise.all([
      getTransactionStats(childIds, startDate, periodDays),
      getGoalStats(childIds, startDate),
      getCategorySpending(childIds, startDate),
      getWeeklyActivity(childIds, startDate),
      getAchievementStats(childIds, startDate),
      getFinancialSummary(children)
    ]);

    const analytics = {
      period_days: periodDays,
      children: children.map(child => ({
        id: child.id,
        name: child.name,
        avatar: child.avatar || '👶',
        balance: child.balance || 0,
        level: child.current_level || 1,
        xp: child.xp || 0
      })),
      financial_summary: financialSummary,
      transaction_stats: transactionStats,
      goal_stats: goalStats,
      category_spending: categorySpending,
      weekly_activity: weeklyActivity,
      achievement_stats: achievementStats,
      insights: generateInsights(transactionStats, goalStats, categorySpending, children)
    };

    return res.status(200).json({ 
      success: true, 
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
}

async function getTransactionStats(childIds, startDate, periodDays) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('child_id', childIds)
    .gte('created_at', startDate);

  const stats = {
    total_transactions: transactions?.length || 0,
    total_spent: 0,
    total_earned: 0,
    avg_transaction: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    by_type: {}
  };

  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      if (tx.type === 'spending' || tx.type === 'goal_deposit') {
        stats.total_spent += tx.amount;
      } else if (tx.type === 'earning' || tx.type === 'allowance') {
        stats.total_earned += tx.amount;
      }

      if (tx.requires_approval) {
        if (tx.status === 'pending') stats.pending_requests++;
        else if (tx.status === 'approved') stats.approved_requests++;
        else if (tx.status === 'rejected') stats.rejected_requests++;
      }

      stats.by_type[tx.type] = (stats.by_type[tx.type] || 0) + 1;
    });

    stats.avg_transaction = stats.total_spent > 0 ? stats.total_spent / transactions.length : 0;
  }

  return stats;
}

async function getGoalStats(childIds, startDate) {
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .in('child_id', childIds);

  const { data: recentGoals } = await supabase
    .from('goals')
    .select('*')
    .in('child_id', childIds)
    .gte('created_at', startDate);

  const stats = {
    total_goals: goals?.length || 0,
    active_goals: goals?.filter(g => g.is_active && !g.is_completed).length || 0,
    completed_goals: goals?.filter(g => g.is_completed).length || 0,
    new_goals_this_period: recentGoals?.length || 0,
    total_target_amount: 0,
    total_current_amount: 0,
    avg_completion_rate: 0,
    by_category: {}
  };

  if (goals && goals.length > 0) {
    goals.forEach(goal => {
      stats.total_target_amount += goal.target_amount;
      stats.total_current_amount += goal.current_amount;
      
      const category = goal.category || 'other';
      if (!stats.by_category[category]) {
        stats.by_category[category] = {
          count: 0,
          total_target: 0,
          total_current: 0
        };
      }
      stats.by_category[category].count++;
      stats.by_category[category].total_target += goal.target_amount;
      stats.by_category[category].total_current += goal.current_amount;
    });

    stats.avg_completion_rate = stats.total_target_amount > 0 
      ? Math.round((stats.total_current_amount / stats.total_target_amount) * 100)
      : 0;
  }

  return stats;
}

async function getCategorySpending(childIds, startDate) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('child_id', childIds)
    .gte('created_at', startDate)
    .in('type', ['spending', 'goal_deposit']);

  const categoryData = {};

  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      const category = tx.category || 'Outros';
      if (!categoryData[category]) {
        categoryData[category] = {
          amount: 0,
          count: 0,
          percentage: 0
        };
      }
      categoryData[category].amount += tx.amount;
      categoryData[category].count++;
    });

    const totalSpent = Object.values(categoryData).reduce((sum, cat) => sum + cat.amount, 0);
    
    Object.keys(categoryData).forEach(category => {
      categoryData[category].percentage = totalSpent > 0 
        ? Math.round((categoryData[category].amount / totalSpent) * 100)
        : 0;
    });
  }

  return Object.entries(categoryData)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);
}

async function getWeeklyActivity(childIds, startDate) {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('child_id', childIds)
    .gte('created_at', startDate);

  const weeklyData = {};

  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      const date = new Date(tx.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week_start: weekKey,
          transaction_count: 0,
          total_amount: 0,
          spending_amount: 0,
          earning_amount: 0
        };
      }

      weeklyData[weekKey].transaction_count++;
      
      if (tx.type === 'spending' || tx.type === 'goal_deposit') {
        weeklyData[weekKey].spending_amount += tx.amount;
      } else if (tx.type === 'earning' || tx.type === 'allowance') {
        weeklyData[weekKey].earning_amount += tx.amount;
      }
      
      weeklyData[weekKey].total_amount += tx.amount;
    });
  }

  return Object.values(weeklyData).sort((a, b) => new Date(a.week_start) - new Date(b.week_start));
}

async function getAchievementStats(childIds, startDate) {
  const { data: recentBadges } = await supabase
    .from('child_badges')
    .select('*, badges(*)')
    .in('child_id', childIds)
    .gte('earned_at', startDate);

  const { data: allBadges } = await supabase
    .from('child_badges')
    .select('*')
    .in('child_id', childIds);

  return {
    total_achievements: allBadges?.length || 0,
    new_achievements_this_period: recentBadges?.length || 0,
    recent_badges: recentBadges || []
  };
}

async function getFinancialSummary(children) {
  const summary = {
    total_family_balance: 0,
    total_family_earned: 0,
    total_family_spent: 0,
    average_child_balance: 0,
    highest_balance: 0,
    lowest_balance: 0
  };

  if (children && children.length > 0) {
    const balances = children.map(c => c.balance || 0);
    const earned = children.map(c => c.total_earned || 0);
    const spent = children.map(c => c.total_spent || 0);

    summary.total_family_balance = balances.reduce((sum, b) => sum + b, 0);
    summary.total_family_earned = earned.reduce((sum, e) => sum + e, 0);
    summary.total_family_spent = spent.reduce((sum, s) => sum + s, 0);
    summary.average_child_balance = summary.total_family_balance / children.length;
    summary.highest_balance = Math.max(...balances);
    summary.lowest_balance = Math.min(...balances);
  }

  return summary;
}

function generateInsights(transactionStats, goalStats, categorySpending, children) {
  const insights = [];

  // Spending insights
  if (transactionStats.total_spent > 0) {
    const topCategory = categorySpending[0];
    if (topCategory && topCategory.percentage > 40) {
      insights.push({
        type: 'warning',
        title: 'Concentração de Gastos',
        description: `${topCategory.percentage}% dos gastos estão na categoria "${topCategory.category}". Considere diversificar.`,
        icon: '⚠️'
      });
    }
  }

  // Goal insights
  if (goalStats.avg_completion_rate > 80) {
    insights.push({
      type: 'success',
      title: 'Excelente Progresso!',
      description: `As crianças estão ${goalStats.avg_completion_rate}% próximas de completar suas metas em média.`,
      icon: '🎯'
    });
  } else if (goalStats.avg_completion_rate < 30) {
    insights.push({
      type: 'info',
      title: 'Metas Desafiadoras',
      description: 'As metas podem estar muito altas. Considere dividir em objetivos menores.',
      icon: '💡'
    });
  }

  // Request approval insights
  if (transactionStats.pending_requests > 5) {
    insights.push({
      type: 'info',
      title: 'Solicitações Pendentes',
      description: `Existem ${transactionStats.pending_requests} pedidos aguardando aprovação.`,
      icon: '⏰'
    });
  }

  // Activity insights
  if (transactionStats.total_transactions === 0) {
    insights.push({
      type: 'info',
      title: 'Pouca Atividade',
      description: 'Incentive as crianças a participar mais das atividades financeiras.',
      icon: '📈'
    });
  }

  return insights;
}