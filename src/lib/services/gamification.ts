// Gamification Service for Chore-based Achievements
import { supabase } from '@/lib/supabase';
import { NotificationService } from './notifications';

export class GamificationService {
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
        badge_id: 'first-chore'
      });

      // Add XP bonus
      await supabase.rpc('update_child_xp', {
        p_child_id: childId,
        p_xp: 25
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
          xp_reward: 25
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
        const lastActivity = new Date(streak.last_activity).toISOString().split('T')[0];
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
            is_active: true
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
        await supabase
          .from('child_streaks')
          .insert({
            child_id: childId,
            streak_type: 'daily_chore',
            current_count: 1,
            best_count: 1,
            last_activity: new Date().toISOString(),
            is_active: true
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
          new_level: newLevel
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