import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  AllowanceConfig,
  SpendingCategory,
  ChildSpendingLimit,
  InterestConfig,
} from '@/lib/supabase';

export class TransactionService {
  // ============ TRANSACTION OPERATIONS ============

  // Get all transactions for a child
  static async getChildTransactions(
    childId: string,
    limit = 50
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  // Get transactions by type for a child
  static async getTransactionsByType(
    childId: string,
    type: Transaction['type'],
    limit = 20
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', childId)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions by type:', error);
      return [];
    }

    return data || [];
  }

  // Get pending transactions (requiring approval)
  static async getPendingTransactions(
    familyId: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        children!inner(
          id, name, avatar, family_id
        )
      `
      )
      .eq('children.family_id', familyId)
      .eq('status', 'pending')
      .eq('requires_approval', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }

    return data || [];
  }

  // Create a new transaction
  static async createTransaction(
    transactionData: any
  ): Promise<Transaction | null> {
    console.log('💰 Creating transaction:', transactionData);

    // Only use fields that exist in the database
    const dbData = {
      child_id: transactionData.child_id,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      category: transactionData.category,
    };

    console.log('💰 Inserting to DB:', dbData);

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating transaction:', error);
      return null;
    }

    console.log('✅ Transaction created:', data);
    return data;
  }

  // Approve or reject a pending transaction
  static async approveTransaction(
    transactionId: string,
    approved: boolean,
    parentNote?: string
  ): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: approved ? 'completed' : 'rejected',
        approved_by_parent: approved,
        parent_note: parentNote,
        approved_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error approving transaction:', error);
      return null;
    }

    return data;
  }

  // ============ EARNINGS HELPERS ============

  // Add earning (allowance, chores, gifts)
  static async addEarning(
    childId: string,
    amount: number,
    description: string,
    category = 'other'
  ): Promise<Transaction | null> {
    return this.createTransaction({
      child_id: childId,
      type: 'earning',
      amount,
      description,
      category,
    });
  }

  // Add allowance payment
  static async addAllowance(
    childId: string,
    amount: number,
    period: string
  ): Promise<Transaction | null> {
    return this.createTransaction({
      child_id: childId,
      type: 'allowance',
      amount,
      description: `${period} allowance payment`,
      category: 'allowance',
    });
  }

  // ============ SPENDING HELPERS ============

  // Request spending (may require approval)
  static async requestSpending(
    childId: string,
    amount: number,
    description: string,
    category: string,
    requiresApproval = true
  ): Promise<Transaction | null> {
    return this.createTransaction({
      child_id: childId,
      type: 'spending',
      amount,
      description,
      category,
    });
  }

  // ============ TRANSFER HELPERS ============

  // Transfer money between children
  static async transferMoney(
    fromChildId: string,
    toChildId: string,
    amount: number,
    description: string
  ): Promise<Transaction | null> {
    return this.createTransaction({
      child_id: fromChildId, // Transaction belongs to sender
      type: 'transfer',
      amount,
      description,
      category: 'transfer',
      status: 'completed',
      requires_approval: false,
      approved_by_parent: true,
      from_child_id: fromChildId,
      to_child_id: toChildId,
    });
  }

  // ============ ALLOWANCE MANAGEMENT ============

  // Get allowance configuration for a child
  static async getAllowanceConfig(
    childId: string
  ): Promise<AllowanceConfig | null> {
    const { data, error } = await supabase
      .from('allowance_config')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (error) {
      console.error('Error fetching allowance config:', error);
      return null;
    }

    return data;
  }

  // Set allowance configuration
  static async setAllowanceConfig(
    config: Omit<AllowanceConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AllowanceConfig | null> {
    const { data, error } = await supabase
      .from('allowance_config')
      .upsert(config, { onConflict: 'child_id' })
      .select()
      .single();

    if (error) {
      console.error('Error setting allowance config:', error);
      return null;
    }

    return data;
  }

  // ============ SPENDING CATEGORIES ============

  // Get all active spending categories
  static async getSpendingCategories(): Promise<SpendingCategory[]> {
    const { data, error } = await supabase
      .from('spending_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching spending categories:', error);
      return [];
    }

    return data || [];
  }

  // ============ ANALYTICS HELPERS ============

  // Get spending by category for a child
  static async getSpendingByCategory(
    childId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ category: string; total: number; count: number }[]> {
    let query = supabase
      .from('transactions')
      .select('category, amount')
      .eq('child_id', childId)
      .eq('type', 'spending')
      .eq('status', 'completed');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching spending by category:', error);
      return [];
    }

    // Group by category and sum amounts
    const categoryTotals: { [key: string]: { total: number; count: number } } =
      {};

    data?.forEach(transaction => {
      const category = transaction.category || 'Other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, count: 0 };
      }
      categoryTotals[category].total += transaction.amount;
      categoryTotals[category].count += 1;
    });

    return Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    }));
  }

  // Get monthly summary for a child
  static async getMonthlySummary(
    childId: string,
    year: number,
    month: number
  ): Promise<{
    totalEarnings: number;
    totalSpending: number;
    netSavings: number;
    transactionCount: number;
  }> {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('Error fetching monthly summary:', error);
      return {
        totalEarnings: 0,
        totalSpending: 0,
        netSavings: 0,
        transactionCount: 0,
      };
    }

    let totalEarnings = 0;
    let totalSpending = 0;

    data?.forEach(transaction => {
      if (['earning', 'allowance', 'interest'].includes(transaction.type)) {
        totalEarnings += transaction.amount;
      } else if (transaction.type === 'spending') {
        totalSpending += transaction.amount;
      }
    });

    return {
      totalEarnings,
      totalSpending,
      netSavings: totalEarnings - totalSpending,
      transactionCount: data?.length || 0,
    };
  }

  // ============ INTEREST CALCULATION ============

  // Calculate and apply interest for a child (Nova lógica: 1% mensal + 30 dias mínimos)
  static async calculateInterest(childId: string): Promise<Transaction | null> {
    try {
      // Get interest configuration
      const { data: config, error: configError } = await supabase
        .from('interest_config')
        .select('*')
        .eq('child_id', childId)
        .eq('is_active', true)
        .single();

      if (configError || !config) {
        console.log('No interest config found for child:', childId);
        return null;
      }

      // Get current balance
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('balance, created_at')
        .eq('id', childId)
        .single();

      if (childError || !child) {
        console.error('Error fetching child balance:', childError);
        return null;
      }

      // Check if balance meets minimum
      if (child.balance < config.minimum_balance) {
        console.log(
          'Balance below minimum for interest:',
          child.balance,
          '<',
          config.minimum_balance
        );
        return null;
      }

      // NOVA REGRA: Calcular quanto dinheiro está há pelo menos 30 dias na conta
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Buscar todas as transações dos últimos 30 dias que AUMENTARAM o saldo
      const { data: recentTransactions, error: txError } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('child_id', childId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('type', ['earning', 'allowance', 'reward', 'transfer', 'interest'])
        .order('created_at', { ascending: true });

      if (txError) {
        console.error('Error fetching recent transactions:', txError);
        return null;
      }

      // Calcular o saldo elegível (dinheiro que está há 30+ dias na conta)
      let eligibleBalance = child.balance;

      if (recentTransactions && recentTransactions.length > 0) {
        // Subtrair todas as entradas dos últimos 30 dias do saldo atual
        const recentDeposits = recentTransactions.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        eligibleBalance = child.balance - recentDeposits;
      }

      // Garantir que não seja negativo
      eligibleBalance = Math.max(0, eligibleBalance);

      if (eligibleBalance < config.minimum_balance) {
        console.log(
          'Eligible balance (30+ days) below minimum:',
          eligibleBalance,
          '<',
          config.minimum_balance
        );
        return null;
      }

      // TAXA MENSAL: Converter de percentual para decimal
      // Exemplo: monthly_rate = 9.9 (9.9%) → monthlyDecimal = 0.099
      const monthlyDecimal = config.monthly_rate / 100;

      // Calcular juros apenas sobre o dinheiro elegível (30+ dias)
      const interestAmount =
        Math.round(eligibleBalance * monthlyDecimal * 100) / 100;

      if (interestAmount < 0.01) {
        console.log('Interest amount too small:', interestAmount);
        return null;
      }

      // Criar transação de juros
      const transaction = await this.createTransaction({
        child_id: childId,
        type: 'interest',
        amount: interestAmount,
        description: `Rendimento mensal (${config.monthly_rate.toFixed(1)}% sobre R$ ${eligibleBalance.toFixed(2)})`,
        category: 'interest',
        status: 'completed',
        requires_approval: false,
        approved_by_parent: true,
      });

      // Atualizar data da última aplicação
      if (transaction) {
        await supabase
          .from('interest_config')
          .update({
            last_interest_date: new Date().toISOString().split('T')[0],
          })
          .eq('child_id', childId);

        console.log(
          `✅ Juros aplicados: R$ ${interestAmount.toFixed(2)} sobre R$ ${eligibleBalance.toFixed(2)} (saldo elegível de 30+ dias)`
        );
      }

      return transaction;
    } catch (error) {
      console.error('Error calculating interest:', error);
      return null;
    }
  }
}
