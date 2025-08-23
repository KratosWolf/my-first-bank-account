interface SpendingTransaction {
  id: number;
  childId: number;
  childName: string;
  amount: number;
  description: string;
  category: string;
  categoryId: number;
  date: string;
  type: 'expense' | 'allowance' | 'gift' | 'goal_deposit';
  createdAt: string;
  updatedAt: string;
}

interface SpendingCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  parentId: number;
  childId?: number; // If null, available to all children of the parent
  isActive: boolean;
  monthlyBudget?: number;
  createdAt: string;
  updatedAt: string;
}

interface MonthlySpending {
  categoryId: number;
  categoryName: string;
  totalSpent: number;
  budget?: number;
  transactionCount: number;
  percentage: number;
}

// Global storage for spending transactions
if (!(globalThis as any).__spendingTransactions) {
  (globalThis as any).__spendingTransactions = [];
  (globalThis as any).__spendingTransactionNextId = 1;
}

// Global storage for spending categories
if (!(globalThis as any).__spendingCategories) {
  (globalThis as any).__spendingCategories = [
    {
      id: 1,
      name: 'Brinquedos',
      icon: '🧸',
      color: '#FF6B6B',
      parentId: 1,
      isActive: true,
      monthlyBudget: 50.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Roupas',
      icon: '👕',
      color: '#4ECDC4',
      parentId: 1,
      isActive: true,
      monthlyBudget: 100.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Livros',
      icon: '📚',
      color: '#45B7D1',
      parentId: 1,
      isActive: true,
      monthlyBudget: 30.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Doces',
      icon: '🍭',
      color: '#96CEB4',
      parentId: 1,
      isActive: true,
      monthlyBudget: 20.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Jogos',
      icon: '🎮',
      color: '#9B59B6',
      parentId: 1,
      isActive: true,
      monthlyBudget: 40.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Eletrônicos',
      icon: '📱',
      color: '#F39C12',
      parentId: 1,
      isActive: true,
      monthlyBudget: 200.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  (globalThis as any).__spendingCategoryNextId = 7;
}

export const SpendingStorage = {
  // Transaction methods
  getAllTransactions: (): SpendingTransaction[] => {
    return [...(globalThis as any).__spendingTransactions];
  },

  getTransactionsByChild: (childId: number): SpendingTransaction[] => {
    return (globalThis as any).__spendingTransactions.filter(
      (transaction: SpendingTransaction) => transaction.childId === childId
    );
  },

  getTransactionsByParent: (parentId: number): SpendingTransaction[] => {
    // This would typically require a join with children table
    // For now, we'll assume childId 1 belongs to parentId 1
    return (globalThis as any).__spendingTransactions.filter(
      (transaction: SpendingTransaction) => transaction.childId === 1 // Mock logic
    );
  },

  createTransaction: (
    transaction: Omit<SpendingTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): SpendingTransaction => {
    const nextId = (globalThis as any).__spendingTransactionNextId++;
    const newTransaction: SpendingTransaction = {
      ...transaction,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (globalThis as any).__spendingTransactions.push(newTransaction);
    return newTransaction;
  },

  updateTransaction: (
    id: number,
    updates: Partial<Omit<SpendingTransaction, 'id' | 'createdAt'>>
  ): SpendingTransaction | null => {
    const index = (globalThis as any).__spendingTransactions.findIndex(
      (transaction: SpendingTransaction) => transaction.id === id
    );

    if (index === -1) return null;

    const updated = {
      ...(globalThis as any).__spendingTransactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    (globalThis as any).__spendingTransactions[index] = updated;
    return updated;
  },

  deleteTransaction: (id: number): boolean => {
    const index = (globalThis as any).__spendingTransactions.findIndex(
      (transaction: SpendingTransaction) => transaction.id === id
    );

    if (index === -1) return false;

    (globalThis as any).__spendingTransactions.splice(index, 1);
    return true;
  },

  // Category methods
  getAllCategories: (): SpendingCategory[] => {
    return [...(globalThis as any).__spendingCategories];
  },

  getCategoriesByParent: (parentId: number): SpendingCategory[] => {
    return (globalThis as any).__spendingCategories.filter(
      (category: SpendingCategory) =>
        category.parentId === parentId && category.isActive
    );
  },

  getCategoryById: (id: number): SpendingCategory | null => {
    return (
      (globalThis as any).__spendingCategories.find(
        (category: SpendingCategory) => category.id === id
      ) || null
    );
  },

  createCategory: (
    category: Omit<SpendingCategory, 'id' | 'createdAt' | 'updatedAt'>
  ): SpendingCategory => {
    const nextId = (globalThis as any).__spendingCategoryNextId++;
    const newCategory: SpendingCategory = {
      ...category,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (globalThis as any).__spendingCategories.push(newCategory);
    return newCategory;
  },

  updateCategory: (
    id: number,
    updates: Partial<Omit<SpendingCategory, 'id' | 'createdAt'>>
  ): SpendingCategory | null => {
    const index = (globalThis as any).__spendingCategories.findIndex(
      (category: SpendingCategory) => category.id === id
    );

    if (index === -1) return null;

    const updated = {
      ...(globalThis as any).__spendingCategories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    (globalThis as any).__spendingCategories[index] = updated;
    return updated;
  },

  deleteCategory: (id: number): boolean => {
    const index = (globalThis as any).__spendingCategories.findIndex(
      (category: SpendingCategory) => category.id === id
    );

    if (index === -1) return false;

    // Instead of deleting, mark as inactive
    (globalThis as any).__spendingCategories[index].isActive = false;
    (globalThis as any).__spendingCategories[index].updatedAt =
      new Date().toISOString();
    return true;
  },

  // Analytics methods
  getMonthlySpendingByChild: (
    childId: number,
    month?: string
  ): MonthlySpending[] => {
    const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format

    const transactions = (globalThis as any).__spendingTransactions.filter(
      (transaction: SpendingTransaction) =>
        transaction.childId === childId &&
        transaction.type === 'expense' &&
        transaction.date.startsWith(targetMonth)
    );

    const categories = (globalThis as any).__spendingCategories.filter(
      (category: SpendingCategory) => category.isActive
    );

    const spendingByCategory = new Map<
      number,
      {
        categoryName: string;
        totalSpent: number;
        budget?: number;
        transactionCount: number;
      }
    >();

    // Initialize categories
    categories.forEach((category: SpendingCategory) => {
      spendingByCategory.set(category.id, {
        categoryName: category.name,
        totalSpent: 0,
        budget: category.monthlyBudget,
        transactionCount: 0,
      });
    });

    // Calculate spending
    transactions.forEach((transaction: SpendingTransaction) => {
      const existing = spendingByCategory.get(transaction.categoryId);
      if (existing) {
        existing.totalSpent += transaction.amount;
        existing.transactionCount += 1;
      }
    });

    // Convert to array and calculate percentages
    const totalSpent = transactions.reduce(
      (sum: number, t: SpendingTransaction) => sum + t.amount,
      0
    );

    return Array.from(spendingByCategory.entries()).map(
      ([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        totalSpent: data.totalSpent,
        budget: data.budget,
        transactionCount: data.transactionCount,
        percentage: totalSpent > 0 ? (data.totalSpent / totalSpent) * 100 : 0,
      })
    );
  },

  getTotalSpentByChild: (
    childId: number,
    period: 'week' | 'month' | 'year' = 'month'
  ): number => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return (globalThis as any).__spendingTransactions
      .filter(
        (transaction: SpendingTransaction) =>
          transaction.childId === childId &&
          transaction.type === 'expense' &&
          new Date(transaction.date) >= startDate
      )
      .reduce(
        (sum: number, transaction: SpendingTransaction) =>
          sum + transaction.amount,
        0
      );
  },
};

export type { SpendingTransaction, SpendingCategory, MonthlySpending };
