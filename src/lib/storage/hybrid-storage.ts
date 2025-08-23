// Temporarily using localStorage only - Supabase integration will be added later
import type {
  Family,
  User,
  Transaction,
  Goal,
  PurchaseRequest,
} from '@/lib/types';

/**
 * Helper function to check if we're on the client side
 */
const isClient = () => typeof window !== 'undefined';

/**
 * Safe localStorage access - returns null on server
 */
const safeLocalStorage = {
  getItem: (key: string) => (isClient() ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string) =>
    isClient() ? localStorage.setItem(key, value) : undefined,
  removeItem: (key: string) =>
    isClient() ? localStorage.removeItem(key) : undefined,
};

/**
 * Hybrid Storage Service - Currently using localStorage only
 */
export class HybridStorage {
  // ========== FAMILY METHODS ==========

  static async updateFamily(updates: Partial<Family>): Promise<void> {
    const family = await this.getOrCreateFamily(
      updates.parentEmail || 'user@example.com'
    );
    const updatedFamily = {
      ...family,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    safeLocalStorage.setItem('currentFamily', JSON.stringify(updatedFamily));
  }

  static async getOrCreateFamily(email: string): Promise<Family> {
    const stored = safeLocalStorage.getItem('currentFamily');

    if (stored) {
      return JSON.parse(stored);
    }

    // Create new family
    const newFamily: Family = {
      id: crypto.randomUUID(),
      parentName: 'Parent',
      parentEmail: email,
      parentAvatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    safeLocalStorage.setItem('currentFamily', JSON.stringify(newFamily));
    return newFamily;
  }

  // ========== USER METHODS ==========

  static async getUsers(familyId: string): Promise<User[]> {
    const stored = safeLocalStorage.getItem(`users_${familyId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const users = await this.getUsers(userData.familyId);

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    safeLocalStorage.setItem(
      `users_${userData.familyId}`,
      JSON.stringify(users)
    );

    return newUser;
  }

  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const users = await this.getUsers(updates.familyId || '');
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    safeLocalStorage.setItem(
      `users_${users[index].familyId}`,
      JSON.stringify(users)
    );

    return users[index];
  }

  static async deleteUser(userId: string, familyId: string): Promise<void> {
    const users = await this.getUsers(familyId);
    const filteredUsers = users.filter(u => u.id !== userId);
    safeLocalStorage.setItem(
      `users_${familyId}`,
      JSON.stringify(filteredUsers)
    );
  }

  // ========== TRANSACTION METHODS ==========

  static async getTransactions(userId: string): Promise<Transaction[]> {
    const stored = safeLocalStorage.getItem(`transactions_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<Transaction> {
    const transactions = await this.getTransactions(transactionData.userId);

    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    safeLocalStorage.setItem(
      `transactions_${transactionData.userId}`,
      JSON.stringify(transactions)
    );

    return newTransaction;
  }

  // ========== GOAL METHODS ==========

  static async getGoals(userId: string): Promise<Goal[]> {
    const stored = safeLocalStorage.getItem(`goals_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static async createGoal(
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Goal> {
    const goals = await this.getGoals(goalData.userId);

    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    goals.push(newGoal);
    safeLocalStorage.setItem(`goals_${goalData.userId}`, JSON.stringify(goals));

    return newGoal;
  }

  // ========== PURCHASE REQUEST METHODS ==========

  static async getPurchaseRequests(userId: string): Promise<PurchaseRequest[]> {
    const stored = safeLocalStorage.getItem(`requests_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static async createPurchaseRequest(
    requestData: Omit<PurchaseRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PurchaseRequest> {
    const requests = await this.getPurchaseRequests(requestData.userId);

    const newRequest: PurchaseRequest = {
      ...requestData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    safeLocalStorage.setItem(
      `requests_${requestData.userId}`,
      JSON.stringify(requests)
    );

    return newRequest;
  }
}
