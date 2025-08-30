import { supabase } from '@/lib/supabase';
import { StorageAdapter } from './storage-adapter';
import { NotificationService } from './notifications';

export interface Goal {
  id?: string;
  child_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: 'toy' | 'electronics' | 'clothes' | 'experiences' | 'books' | 'sports' | 'other';
  priority: 'low' | 'medium' | 'high';
  target_date?: string;
  image_url?: string;
  emoji: string;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export interface GoalProgress {
  percentage: number;
  remaining_amount: number;
  estimated_weeks_remaining: number;
  daily_saving_needed: number;
  weekly_saving_needed: number;
  is_on_track: boolean;
  milestone_reached?: string;
}

export interface FamilyGoalsStats {
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  total_target_amount: number;
  total_saved_amount: number;
  average_progress: number;
  family_savings_rate: number;
}

export class GoalsService {
  
  // Create a new goal
  static async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'is_completed'>): Promise<Goal | null> {
    try {
      const newGoal = {
        ...goal,
        current_amount: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('goals')
          .insert(newGoal)
          .select()
          .single();

        if (error) {
          console.error('Error creating goal:', error);
          return this.createGoalInStorage(newGoal);
        }

        // Send notification about new goal
        await NotificationService.createNotification({
          recipient_id: goal.child_id,
          recipient_type: 'child',
          type: 'reminder',
          title: `🎯 Nova Meta Criada!`,
          message: `Sua meta "${goal.title}" foi criada. Vamos economizar juntos!`,
          data: { goal_id: data.id, target_amount: goal.target_amount },
          priority: 'medium'
        });

        return data;
      }

      // Fallback to localStorage
      return this.createGoalInStorage(newGoal);

    } catch (error) {
      console.error('Error creating goal:', error);
      return this.createGoalInStorage({
        ...goal,
        current_amount: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  // Get child's goals
  static async getChildGoals(childId: string, includeCompleted: boolean = true): Promise<Goal[]> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        let query = supabase
          .from('goals')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false });

        if (!includeCompleted) {
          query = query.eq('is_completed', false);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Error getting goals:', error);
          return this.getGoalsFromStorage(childId, includeCompleted);
        }

        return data || [];
      }

      // Fallback to localStorage
      return this.getGoalsFromStorage(childId, includeCompleted);

    } catch (error) {
      console.error('Error getting child goals:', error);
      return this.getGoalsFromStorage(childId, includeCompleted);
    }
  }

  // Update goal progress (add money)
  static async addToGoal(goalId: string, amount: number, childId: string): Promise<Goal | null> {
    try {
      const currentGoal = await this.getGoalById(goalId);
      if (!currentGoal) return null;

      const newAmount = currentGoal.current_amount + amount;
      const isNowCompleted = newAmount >= currentGoal.target_amount;
      
      const updates: Partial<Goal> = {
        current_amount: newAmount,
        updated_at: new Date().toISOString()
      };

      if (isNowCompleted && !currentGoal.is_completed) {
        updates.is_completed = true;
        updates.completed_at = new Date().toISOString();
      }

      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('goals')
          .update(updates)
          .eq('id', goalId)
          .select()
          .single();

        if (error) {
          console.error('Error updating goal:', error);
          return this.updateGoalInStorage(goalId, updates);
        }

        // Send notifications for milestones
        await this.checkMilestones(data, amount);

        return data;
      }

      // Fallback to localStorage
      return this.updateGoalInStorage(goalId, updates);

    } catch (error) {
      console.error('Error adding to goal:', error);
      return null;
    }
  }

  // Calculate goal progress
  static calculateProgress(goal: Goal): GoalProgress {
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
    
    // Calculate estimated time based on child's average weekly earnings
    const estimatedWeeklyEarnings = 25; // Default assumption - could be calculated from history
    const weeksRemaining = remaining > 0 ? Math.ceil(remaining / estimatedWeeklyEarnings) : 0;
    
    const dailySavingNeeded = remaining > 0 ? remaining / (weeksRemaining * 7) : 0;
    const weeklySavingNeeded = remaining > 0 ? remaining / weeksRemaining : 0;

    // Check if on track based on target date
    let isOnTrack = true;
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      const today = new Date();
      const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const requiredDailySavings = remaining / Math.max(daysUntilTarget, 1);
      isOnTrack = dailySavingNeeded <= requiredDailySavings * 1.1; // 10% buffer
    }

    // Determine milestone
    let milestone: string | undefined;
    if (percentage >= 100) milestone = 'completed';
    else if (percentage >= 75) milestone = '75_percent';
    else if (percentage >= 50) milestone = '50_percent';
    else if (percentage >= 25) milestone = '25_percent';

    return {
      percentage: Math.round(percentage * 10) / 10,
      remaining_amount: remaining,
      estimated_weeks_remaining: weeksRemaining,
      daily_saving_needed: Math.round(dailySavingNeeded * 100) / 100,
      weekly_saving_needed: Math.round(weeklySavingNeeded * 100) / 100,
      is_on_track: isOnTrack,
      milestone_reached: milestone
    };
  }

  // Get family goals statistics
  static async getFamilyGoalsStats(familyId: string): Promise<FamilyGoalsStats> {
    try {
      const children = await StorageAdapter.getChildren(familyId);
      const allGoals: Goal[] = [];

      for (const child of children) {
        const childGoals = await this.getChildGoals(child.id);
        allGoals.push(...childGoals);
      }

      const activeGoals = allGoals.filter(g => g.is_active && !g.is_completed);
      const completedGoals = allGoals.filter(g => g.is_completed);
      const totalTarget = allGoals.reduce((sum, g) => sum + g.target_amount, 0);
      const totalSaved = allGoals.reduce((sum, g) => sum + g.current_amount, 0);
      const averageProgress = allGoals.length > 0 ? 
        allGoals.reduce((sum, g) => sum + this.calculateProgress(g).percentage, 0) / allGoals.length : 0;

      // Calculate family savings rate (could be enhanced with historical data)
      const familySavingsRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

      return {
        total_goals: allGoals.length,
        completed_goals: completedGoals.length,
        active_goals: activeGoals.length,
        total_target_amount: totalTarget,
        total_saved_amount: totalSaved,
        average_progress: Math.round(averageProgress * 10) / 10,
        family_savings_rate: Math.round(familySavingsRate * 10) / 10
      };

    } catch (error) {
      console.error('Error getting family goals stats:', error);
      return {
        total_goals: 0,
        completed_goals: 0,
        active_goals: 0,
        total_target_amount: 0,
        total_saved_amount: 0,
        average_progress: 0,
        family_savings_rate: 0
      };
    }
  }

  // Get goal categories with emojis
  static getGoalCategories(): Array<{
    id: Goal['category'];
    name: string;
    emoji: string;
    description: string;
  }> {
    return [
      { id: 'toy', name: 'Brinquedos', emoji: '🧸', description: 'Bonecas, carrinhos, jogos' },
      { id: 'electronics', name: 'Eletrônicos', emoji: '📱', description: 'Celular, tablet, videogame' },
      { id: 'clothes', name: 'Roupas', emoji: '👕', description: 'Tênis, camisetas, acessórios' },
      { id: 'experiences', name: 'Experiências', emoji: '🎢', description: 'Viagens, parque, cinema' },
      { id: 'books', name: 'Livros', emoji: '📚', description: 'Livros, mangás, revistas' },
      { id: 'sports', name: 'Esportes', emoji: '⚽', description: 'Equipamentos esportivos' },
      { id: 'other', name: 'Outros', emoji: '🎯', description: 'Outras metas especiais' }
    ];
  }

  // Get motivational messages based on progress
  static getMotivationalMessage(progress: GoalProgress): string {
    if (progress.percentage >= 100) {
      return "🎉 Parabéns! Você alcançou sua meta! Hora de realizar seu sonho!";
    }
    
    if (progress.percentage >= 90) {
      return `🔥 Quase lá! Faltam apenas R$ ${progress.remaining_amount.toFixed(2)}!`;
    }
    
    if (progress.percentage >= 75) {
      return "💪 Você está indo muito bem! Continue economizando!";
    }
    
    if (progress.percentage >= 50) {
      return "🌟 Metade do caminho concluída! Você consegue!";
    }
    
    if (progress.percentage >= 25) {
      return "🚀 Ótimo começo! Continue assim!";
    }
    
    return "🎯 Todo grande sonho começa com o primeiro passo!";
  }

  // Private helper methods
  private static async getGoalById(goalId: string): Promise<Goal | null> {
    try {
      if (await this.isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('id', goalId)
          .single();

        if (error) return null;
        return data;
      }

      // Fallback to localStorage
      const allGoals = this.getAllGoalsFromStorage();
      return allGoals.find(g => g.id === goalId) || null;

    } catch {
      return null;
    }
  }

  private static async checkMilestones(goal: Goal, amountAdded: number): Promise<void> {
    const progress = this.calculateProgress(goal);
    const previousPercentage = ((goal.current_amount - amountAdded) / goal.target_amount) * 100;

    // Check for milestone notifications
    if (progress.percentage >= 100 && previousPercentage < 100) {
      await NotificationService.createNotification({
        recipient_id: goal.child_id,
        recipient_type: 'child',
        type: 'achievement',
        title: '🎉 Meta Alcançada!',
        message: `Parabéns! Você conseguiu juntar R$ ${goal.target_amount} para "${goal.title}"!`,
        data: { goal_id: goal.id, achievement_type: 'goal_completed' },
        priority: 'high'
      });
    } else if (progress.percentage >= 75 && previousPercentage < 75) {
      await NotificationService.createNotification({
        recipient_id: goal.child_id,
        recipient_type: 'child',
        type: 'achievement',
        title: '🌟 75% Concluído!',
        message: `Você já juntou 75% do valor para "${goal.title}"! Continue assim!`,
        data: { goal_id: goal.id, milestone: '75_percent' },
        priority: 'medium'
      });
    } else if (progress.percentage >= 50 && previousPercentage < 50) {
      await NotificationService.createNotification({
        recipient_id: goal.child_id,
        recipient_type: 'child',
        type: 'achievement',
        title: '🎯 Metade do Caminho!',
        message: `Parabéns! Você já economizou metade do valor para "${goal.title}"!`,
        data: { goal_id: goal.id, milestone: '50_percent' },
        priority: 'medium'
      });
    }
  }

  // LocalStorage fallback methods
  private static createGoalInStorage(goal: Goal): Goal {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const goals = this.getAllGoalsFromStorage();
    goals.push(newGoal);
    localStorage.setItem('banco-familia-goals', JSON.stringify(goals));
    
    return newGoal;
  }

  private static getGoalsFromStorage(childId: string, includeCompleted: boolean): Goal[] {
    const allGoals = this.getAllGoalsFromStorage();
    let filtered = allGoals.filter(g => g.child_id === childId);
    
    if (!includeCompleted) {
      filtered = filtered.filter(g => !g.is_completed);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }

  private static updateGoalInStorage(goalId: string, updates: Partial<Goal>): Goal | null {
    const goals = this.getAllGoalsFromStorage();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return null;
    
    goals[goalIndex] = { ...goals[goalIndex], ...updates };
    localStorage.setItem('banco-familia-goals', JSON.stringify(goals));
    
    return goals[goalIndex];
  }

  private static getAllGoalsFromStorage(): Goal[] {
    try {
      const data = localStorage.getItem('banco-familia-goals');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('goals').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}