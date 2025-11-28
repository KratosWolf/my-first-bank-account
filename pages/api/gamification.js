import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetGameData(req, res);
      case 'POST':
        return await handleProcessAction(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Gamification API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetGameData(req, res) {
  const { child_id } = req.query;

  if (!child_id) {
    return res.status(400).json({ error: 'child_id is required' });
  }

  try {
    // Get child data with current level and XP
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', child_id)
      .single();

    if (childError) {
      return res.status(400).json({ error: 'Child not found', details: childError.message });
    }

    // Calculate level progression
    const levelData = calculateLevelProgression(child.xp || 0);

    // Get recent achievements (badges earned in last 30 days)
    const { data: recentBadges } = await supabase
      .from('child_badges')
      .select('*, badges(*)')
      .eq('child_id', child_id)
      .gte('earned_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('earned_at', { ascending: false });

    // Get current streaks
    const { data: streaks } = await supabase
      .from('child_streaks')
      .select('*')
      .eq('child_id', child_id)
      .eq('is_active', true);

    // Calculate next achievements they're close to earning
    const nextAchievements = await calculateNextAchievements(child_id, child);

    const gameData = {
      child: {
        ...child,
        current_level: levelData.currentLevel,
        xp_to_next_level: levelData.xpToNextLevel,
        total_xp: child.xp || 0,
        level_progress_percentage: levelData.progressPercentage
      },
      recent_achievements: recentBadges || [],
      active_streaks: streaks || [],
      next_achievements: nextAchievements,
      level_benefits: getLevelBenefits(levelData.currentLevel)
    };

    return res.status(200).json({ 
      success: true, 
      data: gameData
    });

  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return res.status(500).json({ error: 'Failed to fetch game data', details: error.message });
  }
}

async function handleProcessAction(req, res) {
  const { 
    child_id, 
    action_type, 
    action_data 
  } = req.body;

  if (!child_id || !action_type) {
    return res.status(400).json({ error: 'child_id and action_type are required' });
  }

  console.log('🎮 Processing gamification action:', { child_id, action_type, action_data });

  try {
    const result = await processGamificationAction(child_id, action_type, action_data);
    
    return res.status(200).json({ 
      success: true, 
      data: result,
      message: 'Gamification action processed successfully'
    });

  } catch (error) {
    console.error('Error processing gamification action:', error);
    return res.status(500).json({ error: 'Failed to process action', details: error.message });
  }
}

// Helper Functions

function calculateLevelProgression(totalXP) {
  // Level system: Level 1 = 0-99 XP, Level 2 = 100-249 XP, Level 3 = 250-499 XP, etc.
  // Formula: Level N requires (N-1) * 150 + 100 * (N-1) XP
  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  while (totalXP >= xpForNextLevel) {
    currentLevel++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = xpForCurrentLevel + (currentLevel * 150);
  }

  const xpToNextLevel = xpForNextLevel - totalXP;
  const currentLevelXP = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.round((currentLevelXP / xpNeededForLevel) * 100);

  return {
    currentLevel,
    xpToNextLevel,
    progressPercentage,
    currentLevelXP,
    xpNeededForLevel
  };
}

function getLevelBenefits(level) {
  const benefits = {
    1: ['👶 Iniciante no Banco da Família', '💰 Pode fazer pedidos de compra'],
    2: ['🎯 Pode criar metas e sonhos', '📊 Acompanhar transações'],
    3: ['🏆 Desbloqueou conquistas', '🔥 Sistema de sequências ativo'],
    4: ['💎 Status VIP', '🎁 Bônus em recompensas +10%'],
    5: ['👑 Mestre das Finanças', '🚀 Acesso a recursos avançados'],
  };

  return benefits[level] || ['🌟 Nível avançado desbloqueado!'];
}

async function calculateNextAchievements(childId, child) {
  // Define available achievements
  const achievements = [
    {
      id: 'first_goal',
      name: 'Primeiro Sonho',
      description: 'Criar sua primeira meta financeira',
      icon: '🎯',
      xp_reward: 50,
      criteria: { type: 'goals_created', threshold: 1 }
    },
    {
      id: 'saver_bronze',
      name: 'Poupador Bronze',
      description: 'Guardar R$ 50,00 em metas',
      icon: '🥉',
      xp_reward: 75,
      criteria: { type: 'total_saved', threshold: 50 }
    },
    {
      id: 'saver_silver',
      name: 'Poupador Prata',
      description: 'Guardar R$ 200,00 em metas',
      icon: '🥈',
      xp_reward: 150,
      criteria: { type: 'total_saved', threshold: 200 }
    },
    {
      id: 'goal_completer',
      name: 'Realizador de Sonhos',
      description: 'Completar sua primeira meta',
      icon: '🏆',
      xp_reward: 200,
      criteria: { type: 'goals_completed', threshold: 1 }
    },
    {
      id: 'transaction_master',
      name: 'Mestre das Transações',
      description: 'Realizar 10 transações',
      icon: '💳',
      xp_reward: 100,
      criteria: { type: 'transactions_count', threshold: 10 }
    }
  ];

  // Get current stats
  const { data: goalsCreated } = await supabase
    .from('goals')
    .select('*')
    .eq('child_id', childId);

  const { data: goalsCompleted } = await supabase
    .from('goals')
    .select('*')
    .eq('child_id', childId)
    .eq('is_completed', true);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('child_id', childId);

  const { data: earnedBadges } = await supabase
    .from('child_badges')
    .select('badge_id')
    .eq('child_id', childId);

  const earnedBadgeIds = (earnedBadges || []).map(b => b.badge_id);

  // Calculate total saved in goals
  const totalSaved = (transactions || [])
    .filter(t => t.type === 'goal_deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentStats = {
    goals_created: (goalsCreated || []).length,
    goals_completed: (goalsCompleted || []).length,
    transactions_count: (transactions || []).length,
    total_saved: totalSaved
  };

  // Find next achievements
  const nextAchievements = achievements
    .filter(achievement => !earnedBadgeIds.includes(achievement.id))
    .map(achievement => {
      const currentValue = currentStats[achievement.criteria.type] || 0;
      const progress = Math.min(currentValue / achievement.criteria.threshold, 1);
      
      return {
        ...achievement,
        progress: Math.round(progress * 100),
        current_value: currentValue,
        target_value: achievement.criteria.threshold
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return nextAchievements;
}

async function processGamificationAction(childId, actionType, actionData) {
  const results = {
    xp_gained: 0,
    new_badges: [],
    level_up: false,
    new_level: null
  };

  // Get current child data
  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (!child) {
    throw new Error('Child not found');
  }

  const currentLevel = calculateLevelProgression(child.xp || 0).currentLevel;

  // Award XP based on action
  let xpGain = 0;
  switch (actionType) {
    case 'goal_created':
      xpGain = 50;
      break;
    case 'goal_completed':
      xpGain = 200;
      break;
    case 'purchase_request':
      xpGain = 25;
      break;
    case 'goal_contribution':
      xpGain = Math.min(actionData.amount * 0.5, 100); // 0.5 XP per R$1, max 100 XP
      break;
    case 'daily_login':
      xpGain = 10;
      break;
    default:
      xpGain = 10;
  }

  results.xp_gained = xpGain;

  // Update child XP
  const newXP = (child.xp || 0) + xpGain;
  const newLevelData = calculateLevelProgression(newXP);

  const { error: updateError } = await supabase
    .from('children')
    .update({ 
      xp: newXP,
      current_level: newLevelData.currentLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', childId);

  if (updateError) {
    console.error('Error updating child XP:', updateError);
  }

  // Check for level up
  if (newLevelData.currentLevel > currentLevel) {
    results.level_up = true;
    results.new_level = newLevelData.currentLevel;
  }

  // Check for new achievements
  const nextAchievements = await calculateNextAchievements(childId, { ...child, xp: newXP });
  
  // Award badges for completed achievements
  for (const achievement of nextAchievements) {
    if (achievement.progress >= 100) {
      // Create badge record
      const { error: badgeError } = await supabase
        .from('child_badges')
        .insert([{
          child_id: childId,
          badge_id: achievement.id,
          earned_at: new Date().toISOString()
        }]);

      if (!badgeError) {
        results.new_badges.push(achievement);
        
        // Award additional XP for the badge
        const badgeXP = achievement.xp_reward;
        const finalXP = newXP + badgeXP;
        results.xp_gained += badgeXP;

        await supabase
          .from('children')
          .update({ xp: finalXP })
          .eq('id', childId);
      }
    }
  }

  return results;
}