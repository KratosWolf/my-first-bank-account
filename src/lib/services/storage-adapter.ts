import { DatabaseService } from './database';
import { supabase } from '@/lib/supabase';
import type { Child, Transaction } from '@/lib/supabase';

// Hybrid storage adapter that gradually migrates from localStorage to Supabase
export class StorageAdapter {
  private static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('id')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Children methods
  static async getChildren(familyId: string): Promise<Child[]> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await DatabaseService.getChildren(familyId);
      }
    } catch (error) {
      console.warn(
        'Supabase unavailable, falling back to localStorage:',
        error
      );
    }

    // Fallback to localStorage
    return this.getChildrenFromLocalStorage();
  }

  static async createChild(
    child: Omit<Child, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Child | null> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await DatabaseService.createChild(child);
      }
    } catch (error) {
      console.warn('Supabase unavailable, saving to localStorage:', error);
    }

    // Fallback to localStorage
    return this.createChildInLocalStorage(child);
  }

  static async getChildById(childId: string): Promise<Child | null> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await DatabaseService.getChildById(childId);
      }
    } catch (error) {
      console.warn('Supabase unavailable, checking localStorage:', error);
    }

    // Fallback to localStorage
    return this.getChildFromLocalStorage(childId);
  }

  // Transaction methods
  static async getTransactions(childId: string): Promise<Transaction[]> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await DatabaseService.getTransactions(childId);
      }
    } catch (error) {
      console.warn('Supabase unavailable, checking localStorage:', error);
    }

    // Fallback to localStorage
    return this.getTransactionsFromLocalStorage(childId);
  }

  static async createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Transaction | null> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        return await DatabaseService.createTransaction(transaction);
      }
    } catch (error) {
      console.warn('Supabase unavailable, saving to localStorage:', error);
    }

    // Fallback to localStorage
    return this.createTransactionInLocalStorage(transaction);
  }

  // LocalStorage fallback methods
  private static getChildrenFromLocalStorage(): Child[] {
    try {
      const data = localStorage.getItem('banco-familia-children');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static createChildInLocalStorage(
    childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>
  ): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      const newChild: Child = {
        ...childData,
        id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      children.push(newChild);
      localStorage.setItem('banco-familia-children', JSON.stringify(children));
      return newChild;
    } catch {
      return null;
    }
  }

  private static getChildFromLocalStorage(childId: string): Child | null {
    try {
      const children = this.getChildrenFromLocalStorage();
      return children.find(child => child.id === childId) || null;
    } catch {
      return null;
    }
  }

  private static getTransactionsFromLocalStorage(
    childId: string
  ): Transaction[] {
    try {
      const data = localStorage.getItem('banco-familia-transactions');
      if (!data) return [];

      const allTransactions = JSON.parse(data);
      return allTransactions
        .filter((tx: any) => tx.childId === childId || tx.child_id === childId)
        .map((tx: any) => ({
          id: tx.id,
          child_id: tx.childId || tx.child_id,
          type: this.mapTransactionType(tx.type || tx.category),
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
          created_at: tx.timestamp || tx.created_at || new Date().toISOString(),
        }))
        .sort(
          (a: Transaction, b: Transaction) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch {
      return [];
    }
  }

  private static createTransactionInLocalStorage(
    transactionData: Omit<Transaction, 'id' | 'created_at'>
  ): Transaction | null {
    try {
      const data = localStorage.getItem('banco-familia-transactions');
      const allTransactions = data ? JSON.parse(data) : [];

      const newTransaction: Transaction = {
        ...transactionData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };

      allTransactions.push(newTransaction);
      localStorage.setItem(
        'banco-familia-transactions',
        JSON.stringify(allTransactions)
      );

      // Update child balance in localStorage
      this.updateChildBalanceInLocalStorage(
        transactionData.child_id,
        transactionData.amount,
        transactionData.type
      );

      return newTransaction;
    } catch {
      return null;
    }
  }

  private static updateChildBalanceInLocalStorage(
    childId: string,
    amount: number,
    type: string
  ): void {
    try {
      const children = this.getChildrenFromLocalStorage();
      const childIndex = children.findIndex(child => child.id === childId);

      if (childIndex !== -1) {
        const child = children[childIndex];
        const balanceChange =
          type === 'earning' || type === 'allowance' ? amount : -amount;

        child.balance = Math.max(0, child.balance + balanceChange);
        if (balanceChange > 0) {
          child.total_earned += amount;
        } else {
          child.total_spent += amount;
        }
        child.updated_at = new Date().toISOString();

        localStorage.setItem(
          'banco-familia-children',
          JSON.stringify(children)
        );
      }
    } catch (error) {
      console.error('Error updating child balance in localStorage:', error);
    }
  }

  private static mapTransactionType(oldType: string): Transaction['type'] {
    const typeMap: Record<string, Transaction['type']> = {
      allowance: 'allowance',
      chore: 'earning',
      gift: 'earning',
      reward: 'earning',
      purchase: 'spending',
      other: 'spending',
      income: 'earning',
      expense: 'spending',
    };

    return typeMap[oldType] || 'spending';
  }

  // Migration helper - move localStorage data to Supabase
  static async migrateLocalStorageToSupabase(
    familyId: string
  ): Promise<boolean> {
    try {
      if (!(await this.isSupabaseAvailable())) {
        console.warn('Supabase not available for migration');
        return false;
      }

      // Migrate children
      const localChildren = this.getChildrenFromLocalStorage();
      const migratedChildren: Child[] = [];

      for (const localChild of localChildren) {
        const childData = {
          family_id: familyId,
          name: localChild.name,
          pin: localChild.pin,
          avatar: localChild.avatar,
          balance: localChild.balance || 0,
          total_earned: localChild.total_earned || 0,
          total_spent: localChild.total_spent || 0,
          level: localChild.level || 1,
          xp: localChild.xp || 0,
        };

        const migratedChild = await DatabaseService.createChild(childData);
        if (migratedChild) {
          migratedChildren.push(migratedChild);

          // Migrate transactions for this child
          const localTransactions = this.getTransactionsFromLocalStorage(
            localChild.id
          );
          for (const localTransaction of localTransactions) {
            await DatabaseService.createTransaction({
              child_id: migratedChild.id,
              type: localTransaction.type,
              amount: localTransaction.amount,
              description: localTransaction.description,
              category: localTransaction.category,
              status: 'completed',
              requires_approval: false,
              approved_by_parent: true,
            });
          }
        }
      }

      console.log(
        `Successfully migrated ${migratedChildren.length} children and their transactions`
      );
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }
}
