import { supabase } from '@/lib/supabase';
import type { Family, Child, Transaction, Goal, PurchaseRequest } from '@/lib/supabase';

export class DatabaseService {
  // Family methods
  static async createFamily(family: Omit<Family, 'id' | 'created_at' | 'updated_at'>): Promise<Family | null> {
    const { data, error } = await supabase
      .from('families')
      .insert([family])
      .select()
      .single();

    if (error) {
      console.error('Error creating family:', error);
      return null;
    }

    return data;
  }

  static async getFamilyByEmail(email: string): Promise<Family | null> {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('parent_email', email)
      .single();

    if (error) {
      console.error('Error getting family:', error);
      return null;
    }

    return data;
  }

  static async getAllFamilies(): Promise<Family[]> {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting all families:', error);
      return [];
    }

    return data || [];
  }

  // Children methods
  static async getChildren(familyId: string): Promise<Child[]> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting children:', error);
      return [];
    }

    return data || [];
  }

  static async getChildById(childId: string): Promise<Child | null> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (error) {
      console.error('Error getting child:', error);
      return null;
    }

    return data;
  }

  static async createChild(child: Omit<Child, 'id' | 'created_at' | 'updated_at'>): Promise<Child | null> {
    const { data, error } = await supabase
      .from('children')
      .insert([child])
      .select()
      .single();

    if (error) {
      console.error('Error creating child:', error);
      return null;
    }

    return data;
  }

  static async updateChild(childId: string, updates: Partial<Child>): Promise<Child | null> {
    const { data, error } = await supabase
      .from('children')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', childId)
      .select()
      .single();

    if (error) {
      console.error('Error updating child:', error);
      return null;
    }

    return data;
  }

  static async deleteChild(childId: string): Promise<boolean> {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) {
      console.error('Error deleting child:', error);
      return false;
    }

    return true;
  }

  // Transaction methods
  static async getTransactions(childId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting transactions:', error);
      return [];
    }

    return data || [];
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    // Update child balance
    if (transaction.type === 'earning' || transaction.type === 'allowance' || transaction.type === 'interest') {
      await this.updateChildBalance(transaction.child_id, transaction.amount);
    } else if (transaction.type === 'spending') {
      await this.updateChildBalance(transaction.child_id, -transaction.amount);
    }

    return data;
  }

  static async updateChildBalance(childId: string, amountChange: number): Promise<void> {
    const { data: child } = await supabase
      .from('children')
      .select('balance, total_earned, total_spent')
      .eq('id', childId)
      .single();

    if (child) {
      const newBalance = child.balance + amountChange;
      const updates: Partial<Child> = {
        balance: Math.max(0, newBalance), // Prevent negative balance
        updated_at: new Date().toISOString(),
      };

      if (amountChange > 0) {
        updates.total_earned = child.total_earned + amountChange;
      } else {
        updates.total_spent = child.total_spent + Math.abs(amountChange);
      }

      await supabase
        .from('children')
        .update(updates)
        .eq('id', childId);
    }
  }

  // Goals methods
  static async getGoals(childId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting goals:', error);
      return [];
    }

    return data || [];
  }

  static async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }

    return data;
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    return data;
  }

  // Purchase Requests methods
  static async getPurchaseRequests(familyId: string): Promise<PurchaseRequest[]> {
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('family_id', familyId);

    if (!children || children.length === 0) return [];

    const childIds = children.map(child => child.id);

    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting purchase requests:', error);
      return [];
    }

    return data || [];
  }

  static async createPurchaseRequest(request: Omit<PurchaseRequest, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseRequest | null> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .insert([request])
      .select()
      .single();

    if (error) {
      console.error('Error creating purchase request:', error);
      return null;
    }

    return data;
  }

  static async updatePurchaseRequest(requestId: string, updates: Partial<PurchaseRequest>): Promise<PurchaseRequest | null> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchase request:', error);
      return null;
    }

    return data;
  }

  // ============ CHILD MANAGEMENT ============
  
  static async createChild(familyId: string, childData: {
    name: string;
    age: number;
    pin: string;
    avatar_url?: string;
  }): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{
          family_id: familyId,
          name: childData.name,
          age: childData.age,
          pin_hash: childData.pin, // In production, should hash the PIN
          avatar_url: childData.avatar_url || '👧',
          balance: 0,
          total_earned: 0,
          total_spent: 0,
          current_level: 1,
          total_xp: 0,
          current_streak: 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating child:', error);
        return false;
      }

      // Create default configurations for the child
      if (data) {
        // Create default interest config
        await supabase
          .from('interest_config')
          .insert([{
            child_id: data.id,
            monthly_rate: 0.01,
            annual_rate: 0.01,
            minimum_balance: 10.00,
            is_active: true,
            compound_frequency: 'monthly'
          }]);

        // Create default allowance config
        await supabase
          .from('allowance_config')
          .insert([{
            child_id: data.id,
            amount: 25.00,
            frequency: 'weekly',
            day_of_week: 1,
            is_active: true,
            next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }]);
      }

      return true;
    } catch (error) {
      console.error('Error creating child:', error);
      return false;
    }
  }

  static async updateChild(childId: string, updates: {
    name?: string;
    age?: number;
    pin?: string;
    avatar_url?: string;
  }): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.age !== undefined) updateData.age = updates.age;
      if (updates.pin !== undefined) updateData.pin_hash = updates.pin; // In production, should hash
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', childId);

      if (error) {
        console.error('Error updating child:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating child:', error);
      return false;
    }
  }
}