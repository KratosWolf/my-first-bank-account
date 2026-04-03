'use client';

import { useState, useEffect } from 'react';
import { TransactionService } from '@/lib/services/transactions';
import type { Transaction } from '@/lib/supabase';

interface TransactionHistoryProps {
  childId: string;
  currentBalance?: number;
  className?: string;
}

export default function TransactionHistory({
  childId,
  currentBalance,
  className = '',
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 7, 30, 90, all
  const [selectedType, setSelectedType] = useState<string>('all'); // all, earning, spending, etc.
  const [selectedCategory, setSelectedCategory] = useState('all');

  const PAGE_SIZE = 15;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Load transactions for a specific page
  const loadTransactions = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;

      // Build filter options
      const options: any = {
        limit: PAGE_SIZE,
        offset: offset,
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
      setTransactions(newTransactions);
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Go to specific page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadTransactions(page);
      // Scroll to top of transaction list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadTransactions(1);
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

  // Get transaction icon and color
  const getTransactionDisplay = (type: string) => {
    const displays: Record<
      string,
      { icon: string; color: string; bg: string }
    > = {
      earning: { icon: '💰', color: '#22C55E', bg: '#22C55E20' },
      spending: { icon: '🛒', color: '#EF4444', bg: '#EF444420' },
      allowance: { icon: '📅', color: '#F5B731', bg: '#F5B73120' },
      interest: { icon: '📈', color: '#22C55E', bg: '#22C55E20' },
      goal_deposit: { icon: '🎯', color: '#F5B731', bg: '#F5B73120' },
      goal_withdrawal: { icon: '↩️', color: '#22C55E', bg: '#22C55E20' },
      goal_interest: { icon: '🌟', color: '#FFD966', bg: '#FFD96620' },
      transfer: { icon: '↔️', color: '#FFFFFF', bg: '#FFFFFF20' },
      deposit: { icon: '💵', color: '#22C55E', bg: '#22C55E20' },
      gift: { icon: '🎁', color: '#F5B731', bg: '#F5B73120' },
      loan: { icon: '🏦', color: '#FFD966', bg: '#FFD96620' },
    };
    return displays[type] || { icon: '💸', color: '#FFFFFF', bg: '#FFFFFF20' };
  };

  // Check if transaction is income
  const isIncome = (type: string) => {
    return [
      'earning',
      'allowance',
      'interest',
      'goal_interest',
      'goal_withdrawal',
      'deposit',
      'gift',
    ].includes(type);
  };

  // Calculate running balance for each transaction (retroactive from current balance)
  // Only on first page with no filters — otherwise the anchor balance doesn't match
  const balanceMap = new Map<string, number>();
  if (
    currentBalance !== undefined &&
    currentPage === 1 &&
    selectedPeriod === 'all' &&
    selectedType === 'all' &&
    selectedCategory === 'all'
  ) {
    let runningBalance = currentBalance;
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      balanceMap.set(tx.id, runningBalance);
      // Walk backwards: subtract income, add expenses to get previous balance
      const amount = Math.abs(tx.amount);
      if (isIncome(tx.type)) {
        runningBalance -= amount;
      } else {
        runningBalance += amount;
      }
    }
  }

  return (
    <div className={`${className}`}>
      {/* Filters Section */}
      <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] rounded-2xl shadow-2xl p-6 mb-6 border-2 border-primary/40 hover:border-primary/60 transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-primary text-lg flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Filtros de Busca
          </h3>
          {/* Clear filters button */}
          {(selectedPeriod !== 'all' ||
            selectedType !== 'all' ||
            selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedPeriod('all');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="px-3 py-1.5 text-xs bg-[#0D2818] border border-primary/40 text-primary rounded-lg hover:bg-primary/10 hover:border-primary transition-all"
            >
              ✕ Limpar filtros
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          {/* Period Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-1.5">
              <span>📅</span> Período
            </label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/60 transition-all cursor-pointer"
            >
              <option value="all">📜 Todo o histórico</option>
              <option value="7">📆 Últimos 7 dias</option>
              <option value="30">📊 Últimos 30 dias</option>
              <option value="90">📈 Últimos 3 meses</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-1.5">
              <span>🏷️</span> Tipo
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/60 transition-all cursor-pointer"
            >
              <option value="all">📋 Todos os tipos</option>
              <option value="earning">💰 Ganhos</option>
              <option value="spending">🛒 Gastos</option>
              <option value="allowance">📅 Mesada</option>
              <option value="interest">📈 Rendimentos</option>
              <option value="goal_deposit">🎯 Depósito em sonho</option>
              <option value="goal_interest">🌟 Rendimento de sonho</option>
              <option value="goal_withdrawal">↩️ Sonho cancelado</option>
              <option value="transfer">↔️ Transferências</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-1.5">
              <span>📁</span> Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D2818] text-white border-2 border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/60 transition-all cursor-pointer"
            >
              <option value="all">🗂️ Todas as categorias</option>
              {/* TODO: Load categories dynamically from database */}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-5 pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <div className="text-white/80">
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Carregando transações...</span>
                </div>
              ) : (
                <span>
                  Mostrando{' '}
                  <span className="text-primary font-bold text-base">
                    {transactions.length}
                  </span>{' '}
                  de{' '}
                  <span className="text-primary font-bold text-base">
                    {totalCount}
                  </span>{' '}
                  transações
                </span>
              )}
            </div>
            {!loading && totalCount > 0 && (
              <div className="text-white/60 text-xs">
                {PAGE_SIZE} por página
              </div>
            )}
          </div>
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
          transactions.map(transaction => {
            const display = getTransactionDisplay(transaction.type);
            const balanceAfter = balanceMap.get(transaction.id);
            return (
              <div
                key={transaction.id}
                className="bg-gradient-to-br from-[#1A4731]/40 to-[#0D2818]/40 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:scale-[1.01] transition-all border-2 border-primary/20 flex items-center space-x-4"
              >
                {/* Colored Icon Badge */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-2xl shadow-md"
                  style={{
                    backgroundColor: display.bg,
                    borderColor: display.color,
                    borderWidth: '2px',
                  }}
                >
                  {display.icon}
                </div>

                {/* Transaction Details */}
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {transaction.description || transaction.category}
                  </div>
                  <div className="text-xs text-white/60 mt-0.5">
                    {formatDate(transaction.created_at)}
                  </div>
                  {transaction.category && (
                    <div className="inline-block mt-1.5 px-2 py-0.5 bg-[#0D2818]/60 border border-primary/30 rounded-full text-xs sm:text-sm text-white/70 max-w-[120px] truncate">
                      📁 {transaction.category}
                    </div>
                  )}
                </div>

                {/* Amount + Balance */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={`font-bold text-xl ${
                      isIncome(transaction.type) ? 'text-success' : 'text-error'
                    }`}
                  >
                    {isIncome(transaction.type) ? '+' : '-'}R${' '}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  {balanceAfter !== undefined && (
                    <div className="text-xs text-white/50 mt-0.5">
                      Saldo: R$ {balanceAfter.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && transactions.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {/* Previous Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 min-h-[44px] bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/40 text-primary font-semibold rounded-lg hover:border-primary hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            ← Anterior
          </button>

          {/* Page Numbers */}
          <div className="flex gap-2">
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisiblePages / 2)
              );
              const endPage = Math.min(
                totalPages,
                startPage + maxVisiblePages - 1
              );

              // Adjust start if we're near the end
              if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }

              // First page + ellipsis
              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => goToPage(1)}
                    className="min-w-[44px] min-h-[44px] bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/40 text-primary font-semibold rounded-lg hover:border-primary hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="px-2 text-white/50">
                      ...
                    </span>
                  );
                }
              }

              // Visible page range
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    disabled={loading}
                    className={`min-w-[44px] min-h-[44px] font-semibold rounded-lg transition-all ${
                      i === currentPage
                        ? 'bg-primary text-[#0D2818] shadow-lg scale-110 border-2 border-primary'
                        : 'bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/40 text-primary hover:border-primary hover:shadow-lg hover:scale-110 active:scale-95'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {i}
                  </button>
                );
              }

              // Ellipsis + last page
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="px-2 text-white/50">
                      ...
                    </span>
                  );
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className="min-w-[44px] min-h-[44px] bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/40 text-primary font-semibold rounded-lg hover:border-primary hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
          </div>

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 min-h-[44px] bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/40 text-primary font-semibold rounded-lg hover:border-primary hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Page Info */}
      {transactions.length > 0 && (
        <div className="mt-4 text-center text-sm text-white/70">
          <div className="inline-block bg-[#1A4731] border border-primary/30 rounded-full px-4 py-2">
            Página {currentPage} de {totalPages} • {totalCount} transações no
            total
          </div>
        </div>
      )}
    </div>
  );
}
