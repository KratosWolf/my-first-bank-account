'use client';

import { useState, useEffect } from 'react';
import { StatementsService, type StatementTransaction, type StatementFilter, type StatementSummary } from '@/lib/services/statements';
import type { Child } from '@/lib/supabase';

interface DetailedStatementProps {
  child: Child;
  initialFilter?: Partial<StatementFilter>;
}

export default function DetailedStatement({ child, initialFilter = {} }: DetailedStatementProps) {
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<StatementFilter>({
    child_id: child.id,
    type: 'all',
    category: 'all',
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    date_to: new Date().toISOString().split('T')[0],
    search: '',
    limit: 25,
    page: 1,
    ...initialFilter
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadStatement();
  }, [filter]);

  const loadStatement = async () => {
    try {
      setLoading(true);

      // Get transactions
      const statementData = await StatementsService.getDetailedStatement(filter);
      setTransactions(statementData.transactions);
      setCurrentPage(statementData.current_page);
      setTotalPages(statementData.total_pages);

      // Get summary
      if (filter.date_from && filter.date_to) {
        const summaryData = await StatementsService.getStatementSummary(
          child.id,
          filter.date_from,
          filter.date_to
        );
        setSummary(summaryData);
      }

    } catch (error) {
      console.error('Error loading statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof StatementFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when other filters change
    }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (!filter.date_from || !filter.date_to) return;

      const exportData = await StatementsService.exportStatement(
        child.id,
        filter.date_from,
        filter.date_to,
        format
      );

      // Create and download file
      const blob = new Blob([exportData.content], { type: exportData.mime_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting statement:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTransactionIcon = (transaction: StatementTransaction): string => {
    const typeInfo = StatementsService.getTransactionTypeInfo();
    const categoryInfo = StatementsService.getCategoryInfo();
    
    return categoryInfo[transaction.category]?.icon || typeInfo[transaction.type]?.icon || '📝';
  };

  const getAmountColor = (transaction: StatementTransaction): string => {
    const typeInfo = StatementsService.getTransactionTypeInfo();
    const info = typeInfo[transaction.type];
    
    if (!info) return 'text-gray-900';
    
    return info.sign === '+' ? 'text-green-600' : 'text-red-600';
  };

  const getAmountSign = (transaction: StatementTransaction): string => {
    const typeInfo = StatementsService.getTransactionTypeInfo();
    const info = typeInfo[transaction.type];
    
    return info?.sign || '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Extrato Detalhado
              </h2>
              <p className="text-gray-600 mt-1">
                {child.avatar} {child.name}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                showFilters
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔍 Filtros
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              📊 CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              📋 JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filter.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filter.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={filter.type || 'all'}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                  <option value="reward">Recompensas</option>
                  <option value="allowance">Mesada</option>
                  <option value="transfer">Transferências</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={filter.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="task">Tarefas</option>
                  <option value="chore">Afazeres</option>
                  <option value="goal">Metas</option>
                  <option value="purchase">Compras</option>
                  <option value="gift">Presentes</option>
                  <option value="mesada">Mesada</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por descrição, notas ou tags..."
                value={filter.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_income)}
              </div>
              <div className="text-sm text-green-500 font-medium">Total Receitas</div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_expenses)}
              </div>
              <div className="text-sm text-red-500 font-medium">Total Despesas</div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${summary.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.net_change)}
              </div>
              <div className="text-sm text-blue-500 font-medium">Variação Líquida</div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {summary.transaction_count}
              </div>
              <div className="text-sm text-purple-500 font-medium">Transações</div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Transações</h3>
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages} ({transactions.length} transações)
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Transação</h3>
            <p className="text-gray-600">Nenhuma transação encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(transaction => {
              const categoryInfo = StatementsService.getCategoryInfo();
              const typeInfo = StatementsService.getTransactionTypeInfo();
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl">{getTransactionIcon(transaction)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {transaction.description}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryInfo[transaction.category]?.name || transaction.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {typeInfo[transaction.type]?.name || transaction.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        📅 {new Date(transaction.created_at!).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        🕒 {new Date(transaction.created_at!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {transaction.notes && (
                        <span className="truncate max-w-xs">
                          📝 {transaction.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount and Balance */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${getAmountColor(transaction)}`}>
                      {getAmountSign(transaction)}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Saldo: {formatCurrency(transaction.balance_after)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              ← Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => handleFilterChange('page', pageNum)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handleFilterChange('page', Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}