import { supabase } from '@/lib/supabase';
import type {
  Family,
  Child,
  Transaction,
  Goal,
  PurchaseRequest,
} from '@/lib/supabase';

export class DatabaseService {
  // Family methods
  static async createFamily(
    family: Omit<Family, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Family | null> {
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

  static async createChild(
    child: Omit<Child, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Child | null> {
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

  static async updateChild(
    childId: string,
    updates: Partial<Child>
  ): Promise<Child | null> {
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

  static async createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction | null> {
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
    if (
      transaction.type === 'earning' ||
      transaction.type === 'allowance' ||
      transaction.type === 'interest'
    ) {
      await this.updateChildBalance(transaction.child_id, transaction.amount);
    } else if (transaction.type === 'spending') {
      await this.updateChildBalance(transaction.child_id, -transaction.amount);
    }

    return data;
  }

  static async updateChildBalance(
    childId: string,
    amountChange: number
  ): Promise<void> {
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

      await supabase.from('children').update(updates).eq('id', childId);
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

  static async createGoal(
    goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Goal | null> {
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

  static async updateGoal(
    goalId: string,
    updates: Partial<Goal>
  ): Promise<Goal | null> {
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
  static async getPurchaseRequests(
    familyId: string
  ): Promise<PurchaseRequest[]> {
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

  static async createPurchaseRequest(
    request: Omit<PurchaseRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PurchaseRequest | null> {
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

  static async updatePurchaseRequest(
    requestId: string,
    updates: Partial<PurchaseRequest>
  ): Promise<PurchaseRequest | null> {
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
}
