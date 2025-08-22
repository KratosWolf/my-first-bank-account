import { supabase } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/services/database-service';
import type { Family, User, Transaction, Goal, PurchaseRequest } from '@/lib/supabase/types';

/**
 * Helper function to check if we're on the client side
 */
const isClient = () => typeof window !== 'undefined';

/**
 * Safe localStorage access - returns null on server
 */
const safeLocalStorage = {
  getItem: (key: string) => isClient() ? safeLocalStorage.getItem(key) : null,
  setItem: (key: string, value: string) => isClient() ? safeLocalStorage.setItem(key, value) : undefined,
  removeItem: (key: string) => isClient() ? localStorage.removeItem(key) : undefined
};

/**
 * Hybrid Storage Service - Uses Supabase when available, falls back to localStorage
 */
export class HybridStorage {
  private static useSupabase = true;
  
  // Check if Supabase is available
  static async testSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('families').select('count').limit(1);
      if (error) {
        console.warn('⚠️ Supabase connection failed, using localStorage:', error.message);
        this.useSupabase = false;
        return false;
      }
      console.log('✅ Supabase connection successful');
      this.useSupabase = true;
      return true;
    } catch (error) {
      console.warn('⚠️ Supabase connection failed, using localStorage:', error);
      this.useSupabase = false;
      return false;
    }
  }

  // ========== FAMILY METHODS ==========

  static async updateFamily(updates: any): Promise<void> {
    await this.testSupabaseConnection();
    
    if (this.useSupabase) {
      try {
        await DatabaseService.updateFamily(updates);
      } catch (error) {
        console.warn('Failed to update family in Supabase, using localStorage fallback');
        // Store in localStorage as fallback
        const existingFamily = JSON.parse(safeLocalStorage.getItem('family') || '{}');
        const updatedFamily = { ...existingFamily, ...updates };
        safeLocalStorage.setItem('family', JSON.stringify(updatedFamily));
      }
    } else {
      // Store in localStorage
      const existingFamily = JSON.parse(safeLocalStorage.getItem('family') || '{}');
      const updatedFamily = { ...existingFamily, ...updates };
      safeLocalStorage.setItem('family', JSON.stringify(updatedFamily));
    }
  }

  static async getOrCreateFamily(email?: string): Promise<{ family: Family | any, user: User | any }> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      // Try to get existing family from Supabase
      // For now, we'll create a default family
      const defaultFamily = {
        name: 'Minha Família',
        currency: 'BRL',
        allowance_amount: 20.00,
        allowance_frequency: 'monthly',
        require_approval_over: 0.00, // User wanted all purchases to require approval
        family_mission: 'Ensinar nossos filhos sobre o valor do dinheiro e a importância de poupar para seus sonhos.',
        savings_interest_rate: 1.0,
        interest_enabled: true,
        interest_application_day: 30
      };

      const family = await DatabaseService.createFamily(defaultFamily);
      
      if (family) {
        // Create default parent user
        const defaultParent = {
          family_id: family.id,
          name: 'Pai/Mãe',
          email: 'parent@family.com',
          role: 'parent' as const,
          balance: 0,
          level: 1,
          points: 0
        };

        const user = await DatabaseService.createUser(defaultParent);
        
        if (user) {
          // Store family and user IDs for future use
          safeLocalStorage.setItem('current_family_id', family.id);
          safeLocalStorage.setItem('current_user_id', user.id);
          
          return { family, user };
        }
      }
    }

    // Fallback to localStorage behavior (only on client)
    if (typeof window === 'undefined') {
      // Server-side: return default family
      return {
        id: 'temp-family',
        parentEmail: email,
        parentName: email.split('@')[0],
        parentAvatar: null,
        familyName: 'Minha Família',
        currency: 'BRL',
        allowanceAmount: 20.00,
        allowanceFrequency: 'monthly',
        requireApprovalOver: 0.00,
        familyMission: 'Ensinar nossos filhos sobre o valor do dinheiro e a importância de poupar para seus sonhos.',
        savingsInterestRate: 1.0,
        interestEnabled: true,
        interestApplicationDay: 30
      };
    }

    const familySettings = JSON.parse(safeLocalStorage.getItem('familySettings') || JSON.stringify({
      familyName: 'Minha Família',
      currency: 'BRL',
      allowanceAmount: 20.00,
      allowanceFrequency: 'monthly',
      requireApprovalOver: 0.00,
      familyMission: 'Ensinar nossos filhos sobre o valor do dinheiro e a importância de poupar para seus sonhos.',
      savingsInterestRate: 1.0,
      interestEnabled: true,
      interestApplicationDay: 30
    }));

    return { 
      family: familySettings, 
      user: { id: '1', name: 'Parent', role: 'parent' } 
    };
  }

  // ========== TRANSACTIONS ==========

  static async getTransactions(childId: string): Promise<Transaction[] | any[]> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      if (userId) {
        return await DatabaseService.getTransactionsByUser(userId);
      }
    }

    // Fallback to localStorage
    const saved = JSON.parse(safeLocalStorage.getItem(`child-${childId}-transactions`) || '[]');
    
    // Add base transactions if none exist
    if (saved.length === 0) {
      return [
        { amount: 25, description: 'Mesada da semana', timestamp: '2024-08-12T10:00:00Z', type: 'allowance' },
        { amount: -12.50, description: 'Lanche na escola', timestamp: '2024-08-11T14:30:00Z', type: 'purchase' },
        { amount: 25, description: 'Mesada da semana passada', timestamp: '2024-08-05T10:00:00Z', type: 'allowance' },
        { amount: 5, description: 'Bônus por ajudar em casa', timestamp: '2024-08-03T18:00:00Z', type: 'bonus' },
        { amount: 50, description: 'Mesada inicial', timestamp: '2024-08-01T10:00:00Z', type: 'allowance' }
      ];
    }
    
    return saved;
  }

  static async addTransaction(childId: string, transaction: any): Promise<boolean> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      const familyId = safeLocalStorage.getItem('current_family_id');
      
      if (userId && familyId) {
        const result = await DatabaseService.createTransaction({
          user_id: userId,
          family_id: familyId,
          type: transaction.type || 'purchase',
          amount: transaction.amount,
          description: transaction.description,
          balance_after: transaction.balanceAfter || 0,
          created_at: transaction.timestamp
        });
        
        if (result) {
          // Also update user balance
          await DatabaseService.updateUserBalance(userId, transaction.balanceAfter || 0);
          return true;
        }
      }
    }

    // Fallback to localStorage
    const existing = JSON.parse(safeLocalStorage.getItem(`child-${childId}-transactions`) || '[]');
    existing.push(transaction);
    safeLocalStorage.setItem(`child-${childId}-transactions`, JSON.stringify(existing));
    return true;
  }

  // ========== PURCHASE REQUESTS ==========

  static async getRequests(childId: string): Promise<PurchaseRequest[] | any[]> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      if (userId) {
        return await DatabaseService.getPurchaseRequestsByUser(userId);
      }
    }

    // Fallback to localStorage
    return JSON.parse(safeLocalStorage.getItem(`child-${childId}-requests`) || '[]');
  }

  static async addRequest(childId: string, request: any): Promise<boolean> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      const familyId = safeLocalStorage.getItem('current_family_id');
      
      if (userId && familyId) {
        const result = await DatabaseService.createPurchaseRequest({
          user_id: userId,
          family_id: familyId,
          amount: request.amount,
          description: request.description,
          status: request.status || 'pending',
          created_at: request.timestamp
        });
        
        return !!result;
      }
    }

    // Fallback to localStorage
    const existing = JSON.parse(safeLocalStorage.getItem(`child-${childId}-requests`) || '[]');
    existing.push(request);
    safeLocalStorage.setItem(`child-${childId}-requests`, JSON.stringify(existing));
    return true;
  }

  static async updateRequestStatus(childId: string, requestId: string, status: 'approved' | 'rejected', approvedBy: string, comment?: string): Promise<boolean> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const result = await DatabaseService.updatePurchaseRequestStatus(requestId, status, approvedBy, comment);
      return !!result;
    }

    // Fallback to localStorage
    const existing = JSON.parse(safeLocalStorage.getItem(`child-${childId}-requests`) || '[]');
    const updated = existing.map((req: any) => 
      req.id == requestId ? { 
        ...req, 
        status, 
        approved_by: approvedBy, 
        approved_at: new Date().toISOString(),
        parentComment: comment,
        processedAt: new Date().toISOString()
      } : req
    );
    safeLocalStorage.setItem(`child-${childId}-requests`, JSON.stringify(updated));
    
    // Force storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: `child-${childId}-requests`,
      newValue: JSON.stringify(updated)
    }));
    
    return true;
  }

  // ========== GOALS ==========

  static async getGoals(childId: string): Promise<Goal[] | any[]> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      if (userId) {
        return await DatabaseService.getGoalsByUser(userId);
      }
    }

    // Fallback to localStorage
    return JSON.parse(safeLocalStorage.getItem(`child-${childId}-goals`) || '[]');
  }

  static async addGoal(childId: string, goal: any): Promise<boolean> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const userId = await this.getSupabaseUserId(childId);
      const familyId = safeLocalStorage.getItem('current_family_id');
      
      if (userId && familyId) {
        const result = await DatabaseService.createGoal({
          user_id: userId,
          family_id: familyId,
          name: goal.name,
          description: goal.description,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          icon: goal.icon || '🎯'
        });
        
        return !!result;
      }
    }

    // Fallback to localStorage
    const existing = JSON.parse(safeLocalStorage.getItem(`child-${childId}-goals`) || '[]');
    existing.push(goal);
    safeLocalStorage.setItem(`child-${childId}-goals`, JSON.stringify(existing));
    return true;
  }

  // ========== HELPER METHODS ==========

  private static async getSupabaseUserId(localChildId: string): Promise<string | null> {
    // For now, return a mapped user ID or create one if needed
    // In a real implementation, you'd maintain a mapping between local IDs and Supabase UUIDs
    const mappingKey = `child-${localChildId}-supabase-id`;
    let supabaseId = safeLocalStorage.getItem(mappingKey);
    
    if (!supabaseId) {
      // Create a new child user in Supabase
      const familyId = safeLocalStorage.getItem('current_family_id');
      if (familyId) {
        const user = await DatabaseService.createUser({
          family_id: familyId,
          name: `Criança ${localChildId}`,
          pin: '1234',
          role: 'child',
          balance: 0,
          level: 1,
          points: 0
        });
        
        if (user) {
          safeLocalStorage.setItem(mappingKey, user.id);
          return user.id;
        }
      }
    }
    
    return supabaseId;
  }

  // ========== PURCHASE REQUEST APPROVAL SYSTEM ==========

  static async getAllFamilyRequests(): Promise<PurchaseRequest[] | any[]> {
    await this.testSupabaseConnection();

    if (this.useSupabase) {
      const familyId = safeLocalStorage.getItem('current_family_id');
      if (familyId) {
        return await DatabaseService.getPurchaseRequestsByFamily(familyId);
      }
    }

    // Fallback: Get all requests from localStorage
    if (!isClient()) return [];
    const allKeys = Object.keys(localStorage);
    const requestKeys = allKeys.filter(key => key.match(/^child-\d+-requests$/));
    
    let allRequests: any[] = [];
    requestKeys.forEach(key => {
      const childId = key.match(/^child-(\d+)-requests$/)?.[1];
      const requests = JSON.parse(safeLocalStorage.getItem(key) || '[]');
      const requestsWithChildId = requests.map((req: any) => ({
        ...req,
        childId: childId,
        user_id: childId
      }));
      allRequests = [...allRequests, ...requestsWithChildId];
    });

    return allRequests;
  }

  static async approveRequest(childId: string, requestId: string, approvedBy: string, comment?: string): Promise<boolean> {
    await this.testSupabaseConnection();

    const success = await this.updateRequestStatus(childId, requestId, 'approved', approvedBy, comment);
    
    if (success) {
      // Also create the corresponding transaction
      const allRequests = await this.getRequests(childId);
      const request = allRequests.find((req: any) => req.id == requestId);
      
      if (request) {
        // Get current balance
        const transactions = await this.getTransactions(childId);
        const currentBalance = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
        
        // Check if it's an advance/loan request
        const isAdvance = request.type === 'advance' || request.isAdvance;
        
        // Create transaction for approved request
        const newTransaction = {
          id: Date.now() + Math.random(), // Ensure unique ID
          type: isAdvance ? 'advance_approved' : 'purchase_approved',
          amount: isAdvance ? request.amount : -(request.amount || 0), // Advance adds money, purchase deducts
          description: isAdvance 
            ? `Empréstimo aprovado: R$ ${request.amount.toFixed(2)}` 
            : `Compra aprovada: ${request.description}`,
          timestamp: new Date().toISOString(),
          balanceAfter: isAdvance ? currentBalance + request.amount : currentBalance - (request.amount || 0),
          category: request.category || 'purchase',
          isDebt: isAdvance // Mark advances as debt
        };
        
        await this.addTransaction(childId, newTransaction);
        
        // If it's an advance, also create a debt record
        if (isAdvance) {
          const existingDebts = JSON.parse(safeLocalStorage.getItem(`child-${childId}-debts`) || '[]');
          const newDebt = {
            id: Date.now(),
            amount: request.amount,
            description: request.description,
            createdAt: new Date().toISOString(),
            status: 'pending'
          };
          existingDebts.push(newDebt);
          safeLocalStorage.setItem(`child-${childId}-debts`, JSON.stringify(existingDebts));
        }
        
        console.log(`✅ Request ${requestId} approved and transaction created (${isAdvance ? 'advance' : 'purchase'})`);
      }
    }
    
    return success;
  }

  static async rejectRequest(childId: string, requestId: string, approvedBy: string, reason?: string): Promise<boolean> {
    await this.testSupabaseConnection();

    return await this.updateRequestStatus(childId, requestId, 'rejected', approvedBy, reason);
  }

  // ========== REAL-TIME SYNCHRONIZATION ==========

  static subscribeToFamilyChanges(familyId: string, callback: (payload: any) => void) {
    if (!this.useSupabase) {
      // Fallback: Listen to localStorage changes and custom events
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.includes('child-') && (e.key?.includes('-transactions') || e.key?.includes('-requests'))) {
          callback({ eventType: 'storage_change', key: e.key, newValue: e.newValue });
        }
      };
      
      const handleCustomEvent = (e: CustomEvent) => {
        callback({ eventType: 'custom_change', detail: e.detail });
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('familyDataChanged', handleCustomEvent);
      window.addEventListener('balanceUpdated', handleCustomEvent);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('familyDataChanged', handleCustomEvent);
        window.removeEventListener('balanceUpdated', handleCustomEvent);
      };
    }
    
    return DatabaseService.subscribeToFamilyTransactions(familyId, callback);
  }

  static subscribeToFamilyRequests(familyId: string, callback: (payload: any) => void) {
    if (!this.useSupabase) {
      // Fallback: Listen to localStorage changes for requests specifically
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.includes('child-') && e.key?.includes('-requests')) {
          callback({ eventType: 'requests_change', key: e.key, newValue: e.newValue });
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    
    return DatabaseService.subscribeToFamilyRequests(familyId, callback);
  }

  // ========== UTILITY METHODS ==========
  
  static async triggerSync() {
    // Trigger a custom event to notify other tabs about changes
    window.dispatchEvent(new CustomEvent('familyDataChanged', {
      detail: { timestamp: Date.now() }
    }));
  }
}