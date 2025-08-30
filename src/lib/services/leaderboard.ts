import { supabase } from '@/lib/supabase';
import { StorageAdapter } from './storage-adapter';
import type { Child } from '@/lib/supabase';

export interface LeaderboardEntry {
  child_id: string;
  child_name: string;
  child_avatar: string;
  level: number;
  xp: number;
  total_earned: number;
  total_spent: number;
  streak_count: number;
  badges_count: number;
  chores_completed_this_week: number;
  chores_completed_this_month: number;
  rank: number;
  position_change?: 'up' | 'down' | 'same';
}

export interface FamilyStats {
  total_xp: number;
  total_earnings: number;
  total_chores_completed: number;
  average_level: number;
  family_streak: number;
  top_performer: LeaderboardEntry | null;
}

export class LeaderboardService {
  
  // Get family leaderboard with rankings
  static async getFamilyLeaderboard(familyId: string, period: 'week' | 'month' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await this.getLeaderboardFromSupabase(familyId, period);
      }
    } catch (error) {
      console.warn('Supabase unavailable, using localStorage for leaderboard:', error);
    }

    // Fallback to localStorage
    return this.getLeaderboardFromStorage(familyId, period);
  }

  // Get family statistics
  static async getFamilyStats(familyId: string): Promise<FamilyStats> {
    const leaderboard = await this.getFamilyLeaderboard(familyId);
    
    if (leaderboard.length === 0) {
      return {
        total_xp: 0,
        total_earnings: 0,
        total_chores_completed: 0,
        average_level: 0,
        family_streak: 0,
        top_performer: null
      };
    }

    const totalXP = leaderboard.reduce((sum, entry) => sum + entry.xp, 0);
    const totalEarnings = leaderboard.reduce((sum, entry) => sum + entry.total_earned, 0);
    const totalChores = leaderboard.reduce((sum, entry) => sum + entry.chores_completed_this_month, 0);
    const averageLevel = leaderboard.reduce((sum, entry) => sum + entry.level, 0) / leaderboard.length;
    
    // Family streak is the minimum streak among all children (team effort!)
    const familyStreak = Math.min(...leaderboard.map(entry => entry.streak_count));
    
    return {
      total_xp: totalXP,
      total_earnings: totalEarnings,
      total_chores_completed: totalChores,
      average_level: Math.round(averageLevel * 10) / 10,
      family_streak: familyStreak,
      top_performer: leaderboard[0] || null
    };
  }

  // Get child's position and nearby competitors
  static async getChildPosition(childId: string, familyId: string): Promise<{
    position: number;
    total: number;
    above: LeaderboardEntry | null;
    below: LeaderboardEntry | null;
  }> {
    const leaderboard = await this.getFamilyLeaderboard(familyId);
    const childIndex = leaderboard.findIndex(entry => entry.child_id === childId);
    
    if (childIndex === -1) {
      return { position: 0, total: 0, above: null, below: null };
    }

    return {
      position: childIndex + 1,
      total: leaderboard.length,
      above: childIndex > 0 ? leaderboard[childIndex - 1] : null,
      below: childIndex < leaderboard.length - 1 ? leaderboard[childIndex + 1] : null
    };
  }

  // Calculate leaderboard rankings based on different criteria
  static calculateRankings(children: Child[], criteria: 'xp' | 'level' | 'earnings' | 'chores' = 'xp'): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = children.map(child => ({
      child_id: child.id,
      child_name: child.name,
      child_avatar: child.avatar,
      level: child.level || 1,
      xp: child.xp || 0,
      total_earned: child.total_earned || 0,
      total_spent: child.total_spent || 0,
      streak_count: 0, // Will be calculated
      badges_count: 0, // Will be calculated
      chores_completed_this_week: 0, // Will be calculated
      chores_completed_this_month: 0, // Will be calculated
      rank: 0
    }));

    // Sort based on criteria
    entries.sort((a, b) => {
      switch (criteria) {
        case 'level':
          if (b.level !== a.level) return b.level - a.level;
          return b.xp - a.xp; // Tiebreaker: XP
        case 'earnings':
          return b.total_earned - a.total_earned;
        case 'chores':
          if (b.chores_completed_this_month !== a.chores_completed_this_month) {
            return b.chores_completed_this_month - a.chores_completed_this_month;
          }
          return b.chores_completed_this_week - a.chores_completed_this_week;
        default: // 'xp'
          return b.xp - a.xp;
      }
    });

    // Assign ranks with tie handling
    entries.forEach((entry, index) => {
      if (index === 0) {
        entry.rank = 1;
      } else {
        const prev = entries[index - 1];
        const current = entry;
        
        // Check if tied with previous entry
        const isTied = this.areEntriesTied(prev, current, criteria);
        entry.rank = isTied ? prev.rank : index + 1;
      }
    });

    return entries;
  }

  // Check if two entries are tied based on criteria
  private static areEntriesTied(a: LeaderboardEntry, b: LeaderboardEntry, criteria: string): boolean {
    switch (criteria) {
      case 'level':
        return a.level === b.level && a.xp === b.xp;
      case 'earnings':
        return a.total_earned === b.total_earned;
      case 'chores':
        return a.chores_completed_this_month === b.chores_completed_this_month &&
               a.chores_completed_this_week === b.chores_completed_this_week;
      default: // 'xp'
        return a.xp === b.xp;
    }
  }

  // Get achievement badges for ranking display
  static getRankingBadge(rank: number): { emoji: string; title: string; color: string } {
    switch (rank) {
      case 1:
        return { emoji: '🏆', title: 'Campeão', color: 'text-yellow-600' };
      case 2:
        return { emoji: '🥈', title: '2º Lugar', color: 'text-gray-500' };
      case 3:
        return { emoji: '🥉', title: '3º Lugar', color: 'text-orange-600' };
      default:
        return { emoji: '🌟', title: `${rank}º Lugar`, color: 'text-blue-600' };
    }
  }

  // Generate motivational messages based on position
  static getMotivationalMessage(entry: LeaderboardEntry, position: { position: number; total: number; above: LeaderboardEntry | null }): string {
    const { position: pos, above } = position;
    
    if (pos === 1) {
      return "🏆 Você está no topo! Continue assim para manter a liderança!";
    }
    
    if (pos === 2) {
      const leader = above!;
      const xpDiff = leader.xp - entry.xp;
      return `🥈 Você está quase lá! Apenas ${xpDiff} XP para alcançar ${leader.child_name}!`;
    }
    
    if (above) {
      const xpDiff = above.xp - entry.xp;
      return `🌟 Continue assim! ${xpDiff} XP para passar ${above.child_name}!`;
    }
    
    return "💪 Toda jornada começa com um primeiro passo! Continue completando tarefas!";
  }

  // Supabase implementation
  private static async getLeaderboardFromSupabase(familyId: string, period: string): Promise<LeaderboardEntry[]> {
    const { data: children, error } = await supabase
      .from('children')
      .select(`
        id,
        name,
        avatar,
        level,
        xp,
        total_earned,
        total_spent
      `)
      .eq('family_id', familyId)
      .order('xp', { ascending: false });

    if (error) throw error;

    return children?.map(child => ({
      child_id: child.id,
      child_name: child.name,
      child_avatar: child.avatar,
      level: child.level || 1,
      xp: child.xp || 0,
      total_earned: child.total_earned || 0,
      total_spent: child.total_spent || 0,
      streak_count: 0, // TODO: Get from streaks table
      badges_count: 0, // TODO: Get from badges table
      chores_completed_this_week: 0, // TODO: Calculate from chores
      chores_completed_this_month: 0, // TODO: Calculate from chores
      rank: 0
    })) || [];
  }

  // LocalStorage fallback
  private static async getLeaderboardFromStorage(familyId: string, period: string): Promise<LeaderboardEntry[]> {
    try {
      const children = await StorageAdapter.getChildren(familyId);
      return this.calculateRankings(children);
    } catch {
      return [];
    }
  }

  private static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('children').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Update child's weekly/monthly stats (called after chore completion)
  static async updateChildStats(childId: string): Promise<void> {
    try {
      // This would update the child's chore completion stats
      // For now, this is a placeholder for future implementation
      console.log(`Updated stats for child ${childId}`);
    } catch (error) {
      console.error('Error updating child stats:', error);
    }
  }
}