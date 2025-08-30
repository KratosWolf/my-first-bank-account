import { supabase } from '@/lib/supabase';
import { StorageAdapter } from './storage-adapter';
import { TransactionService } from './transactions';
import type { Transaction } from '@/lib/supabase';

export interface StatementTransaction {
  id?: string;
  child_id: string;
  type: 'income' | 'expense' | 'transfer' | 'reward' | 'penalty' | 'allowance' | 'interest';
  category: 'task' | 'chore' | 'bonus' | 'purchase' | 'goal' | 'gift' | 'mesada' | 'transfer' | 'other';
  amount: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  reference_type?: 'task' | 'goal' | 'achievement' | 'parent_transfer';
  tags?: string[];
  notes?: string;
  created_at?: string;
  created_by?: string;
}

export interface StatementFilter {
  child_id?: string;
  type?: StatementTransaction['type'] | 'all';
  category?: StatementTransaction['category'] | 'all';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface StatementSummary {
  period: string;
  opening_balance: number;
  closing_balance: number;
  total_income: number;
  total_expenses: number;
  net_change: number;
  transaction_count: number;
  average_transaction: number;
  largest_income: StatementTransaction | null;
  largest_expense: StatementTransaction | null;
  categories: Array<{
    category: StatementTransaction['category'];
    icon: string;
    name: string;
    total: number;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  daily_breakdown: Array<{
    date: string;
    total_income: number;
    total_expenses: number;
    net_change: number;
    transaction_count: number;
  }>;
}

export interface MonthlyStatement {
  child_name: string;
  child_avatar: string;
  month: string;
  year: number;
  opening_balance: number;
  closing_balance: number;
  total_income: number;
  total_expenses: number;
  net_savings: number;
  transactions: StatementTransaction[];
  summary: StatementSummary;
  insights: Array<{
    icon: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'tip';
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    earned_date: string;
  }>;
}

export interface StatementExport {
  format: 'csv' | 'pdf' | 'json';
  content: string;
  filename: string;
  mime_type: string;
}

export class StatementsService {
  
  // Get detailed statement with advanced filtering
  static async getDetailedStatement(filter: StatementFilter): Promise<{
    transactions: StatementTransaction[];
    total_count: number;
    current_page: number;
    total_pages: number;
  }> {
    try {
      const page = filter.page || 1;
      const limit = filter.limit || 50;
      const offset = (page - 1) * limit;

      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        let query = supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        // Apply filters
        if (filter.child_id) query = query.eq('child_id', filter.child_id);
        if (filter.type && filter.type !== 'all') query = query.eq('type', filter.type);
        if (filter.category && filter.category !== 'all') query = query.eq('category', filter.category);
        if (filter.date_from) query = query.gte('created_at', filter.date_from);
        if (filter.date_to) query = query.lte('created_at', filter.date_to);
        if (filter.min_amount) query = query.gte('amount', filter.min_amount);
        if (filter.max_amount) query = query.lte('amount', filter.max_amount);

        const { data, error, count } = await query;
        
        if (error) {
          return this.getStatementFromStorage(filter);
        }

        let transactions = this.mapToStatementTransactions(data || []);

        // Apply search and tag filters (not supported in Supabase query)
        transactions = this.applyClientSideFilters(transactions, filter);

        return {
          transactions,
          total_count: count || 0,
          current_page: page,
          total_pages: Math.ceil((count || 0) / limit)
        };
      }

      // Fallback to localStorage
      return this.getStatementFromStorage(filter);

    } catch (error) {
      console.error('Error getting detailed statement:', error);
      return this.getStatementFromStorage(filter);
    }
  }

  // Get comprehensive statement summary
  static async getStatementSummary(
    childId: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<StatementSummary> {
    try {
      const { transactions } = await this.getDetailedStatement({
        child_id: childId,
        date_from: dateFrom,
        date_to: dateTo,
        limit: 1000 // Get all for summary
      });

      // Get opening balance (balance before period start)
      const openingBalance = await this.getBalanceAtDate(childId, dateFrom);
      const closingBalance = transactions.length > 0 ? transactions[0].balance_after : openingBalance;

      const income = transactions.filter(t => ['income', 'reward', 'allowance', 'interest', 'transfer'].includes(t.type) && t.amount > 0);
      const expenses = transactions.filter(t => ['expense', 'penalty'].includes(t.type) || t.amount < 0);

      const totalIncome = income.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Category analysis
      const categoryStats = this.analyzeCategoriesWithTrends(transactions, dateFrom, dateTo);

      // Daily breakdown
      const dailyBreakdown = this.generateDailyBreakdown(transactions, dateFrom, dateTo);

      return {
        period: `${new Date(dateFrom).toLocaleDateString('pt-BR')} - ${new Date(dateTo).toLocaleDateString('pt-BR')}`,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_change: totalIncome - totalExpenses,
        transaction_count: transactions.length,
        average_transaction: transactions.length > 0 
          ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length 
          : 0,
        largest_income: income.length > 0 
          ? income.reduce((max, t) => t.amount > max.amount ? t : max, income[0])
          : null,
        largest_expense: expenses.length > 0
          ? expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenses[0])
          : null,
        categories: categoryStats,
        daily_breakdown: dailyBreakdown
      };

    } catch (error) {
      console.error('Error getting statement summary:', error);
      return this.getEmptyStatementSummary(dateFrom, dateTo);
    }
  }

  // Get monthly statement with insights and achievements
  static async getMonthlyStatement(
    childId: string, 
    year: number, 
    month: number
  ): Promise<MonthlyStatement> {
    try {
      const child = await StorageAdapter.getChildById(childId);
      if (!child) throw new Error('Child not found');

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const dateFrom = startDate.toISOString().split('T')[0];
      const dateTo = endDate.toISOString().split('T')[0];

      const { transactions } = await this.getDetailedStatement({
        child_id: childId,
        date_from: dateFrom,
        date_to: dateTo,
        limit: 1000
      });

      const summary = await this.getStatementSummary(childId, dateFrom, dateTo);
      const insights = this.generateMonthlyInsights(child, transactions, summary);
      const achievements = await this.getMonthlyAchievements(childId, dateFrom, dateTo);

      return {
        child_name: child.name,
        child_avatar: child.avatar,
        month: startDate.toLocaleDateString('pt-BR', { month: 'long' }),
        year,
        opening_balance: summary.opening_balance,
        closing_balance: summary.closing_balance,
        total_income: summary.total_income,
        total_expenses: summary.total_expenses,
        net_savings: summary.net_change,
        transactions,
        summary,
        insights,
        achievements
      };

    } catch (error) {
      console.error('Error getting monthly statement:', error);
      return this.getEmptyMonthlyStatement(year, month);
    }
  }

  // Export statement in different formats
  static async exportStatement(
    childId: string,
    dateFrom: string,
    dateTo: string,
    format: 'csv' | 'pdf' | 'json'
  ): Promise<StatementExport> {
    try {
      const { transactions } = await this.getDetailedStatement({
        child_id: childId,
        date_from: dateFrom,
        date_to: dateTo,
        limit: 10000
      });

      const child = await StorageAdapter.getChildById(childId);
      const childName = child ? child.name.replace(/\s+/g, '_') : 'child';
      
      const startDateStr = dateFrom.replace(/-/g, '');
      const endDateStr = dateTo.replace(/-/g, '');
      const filename = `extrato_${childName}_${startDateStr}_${endDateStr}`;

      switch (format) {
        case 'csv':
          return {
            format: 'csv',
            content: this.exportToCSV(transactions),
            filename: `${filename}.csv`,
            mime_type: 'text/csv'
          };

        case 'json':
          const summary = await this.getStatementSummary(childId, dateFrom, dateTo);
          return {
            format: 'json',
            content: JSON.stringify({ transactions, summary }, null, 2),
            filename: `${filename}.json`,
            mime_type: 'application/json'
          };

        case 'pdf':
          // For now, return structured data that can be used to generate PDF on frontend
          const monthlyStatement = await this.getMonthlyStatement(
            childId,
            new Date(dateFrom).getFullYear(),
            new Date(dateFrom).getMonth() + 1
          );
          return {
            format: 'pdf',
            content: JSON.stringify(monthlyStatement),
            filename: `${filename}.pdf`,
            mime_type: 'application/pdf'
          };

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

    } catch (error) {
      console.error('Error exporting statement:', error);
      throw error;
    }
  }

  // Get all available statement months for a child
  static async getAvailableStatementPeriods(childId: string): Promise<Array<{
    year: number;
    month: number;
    month_name: string;
    transaction_count: number;
    total_amount: number;
  }>> {
    try {
      const { transactions } = await this.getDetailedStatement({
        child_id: childId,
        limit: 10000
      });

      const periodMap = new Map<string, {
        year: number;
        month: number;
        count: number;
        total: number;
      }>();

      transactions.forEach(t => {
        const date = new Date(t.created_at!);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        
        const existing = periodMap.get(key) || {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          count: 0,
          total: 0
        };

        periodMap.set(key, {
          ...existing,
          count: existing.count + 1,
          total: existing.total + Math.abs(t.amount)
        });
      });

      return Array.from(periodMap.values())
        .map(p => ({
          year: p.year,
          month: p.month,
          month_name: new Date(p.year, p.month - 1).toLocaleDateString('pt-BR', { month: 'long' }),
          transaction_count: p.count,
          total_amount: p.total
        }))
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

    } catch (error) {
      console.error('Error getting available periods:', error);
      return [];
    }
  }

  // Get category information with icons and colors
  static getCategoryInfo(): Record<StatementTransaction['category'], {
    name: string;
    icon: string;
    color: string;
    description: string;
  }> {
    return {
      task: { name: 'Tarefas', icon: '✅', color: 'green', description: 'Dinheiro ganho por completar tarefas' },
      chore: { name: 'Afazeres', icon: '🏠', color: 'blue', description: 'Recompensa por ajudar em casa' },
      bonus: { name: 'Bônus', icon: '🌟', color: 'yellow', description: 'Recompensas especiais e bonificações' },
      purchase: { name: 'Compras', icon: '🛒', color: 'red', description: 'Dinheiro gasto em compras' },
      goal: { name: 'Metas', icon: '🎯', color: 'purple', description: 'Dinheiro destinado às suas metas' },
      gift: { name: 'Presentes', icon: '🎁', color: 'pink', description: 'Dinheiro recebido como presente' },
      mesada: { name: 'Mesada', icon: '📅', color: 'indigo', description: 'Mesada regular dos pais' },
      transfer: { name: 'Transferência', icon: '🔄', color: 'gray', description: 'Transferência entre contas' },
      other: { name: 'Outros', icon: '📝', color: 'gray', description: 'Outras transações diversas' }
    };
  }

  // Get transaction type information
  static getTransactionTypeInfo(): Record<StatementTransaction['type'], {
    name: string;
    icon: string;
    color: string;
    sign: '+' | '-';
  }> {
    return {
      income: { name: 'Receita', icon: '💰', color: 'green', sign: '+' },
      expense: { name: 'Despesa', icon: '💸', color: 'red', sign: '-' },
      transfer: { name: 'Transferência', icon: '🔄', color: 'blue', sign: '+' },
      reward: { name: 'Recompensa', icon: '🏆', color: 'yellow', sign: '+' },
      penalty: { name: 'Penalidade', icon: '⚠️', color: 'orange', sign: '-' },
      allowance: { name: 'Mesada', icon: '📅', color: 'indigo', sign: '+' },
      interest: { name: 'Rendimento', icon: '📈', color: 'purple', sign: '+' }
    };
  }

  // Private helper methods
  private static async getBalanceAtDate(childId: string, date: string): Promise<number> {
    try {
      const { transactions } = await this.getDetailedStatement({
        child_id: childId,
        date_to: new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        limit: 1
      });

      return transactions.length > 0 ? transactions[0].balance_after : 0;
    } catch {
      return 0;
    }
  }

  private static mapToStatementTransactions(transactions: any[]): StatementTransaction[] {
    return transactions.map(t => ({
      id: t.id,
      child_id: t.child_id,
      type: t.type,
      category: t.category || 'other',
      amount: t.amount || 0,
      balance_after: t.balance_after || 0,
      description: t.description || 'Sem descrição',
      reference_id: t.reference_id,
      reference_type: t.reference_type,
      tags: t.tags || [],
      notes: t.notes,
      created_at: t.created_at,
      created_by: t.created_by
    }));
  }

  private static applyClientSideFilters(
    transactions: StatementTransaction[], 
    filter: StatementFilter
  ): StatementTransaction[] {
    let filtered = [...transactions];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t =>
        filter.tags!.some(tag => t.tags?.includes(tag))
      );
    }

    return filtered;
  }

  private static analyzeCategoriesWithTrends(
    transactions: StatementTransaction[],
    dateFrom: string,
    dateTo: string
  ): StatementSummary['categories'] {
    const categoryMap = new Map<StatementTransaction['category'], {
      total: number;
      count: number;
    }>();
    
    transactions.forEach(t => {
      const current = categoryMap.get(t.category) || { total: 0, count: 0 };
      categoryMap.set(t.category, {
        total: current.total + Math.abs(t.amount),
        count: current.count + 1
      });
    });

    const categoryInfo = this.getCategoryInfo();
    const totalTransactions = transactions.length;

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const info = categoryInfo[category];
      return {
        category,
        icon: info.icon,
        name: info.name,
        total: data.total,
        count: data.count,
        percentage: totalTransactions > 0 ? (data.count / totalTransactions) * 100 : 0,
        trend: 'stable' as const // Could be enhanced with historical comparison
      };
    }).sort((a, b) => b.total - a.total);
  }

  private static generateDailyBreakdown(
    transactions: StatementTransaction[],
    dateFrom: string,
    dateTo: string
  ): StatementSummary['daily_breakdown'] {
    const dailyMap = new Map<string, {
      income: number;
      expenses: number;
      count: number;
    }>();

    // Initialize all days in the period
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { income: 0, expenses: 0, count: 0 });
    }

    // Populate with transaction data
    transactions.forEach(t => {
      const dateStr = new Date(t.created_at!).toISOString().split('T')[0];
      const current = dailyMap.get(dateStr);
      if (current) {
        if (['income', 'reward', 'allowance', 'interest', 'transfer'].includes(t.type) && t.amount > 0) {
          current.income += t.amount;
        } else {
          current.expenses += Math.abs(t.amount);
        }
        current.count += 1;
      }
    });

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      total_income: data.income,
      total_expenses: data.expenses,
      net_change: data.income - data.expenses,
      transaction_count: data.count
    }));
  }

  private static generateMonthlyInsights(
    child: any,
    transactions: StatementTransaction[],
    summary: StatementSummary
  ): MonthlyStatement['insights'] {
    const insights: MonthlyStatement['insights'] = [];

    // Net savings insight
    if (summary.net_change > 0) {
      insights.push({
        icon: '💰',
        title: 'Parabéns!',
        message: `Você economizou R$ ${summary.net_change.toFixed(2)} este mês!`,
        type: 'success'
      });
    } else if (summary.net_change < 0) {
      insights.push({
        icon: '⚠️',
        title: 'Atenção aos gastos',
        message: `Você gastou R$ ${Math.abs(summary.net_change).toFixed(2)} a mais do que ganhou.`,
        type: 'warning'
      });
    }

    // Task completion insight
    const taskTransactions = transactions.filter(t => t.category === 'task' || t.category === 'chore');
    if (taskTransactions.length > 0) {
      const taskEarnings = taskTransactions.reduce((sum, t) => sum + t.amount, 0);
      insights.push({
        icon: '✅',
        title: 'Tarefas concluídas',
        message: `${taskTransactions.length} tarefas completadas renderam R$ ${taskEarnings.toFixed(2)}`,
        type: 'success'
      });
    }

    // Spending pattern insight
    if (summary.categories.length > 0) {
      const topCategory = summary.categories[0];
      insights.push({
        icon: '📊',
        title: 'Principal categoria',
        message: `${topCategory.name} representa ${topCategory.percentage.toFixed(1)}% das suas transações`,
        type: 'info'
      });
    }

    // Financial tip
    insights.push({
      icon: '💡',
      title: 'Dica Financeira',
      message: this.getFinancialTip(child, summary),
      type: 'tip'
    });

    return insights;
  }

  private static getFinancialTip(child: any, summary: StatementSummary): string {
    const tips = [
      `Tente economizar pelo menos 20% dos seus ganhos mensais!`,
      `Defina uma meta de poupança e guarde um pouco toda semana.`,
      `Sempre compare preços antes de fazer uma compra importante.`,
      `Celebre suas conquistas financeiras, mas sem exagerar nos gastos!`,
      `Mantenha um registro de todos os seus gastos para entender seus hábitos.`
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  private static async getMonthlyAchievements(
    childId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<MonthlyStatement['achievements']> {
    // This would integrate with the gamification service
    // For now, return empty array
    return [];
  }

  private static exportToCSV(transactions: StatementTransaction[]): string {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Saldo', 'Notas'];
    const typeInfo = this.getTransactionTypeInfo();
    const categoryInfo = this.getCategoryInfo();

    const rows = transactions.map(t => [
      new Date(t.created_at!).toLocaleDateString('pt-BR'),
      typeInfo[t.type]?.name || t.type,
      categoryInfo[t.category]?.name || t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      `R$ ${t.amount.toFixed(2)}`,
      `R$ ${t.balance_after.toFixed(2)}`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private static getStatementFromStorage(filter: StatementFilter): Promise<{
    transactions: StatementTransaction[];
    total_count: number;
    current_page: number;
    total_pages: number;
  }> {
    // Mock implementation for localStorage fallback
    return Promise.resolve({
      transactions: [],
      total_count: 0,
      current_page: 1,
      total_pages: 0
    });
  }

  private static getEmptyStatementSummary(dateFrom: string, dateTo: string): StatementSummary {
    return {
      period: `${dateFrom} - ${dateTo}`,
      opening_balance: 0,
      closing_balance: 0,
      total_income: 0,
      total_expenses: 0,
      net_change: 0,
      transaction_count: 0,
      average_transaction: 0,
      largest_income: null,
      largest_expense: null,
      categories: [],
      daily_breakdown: []
    };
  }

  private static getEmptyMonthlyStatement(year: number, month: number): MonthlyStatement {
    const date = new Date(year, month - 1);
    return {
      child_name: '',
      child_avatar: '👤',
      month: date.toLocaleDateString('pt-BR', { month: 'long' }),
      year,
      opening_balance: 0,
      closing_balance: 0,
      total_income: 0,
      total_expenses: 0,
      net_savings: 0,
      transactions: [],
      summary: this.getEmptyStatementSummary('', ''),
      insights: [],
      achievements: []
    };
  }

  private static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('transactions').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}