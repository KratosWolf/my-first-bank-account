'use client';

import { useState, useEffect } from 'react';
import { TransactionService } from '@/lib/services/transactions';
import type { Transaction } from '@/lib/supabase';

interface TransactionHistoryProps {
  childId: string;
  className?: string;
}

export default function TransactionHistory({
  childId,
  className = '',
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 7, 30, 90, all
  const [selectedType, setSelectedType] = useState<string>('all'); // all, earning, spending, etc.
  const [selectedCategory, setSelectedCategory] = useState('all');

  const PAGE_SIZE = 20;

  // Load transactions
  const loadTransactions = async (reset = false) => {
    setLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;

      // Build filter options
      const options: any = {
        limit: PAGE_SIZE,
        offset: currentOffset,
      };

      // Apply period filter
      if (selectedPeriod !== 'all') {
        const days = parseInt(selectedPeriod);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        options.startDate = startDate.toISOString();
      }

      // Apply type filter
      if (selectedType !== 'all') {
        options.type = selectedType;
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }

      // Fetch transactions
      const newTransactions = await TransactionService.getChildTransactions(
        childId,
        options
      );

      // Fetch total count for the current filters
      const count = await TransactionService.getChildTransactionsCount(
        childId,
        {
          startDate: options.startDate,
          type: options.type,
          category: options.category,
        }
      );

      setTotalCount(count);

      if (reset) {
        setTransactions(newTransactions);
        setOffset(PAGE_SIZE);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
        setOffset(prev => prev + PAGE_SIZE);
      }

      // Check if there are more transactions
      setHasMore(newTransactions.length === PAGE_SIZE);
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    setOffset(0);
    loadTransactions(true);
  }, [childId, selectedPeriod, selectedType, selectedCategory]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return '💰';
      case 'spending':
        return '🛒';
      case 'allowance':
        return '📅';
      case 'interest':
        return '📈';
      case 'goal_deposit':
        return '🎯';
      case 'goal_interest':
        return '🌟';
      case 'transfer':
        return '↔️';
      default:
        return '💸';
    }
  };

  // Check if transaction is income
  const isIncome = (type: string) => {
    return ['earning', 'allowance', 'interest', 'goal_interest'].includes(type);
  };

  return (
    <div className={`${className}`}>
      {/* Filters Section */}
      <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] rounded-xl shadow-lg p-4 mb-4 border-2 border-primary/30">
        <h3 className="font-bold text-primary mb-4">🔍 Filtros</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todo o histórico</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos os tipos</option>
              <option value="earning">Ganhos</option>
              <option value="spending">Gastos</option>
              <option value="allowance">Mesada</option>
              <option value="interest">Rendimentos</option>
              <option value="goal_deposit">Depósito em sonho</option>
              <option value="goal_interest">Rendimento de sonho</option>
              <option value="transfer">Transferências</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todas as categorias</option>
              {/* TODO: Load categories dynamically from database */}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-white/70">
          {loading ? (
            <span>Carregando...</span>
          ) : (
            <span>
              Mostrando{' '}
              <span className="text-primary font-semibold">
                {transactions.length}
              </span>{' '}
              de{' '}
              <span className="text-primary font-semibold">{totalCount}</span>{' '}
              transações
            </span>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.length === 0 && !loading ? (
          <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] rounded-xl p-8 text-center border-2 border-primary/30">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-semibold text-primary mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-sm text-white/70">
              Tente ajustar os filtros ou aguarde novas transações
            </p>
          </div>
        ) : (
          transactions.map(transaction => (
            <div
              key={transaction.id}
              className="bg-gradient-to-br from-[#1A4731]/40 to-[#0D2818]/40 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all border-2 border-primary/20 flex items-center space-x-3"
            >
              <div className="text-2xl">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {transaction.description || transaction.category}
                </div>
                <div className="text-xs text-white/60">
                  {formatDate(transaction.created_at)}
                </div>
                {transaction.category && (
                  <div className="text-xs text-white/50 mt-1">
                    📁 {transaction.category}
                  </div>
                )}
              </div>
              <div
                className={`font-bold text-lg ${
                  isIncome(transaction.type) ? 'text-success' : 'text-error'
                }`}
              >
                {isIncome(transaction.type) ? '+' : '-'}R${' '}
                {transaction.amount.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && transactions.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => loadTransactions(false)}
            disabled={loading}
            className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary text-primary font-semibold py-3 px-8 rounded-xl hover:shadow-xl hover:border-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Carregando...
              </>
            ) : (
              'Carregar Mais'
            )}
          </button>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && transactions.length > 0 && (
        <div className="mt-6 text-center text-sm text-white/70">
          <div className="inline-block bg-[#1A4731] border border-primary/30 rounded-full px-4 py-2">
            ✅ Você viu todas as transações
          </div>
        </div>
      )}
    </div>
  );
}
