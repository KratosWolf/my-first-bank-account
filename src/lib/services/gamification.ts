// Gamification Service — XP, levels and achievements
import { supabase } from '@/lib/supabase';
import { NotificationService } from './notifications';

// Sistema de níveis com títulos e benefícios
export const LEVEL_SYSTEM = [
  {
    level: 1,
    title: 'Poupador Iniciante',
    xp_required: 0,
    badge_reward: false,
    benefits: ['Acesso ao cofrinho digital'],
  },
  {
    level: 2,
    title: 'Guardião de Moedas',
    xp_required: 100,
    badge_reward: true,
    benefits: ['Acesso ao cofrinho digital', 'Badge de Nível 2'],
  },
  {
    level: 3,
    title: 'Investidor Mirim',
    xp_required: 250,
    badge_reward: true,
    benefits: [
      'Acesso ao cofrinho digital',
      'Badge de Nível 3',
      'Pode criar mais sonhos',
    ],
  },
  {
    level: 4,
    title: 'Mestre das Finanças',
    xp_required: 500,
    badge_reward: true,
    benefits: [
      'Acesso ao cofrinho digital',
      'Badge de Nível 4',
      'Pode criar mais sonhos',
      'Título especial',
    ],
  },
  {
    level: 5,
    title: 'Magnata Júnior',
    xp_required: 1000,
    badge_reward: true,
    benefits: ['Todos os benefícios anteriores', 'Badge dourado'],
  },
  {
    level: 6,
    title: 'Barão das Economias',
    xp_required: 1500,
    badge_reward: true,
    benefits: ['Todos os benefícios anteriores', 'Badge de platina'],
  },
  {
    level: 7,
    title: 'Gênio Financeiro',
    xp_required: 2000,
    badge_reward: true,
    benefits: ['Todos os benefícios anteriores', 'Badge lendário'],
  },
  {
    level: 8,
    title: 'Lenda do Cofrinho',
    xp_required: 3000,
    badge_reward: true,
    benefits: ['Todos os benefícios anteriores', 'Título lendário'],
  },
  {
    level: 9,
    title: 'Midas Mirim',
    xp_required: 4000,
    badge_reward: true,
    benefits: ['Todos os benefícios anteriores'],
  },
  {
    level: 10,
    title: 'Rei da Poupança',
    xp_required: 5000,
    badge_reward: true,
    benefits: ['Nível máximo!', 'Todos os benefícios desbloqueados'],
  },
];

export interface LevelInfo {
  level: number;
  title: string;
  badge_reward: boolean;
  benefits: string[];
}

export interface XpProgress {
  current: number;
  needed: number;
  total_for_next: number;
  percentage: number;
}

export class GamificationService {
  // Calcula XP total a partir de transações reais
  static calculateXPFromTransactions(
    transactions: Array<{ type: string; amount: number }>
  ): number {
    let xp = 0;
    for (const tx of transactions) {
      switch (tx.type) {
        case 'goal_deposit':
          // R$ 1 guardado num sonho = 1 XP
          xp += Math.floor(Math.abs(tx.amount));
          break;
        case 'loan_payment':
          // Cada parcela paga = 10 XP
          xp += 10;
          break;
        case 'interest':
        case 'goal_interest':
          // Rendimento recebido = 2 XP por evento
          xp += 2;
          break;
        case 'earning':
          // Cada ganho (mesada, tarefa) = 1 XP por R$ 5
          xp += Math.floor(Math.abs(tx.amount) / 5);
          break;
        case 'allowance':
          // Mesada recebida = 5 XP
          xp += 5;
          break;
      }
    }
    return xp;
  }

  // Retorna info do nível atual dado o XP total
  static getLevelInfo(xp: number): LevelInfo {
    let currentLevel = LEVEL_SYSTEM[0];
    for (const lvl of LEVEL_SYSTEM) {
      if (xp >= lvl.xp_required) {
        currentLevel = lvl;
      } else {
        break;
      }
    }
    return currentLevel;
  }

  // Retorna progresso em XP para o próximo nível
  static getXpToNextLevel(xp: number): XpProgress {
    const currentLevelInfo = this.getLevelInfo(xp);
    const currentIdx = LEVEL_SYSTEM.findIndex(
      l => l.level === currentLevelInfo.level
    );
    const nextLevel = LEVEL_SYSTEM[currentIdx + 1];

    if (!nextLevel) {
      // Nível máximo
      return { current: xp, needed: 0, total_for_next: xp, percentage: 100 };
    }

    const xpInCurrentLevel = xp - currentLevelInfo.xp_required;
    const xpNeededForNext =
      nextLevel.xp_required - currentLevelInfo.xp_required;
    const percentage = Math.min(
      Math.round((xpInCurrentLevel / xpNeededForNext) * 100),
      100
    );

    return {
      current: xpInCurrentLevel,
      needed: nextLevel.xp_required - xp,
      total_for_next: xpNeededForNext,
      percentage,
    };
  }

  // Award a badge for completing the first chore
  static async checkFirstChoreAchievement(childId: string): Promise<boolean> {
    try {
      // Check if child already has the first chore badge
      const { data: existingBadge } = await supabase
        .from('child_badges')
        .select('id')
        .eq('child_id', childId)
        .eq('badge_id', 'first-chore')
        .single();

      if (existingBadge) return false; // Already has the badge

      // Award the first chore badge
      await supabase.from('child_badges').insert({
        child_id: childId,
        badge_id: 'first-chore',
      });

      // Add XP bonus
      await supabase.rpc('update_child_xp', {
        p_child_id: childId,
        p_xp: 25,
      });

      // Send achievement notification
      await NotificationService.notifyAchievement(
        childId,
        'parent-placeholder', // In real app, get parent ID from child record
        {
          type: 'badge',
          title: 'Primeira Tarefa',
          description: 'Você completou sua primeira tarefa! Continue assim!',
          icon: '🌟',
          xp_reward: 25,
        }
      );

      return true;
    } catch (error) {
      console.error('Error checking first chore achievement:', error);
      return false;
    }
  }

  // Update daily streak when a chore is completed
  static async updateDailyChoreStreak(childId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: streak } = await supabase
        .from('child_streaks')
        .select('*')
        .eq('child_id', childId)
        .eq('streak_type', 'daily_chore')
        .single();

      if (streak) {
        const lastActivity = new Date(streak.last_activity)
          .toISOString()
          .split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newCount = 1;
        if (lastActivity === yesterdayStr) {
          // Continuing streak
          newCount = streak.current_count + 1;
        } else if (lastActivity === today) {
          // Already counted today
          return streak.current_count;
        }

        await supabase
          .from('child_streaks')
          .update({
            current_count: newCount,
            best_count: Math.max(newCount, streak.best_count),
            last_activity: new Date().toISOString(),
            is_active: true,
          })
          .eq('id', streak.id);

        // Send streak notification for significant streaks
        if (newCount >= 3) {
          await NotificationService.notifyStreak(
            childId,
            'parent-placeholder', // In real app, get parent ID from child record
            newCount
          );
        }

        return newCount;
      } else {
        // Create new streak
        await supabase.from('child_streaks').insert({
          child_id: childId,
          streak_type: 'daily_chore',
          current_count: 1,
          best_count: 1,
          last_activity: new Date().toISOString(),
          is_active: true,
        });

        return 1;
      }
    } catch (error) {
      console.error('Error updating daily streak:', error);
      return 0;
    }
  }

  // Check for level progression after XP gain
  static async checkLevelProgression(childId: string): Promise<{
    leveled_up: boolean;
    new_level?: number;
  }> {
    try {
      const { data: child } = await supabase
        .from('children')
        .select('level, xp')
        .eq('id', childId)
        .single();

      if (!child) return { leveled_up: false };

      const xpForNextLevel = this.getXPRequiredForLevel(child.level + 1);

      if (child.xp >= xpForNextLevel) {
        const newLevel = child.level + 1;

        await supabase
          .from('children')
          .update({ level: newLevel })
          .eq('id', childId);

        // Send level up notification
        await NotificationService.notifyLevelUp(
          childId,
          'parent-placeholder', // In real app, get parent ID from child record
          newLevel,
          100 // Level up XP bonus
        );

        return {
          leveled_up: true,
          new_level: newLevel,
        };
      }

      return { leveled_up: false };
    } catch (error) {
      console.error('Error checking level progression:', error);
      return { leveled_up: false };
    }
  }

  private static getXPRequiredForLevel(level: number): number {
    // Exponential progression: Level 1=100XP, Level 2=150XP, Level 3=225XP, etc.
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }
}
