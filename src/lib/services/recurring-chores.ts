import { supabase } from '@/lib/supabase';
import type { ChoreTemplate } from '@/lib/supabase';
import { ChoresService } from './chores';

export interface RecurringChoreConfig {
  id?: string;
  template_id: string;
  child_id: string;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly';
  days_of_week?: number[]; // 0-6, Sunday = 0
  day_of_month?: number; // 1-31
  is_active: boolean;
  next_due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export class RecurringChoresService {
  static async createRecurringChore(config: Omit<RecurringChoreConfig, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringChoreConfig | null> {
    try {
      const nextDueDate = this.calculateNextDueDate(config);
      
      const { data, error } = await supabase
        .from('recurring_chores')
        .insert({
          ...config,
          next_due_date: nextDueDate
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recurring chore:', error);
        return null;
      }

      // Create the first instance of the chore
      await this.generateChoreInstance(data);
      
      return data;
    } catch (error) {
      console.error('Error creating recurring chore:', error);
      return null;
    }
  }

  static async getRecurringChores(childId: string): Promise<RecurringChoreConfig[]> {
    const { data, error } = await supabase
      .from('recurring_chores')
      .select(`
        *,
        chore_template:chore_templates(*)
      `)
      .eq('child_id', childId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateRecurringChore(id: string, updates: Partial<RecurringChoreConfig>): Promise<RecurringChoreConfig | null> {
    const { data, error } = await supabase
      .from('recurring_chores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring chore:', error);
      return null;
    }
    return data;
  }

  static async deactivateRecurringChore(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('recurring_chores')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating recurring chore:', error);
      return false;
    }
    return true;
  }

  // Generate chore instances from recurring configurations
  static async processRecurringChores(): Promise<void> {
    try {
      const { data: recurringChores, error } = await supabase
        .from('recurring_chores')
        .select(`
          *,
          chore_template:chore_templates(*)
        `)
        .eq('is_active', true)
        .lte('next_due_date', new Date().toISOString());

      if (error) throw error;

      for (const recurringChore of recurringChores || []) {
        await this.generateChoreInstance(recurringChore);
        
        // Update next due date
        const nextDueDate = this.calculateNextDueDate(recurringChore);
        await supabase
          .from('recurring_chores')
          .update({ next_due_date: nextDueDate })
          .eq('id', recurringChore.id);
      }
    } catch (error) {
      console.error('Error processing recurring chores:', error);
    }
  }

  private static async generateChoreInstance(recurringChore: RecurringChoreConfig & { chore_template: ChoreTemplate }): Promise<void> {
    try {
      // Check if a chore instance already exists for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingChore } = await supabase
        .from('assigned_chores')
        .select('id')
        .eq('child_id', recurringChore.child_id)
        .eq('template_id', recurringChore.template_id)
        .gte('created_at', today)
        .single();

      if (existingChore) return; // Already created today

      // Create new assigned chore instance
      await ChoresService.assignChore({
        child_id: recurringChore.child_id,
        template_id: recurringChore.template_id,
        name: recurringChore.chore_template.name,
        description: recurringChore.chore_template.description,
        reward_amount: recurringChore.chore_template.reward_amount,
        category: recurringChore.chore_template.category,
        estimated_time: recurringChore.chore_template.estimated_time,
        priority: recurringChore.chore_template.priority || 'medium',
        due_date: this.calculateDueDate(recurringChore),
        assigned_by_parent_id: recurringChore.chore_template.family_id, // Use family_id as placeholder
        instructions: recurringChore.chore_template.instructions
      });
    } catch (error) {
      console.error('Error generating chore instance:', error);
    }
  }

  private static calculateNextDueDate(config: RecurringChoreConfig): string {
    const now = new Date();
    let nextDate = new Date(now);

    switch (config.recurrence_pattern) {
      case 'daily':
        nextDate.setDate(now.getDate() + 1);
        break;
        
      case 'weekly':
        if (config.days_of_week && config.days_of_week.length > 0) {
          // Find next occurrence of specified days
          let daysToAdd = 1;
          while (!config.days_of_week.includes(nextDate.getDay())) {
            nextDate.setDate(nextDate.getDate() + 1);
            daysToAdd++;
            if (daysToAdd > 7) break; // Safety check
          }
        } else {
          nextDate.setDate(now.getDate() + 7);
        }
        break;
        
      case 'monthly':
        if (config.day_of_month) {
          nextDate.setDate(config.day_of_month);
          if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
        } else {
          nextDate.setMonth(now.getMonth() + 1);
        }
        break;
    }

    return nextDate.toISOString();
  }

  private static calculateDueDate(config: RecurringChoreConfig): string {
    // For now, set due date to end of current day
    const dueDate = new Date();
    dueDate.setHours(23, 59, 59, 999);
    return dueDate.toISOString();
  }

  // Helper method to get user-friendly recurrence description
  static getRecurrenceDescription(config: RecurringChoreConfig): string {
    switch (config.recurrence_pattern) {
      case 'daily':
        return 'Todos os dias';
        
      case 'weekly':
        if (config.days_of_week && config.days_of_week.length > 0) {
          const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const days = config.days_of_week.map(d => dayNames[d]).join(', ');
          return `Toda semana: ${days}`;
        }
        return 'Toda semana';
        
      case 'monthly':
        if (config.day_of_month) {
          return `Todo mês no dia ${config.day_of_month}`;
        }
        return 'Todo mês';
        
      default:
        return 'Recorrência personalizada';
    }
  }
}