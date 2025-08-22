import { supabase } from '@/lib/supabase/client';
import type { 
  Database, 
  Family, 
  User, 
  Transaction, 
  Goal, 
  PurchaseRequest,
  InsertFamily,
  InsertUser,
  InsertTransaction,
  InsertGoal,
  InsertPurchaseRequest
} from '@/lib/supabase/types';

export class DatabaseService {
  
  // ========== FAMILIES ==========
  
  static async createFamily(familyData: InsertFamily): Promise<Family | null> {
    try {
      const { data, error } = await supabase
        .from('families')
        .insert(familyData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating family:', error);
      return null;
    }
  }
  
  static async getFamilyById(familyId: string): Promise<Family | null> {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting family:', error);
      return null;
    }
  }
  
  static async updateFamily(familyId: string, updates: Partial<Family>): Promise<Family | null> {
    try {
      const { data, error } = await supabase
        .from('families')
        .update(updates)
        .eq('id', familyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating family:', error);
      return null;
    }
  }
  
  // ========== USERS ==========
  
  static async createUser(userData: InsertUser): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }
  
  static async getUsersByFamily(familyId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting family users:', error);
      return [];
    }
  }
  
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
  static async updateUserBalance(userId: string, newBalance: number): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return null;
    }
  }
  
  // ========== TRANSACTIONS ==========
  
  static async createTransaction(transactionData: InsertTransaction): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }
  
  static async getTransactionsByUser(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }
  
  static async getTransactionsByFamily(familyId: string, limit: number = 100): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting family transactions:', error);
      return [];
    }
  }
  
  // ========== GOALS ==========
  
  static async createGoal(goalData: InsertGoal): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }
  
  static async getGoalsByUser(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user goals:', error);
      return [];
    }
  }
  
  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  }
  
  // ========== PURCHASE REQUESTS ==========
  
  static async createPurchaseRequest(requestData: InsertPurchaseRequest): Promise<PurchaseRequest | null> {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating purchase request:', error);
      return null;
    }
  }
  
  static async getPurchaseRequestsByFamily(familyId: string): Promise<PurchaseRequest[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting family purchase requests:', error);
      return [];
    }
  }
  
  static async getPurchaseRequestsByUser(userId: string): Promise<PurchaseRequest[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user purchase requests:', error);
      return [];
    }
  }
  
  static async updatePurchaseRequestStatus(
    requestId: string, 
    status: 'approved' | 'rejected', 
    approvedBy: string,
    rejectionReason?: string
  ): Promise<PurchaseRequest | null> {
    try {
      const updates: any = {
        status,
        approved_by: approvedBy,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      };
      
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }
      
      const { data, error } = await supabase
        .from('purchase_requests')
        .update(updates)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating purchase request status:', error);
      return null;
    }
  }
  
  // ========== REAL-TIME SUBSCRIPTIONS ==========
  
  static subscribeToFamilyTransactions(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel('family-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  }
  
  static subscribeToFamilyRequests(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel('family-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_requests',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  }
  
  static subscribeToUserBalance(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-balance')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
  
  // ========== MIGRATION HELPERS ==========
  
  static async migrateLocalStorageData(familyId: string, userId: string) {
    try {
      console.log('🔄 Starting localStorage migration...');
      
      // Migrate transactions
      const savedTransactions = JSON.parse(localStorage.getItem(`child-${userId}-transactions`) || '[]');
      for (const txn of savedTransactions) {
        await this.createTransaction({
          user_id: userId,
          family_id: familyId,
          type: txn.type || 'purchase',
          amount: txn.amount,
          description: txn.description,
          balance_after: txn.balanceAfter || 0,
          created_at: txn.timestamp
        });
      }
      
      // Migrate goals
      const savedGoals = JSON.parse(localStorage.getItem(`child-${userId}-goals`) || '[]');
      for (const goal of savedGoals) {
        await this.createGoal({
          user_id: userId,
          family_id: familyId,
          name: goal.name,
          description: goal.description,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          icon: goal.icon || '🎯'
        });
      }
      
      // Migrate purchase requests
      const savedRequests = JSON.parse(localStorage.getItem(`child-${userId}-requests`) || '[]');
      for (const req of savedRequests) {
        await this.createPurchaseRequest({
          user_id: userId,
          family_id: familyId,
          amount: req.amount,
          description: req.description,
          status: req.status || 'pending',
          created_at: req.timestamp
        });
      }
      
      console.log('✅ localStorage migration completed');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  }
}