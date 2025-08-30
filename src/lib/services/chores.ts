import { supabase } from '@/lib/supabase';
import type { ChoreTemplate, AssignedChore, ChoreCompletion } from '@/lib/supabase';
import { GamificationService } from './gamification';

export class ChoresService {
  // CHORE TEMPLATES MANAGEMENT
  
  static async getChoreTemplates(familyId: string): Promise<ChoreTemplate[]> {
    const { data, error } = await supabase
      .from('chore_templates')
      .select('*')
      .eq('family_id', familyId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createChoreTemplate(template: Omit<ChoreTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ChoreTemplate | null> {
    const { data, error } = await supabase
      .from('chore_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating chore template:', error);
      return null;
    }
    return data;
  }

  static async updateChoreTemplate(id: string, updates: Partial<ChoreTemplate>): Promise<ChoreTemplate | null> {
    const { data, error } = await supabase
      .from('chore_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chore template:', error);
      return null;
    }
    return data;
  }

  static async deleteChoreTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('chore_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting chore template:', error);
      return false;
    }
    return true;
  }

  // ASSIGNED CHORES MANAGEMENT
  
  static async getChildChores(childId: string, status?: string): Promise<AssignedChore[]> {
    let query = supabase
      .from('assigned_chores')
      .select(`
        *,
        chore_template:chore_templates(*),
        child:children(*)
      `)
      .eq('child_id', childId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getFamilyChores(familyId: string, status?: string): Promise<AssignedChore[]> {
    let query = supabase
      .from('assigned_chores')
      .select(`
        *,
        chore_template:chore_templates(*),
        child:children(*)
      `)
      .eq('child.family_id', familyId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async assignChore(chore: Omit<AssignedChore, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<AssignedChore | null> {
    const { data, error } = await supabase
      .from('assigned_chores')
      .insert({
        ...chore,
        status: 'assigned'
      })
      .select(`
        *,
        chore_template:chore_templates(*),
        child:children(*)
      `)
      .single();

    if (error) {
      console.error('Error assigning chore:', error);
      return null;
    }
    return data;
  }

  static async updateChoreStatus(
    choreId: string, 
    status: AssignedChore['status'], 
    updates?: {
      notes?: string;
      photo_evidence?: string;
      rejection_reason?: string;
      approved_by_parent_id?: string;
    }
  ): Promise<AssignedChore | null> {
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      if (updates?.approved_by_parent_id) {
        updateData.approved_by_parent_id = updates.approved_by_parent_id;
      }
    }

    if (updates) {
      Object.assign(updateData, updates);
    }

    const { data, error } = await supabase
      .from('assigned_chores')
      .update(updateData)
      .eq('id', choreId)
      .select(`
        *,
        chore_template:chore_templates(*),
        child:children(*)
      `)
      .single();

    if (error) {
      console.error('Error updating chore status:', error);
      return null;
    }

    // If approved, create transaction and completion record
    if (status === 'approved' && data) {
      await this.processChoreApproval(data);
      
      // Check for achievements and gamification rewards
      await this.processGamificationRewards(data);
    }

    return data;
  }

  static async startChore(choreId: string, childNotes?: string): Promise<AssignedChore | null> {
    return this.updateChoreStatus(choreId, 'in_progress', {
      notes: childNotes
    });
  }

  static async completeChore(
    choreId: string, 
    childNotes?: string, 
    photoEvidence?: string
  ): Promise<AssignedChore | null> {
    return this.updateChoreStatus(choreId, 'completed', {
      notes: childNotes,
      photo_evidence: photoEvidence
    });
  }

  static async approveChore(
    choreId: string, 
    parentId: string, 
    qualityRating?: number,
    bonusReward?: number
  ): Promise<AssignedChore | null> {
    const chore = await this.updateChoreStatus(choreId, 'approved', {
      approved_by_parent_id: parentId
    });

    if (chore && qualityRating) {
      await this.recordChoreCompletion(chore, qualityRating, bonusReward || 0);
    }

    return chore;
  }

  static async rejectChore(
    choreId: string, 
    parentId: string, 
    reason: string
  ): Promise<AssignedChore | null> {
    return this.updateChoreStatus(choreId, 'rejected', {
      approved_by_parent_id: parentId,
      rejection_reason: reason
    });
  }

  // COMPLETION AND REWARDS
  
  private static async processChoreApproval(chore: AssignedChore): Promise<void> {
    try {
      // Create transaction for the reward
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          child_id: chore.child_id,
          type: 'earning',
          amount: chore.reward_amount,
          description: `Tarefa concluída: ${chore.name}`,
          category: 'chore_reward',
          status: 'completed',
          requires_approval: false,
          approved_by_parent: true,
          metadata: {
            chore_id: chore.id,
            chore_name: chore.name
          }
        });

      if (transactionError) {
        console.error('Error creating chore reward transaction:', transactionError);
        return;
      }

      // Update child balance and XP
      const { error: balanceError } = await supabase.rpc('update_child_balance_and_xp', {
        p_child_id: chore.child_id,
        p_amount: chore.reward_amount,
        p_xp: Math.floor(chore.reward_amount / 2) // 1 XP per R$ 2.00 earned
      });

      if (balanceError) {
        console.error('Error updating child balance:', balanceError);
      }

    } catch (error) {
      console.error('Error processing chore approval:', error);
    }
  }

  private static async recordChoreCompletion(
    chore: AssignedChore, 
    qualityRating: number,
    bonusReward: number
  ): Promise<ChoreCompletion | null> {
    const { data, error } = await supabase
      .from('chore_completions')
      .insert({
        assigned_chore_id: chore.id,
        child_id: chore.child_id,
        quality_rating,
        bonus_reward,
        completed_at: chore.completed_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording chore completion:', error);
      return null;
    }

    // If there's a bonus reward, create another transaction
    if (bonusReward > 0) {
      await supabase
        .from('transactions')
        .insert({
          child_id: chore.child_id,
          type: 'earning',
          amount: bonusReward,
          description: `Bônus por excelente trabalho: ${chore.name}`,
          category: 'bonus_reward',
          status: 'completed',
          requires_approval: false,
          approved_by_parent: true
        });

      // Update balance again
      await supabase.rpc('update_child_balance_and_xp', {
        p_child_id: chore.child_id,
        p_amount: bonusReward,
        p_xp: Math.floor(bonusReward) // 1 XP per R$ 1.00 bonus
      });
    }

    return data;
  }

  // ANALYTICS AND REPORTS
  
  static async getChoreStats(childId: string, period?: 'week' | 'month' | 'year'): Promise<any> {
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND completed_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND completed_at >= NOW() - INTERVAL '30 days'";
    } else if (period === 'year') {
      dateFilter = "AND completed_at >= NOW() - INTERVAL '365 days'";
    }

    const { data, error } = await supabase.rpc('get_chore_statistics', {
      p_child_id: childId,
      p_period: period || 'all'
    });

    if (error) {
      console.error('Error getting chore statistics:', error);
      return {
        total_completed: 0,
        total_earned: 0,
        average_rating: 0,
        completion_rate: 0,
        categories: {}
      };
    }

    return data;
  }

  static async getUpcomingChores(childId: string, days: number = 7): Promise<AssignedChore[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await supabase
      .from('assigned_chores')
      .select(`
        *,
        chore_template:chore_templates(*),
        child:children(*)
      `)
      .eq('child_id', childId)
      .in('status', ['assigned', 'in_progress'])
      .lte('due_date', endDate.toISOString())
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // GAMIFICATION INTEGRATION
  private static async processGamificationRewards(chore: AssignedChore): Promise<void> {
    try {
      // Update daily streak
      const streakCount = await GamificationService.updateDailyChoreStreak(chore.child_id);
      
      // Check for first chore achievement
      await GamificationService.checkFirstChoreAchievement(chore.child_id);
      
      // Check for level progression (after XP from chore reward)
      const levelProgress = await GamificationService.checkLevelProgression(chore.child_id);
      
      if (levelProgress.leveled_up) {
        console.log(`🎉 Child ${chore.child_id} leveled up to level ${levelProgress.new_level}!`);
        
        // Could trigger a celebration notification here
      }

      if (streakCount >= 7) {
        console.log(`🔥 Child ${chore.child_id} has a ${streakCount}-day streak!`);
      }

    } catch (error) {
      console.error('Error processing gamification rewards:', error);
    }
  }
}