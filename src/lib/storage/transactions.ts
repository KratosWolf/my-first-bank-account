// Storage service for transaction history
export interface Transaction {
  id: string;
  childId: string;
  amount: number;
  category: string;
  description: string;
  timestamp: string;
  type: 'income' | 'expense';
}

const TRANSACTIONS_STORAGE_KEY = 'banco-familia-transactions';

export class TransactionsStorage {
  static getAll(parentId: string): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!data) return [];

      const allTransactions: Transaction[] = JSON.parse(data);
      return allTransactions.filter(tx => tx.childId.includes(parentId));
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  static getByChild(childId: string): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (!data) return [];

      const allTransactions: Transaction[] = JSON.parse(data);
      return allTransactions
        .filter(tx => tx.childId === childId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    } catch (error) {
      console.error('Error loading child transactions:', error);
      return [];
    }
  }

  static save(transaction: Transaction): void {
    try {
      const allTransactions = this.getAllRaw();
      allTransactions.push(transaction);
      localStorage.setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify(allTransactions)
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Falha ao salvar transação');
    }
  }

  static generateId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getAllRaw(): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading raw transactions data:', error);
      return [];
    }
  }

  static getRecentTransactions(
    parentId: string,
    limit: number = 10
  ): Transaction[] {
    return this.getAll(parentId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }
}

export const TRANSACTION_CATEGORIES = {
  allowance: {
    label: 'Mesada',
    color: 'bg-blue-100 text-blue-800',
    icon: '💰',
  },
  chore: { label: 'Tarefa', color: 'bg-green-100 text-green-800', icon: '🧹' },
  gift: {
    label: 'Presente',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎁',
  },
  purchase: { label: 'Compra', color: 'bg-red-100 text-red-800', icon: '🛒' },
  reward: {
    label: 'Prêmio',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🏆',
  },
  other: { label: 'Outro', color: 'bg-gray-100 text-gray-800', icon: '📝' },
};
