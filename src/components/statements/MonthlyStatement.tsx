'use client';

import { useState, useEffect } from 'react';
import { StatementsService, type MonthlyStatement as MonthlyStatementType } from '@/lib/services/statements';

interface MonthlyStatementProps {
  childId: string;
  year: number;
  month: number;
}

export default function MonthlyStatement({ childId, year, month }: MonthlyStatementProps) {
  const [statement, setStatement] = useState<MonthlyStatementType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyStatement();
  }, [childId, year, month]);

  const loadMonthlyStatement = async () => {
    try {
      setLoading(true);
      const data = await StatementsService.getMonthlyStatement(childId, year, month);
      setStatement(data);
    } catch (error) {
      console.error('Error loading monthly statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getInsightIcon = (type: 'success' | 'warning' | 'info' | 'tip'): string => {
    const icons = {
      success: '🎉',
      warning: '⚠️',
      info: 'ℹ️',
      tip: '💡'
    };
    return icons[type];
  };

  const getInsightColor = (type: 'success' | 'warning' | 'info' | 'tip'): string => {
    const colors = {
      success: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
      warning: 'from-yellow-50 to-orange-50 border-yellow-200 text-orange-800',
      info: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-800',
      tip: 'from-purple-50 to-violet-50 border-purple-200 text-purple-800'
    };
    return colors[type];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Extrato Não Encontrado</h3>
        <p className="text-gray-600">Não foi possível carregar o extrato mensal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Extrato Mensal
            </h2>
            <p className="text-gray-600 mt-1">
              {statement.child_avatar} {statement.child_name} • {statement.month} {statement.year}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(statement.opening_balance)}
            </div>
            <div className="text-sm text-blue-500 font-medium">Saldo Inicial</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(statement.total_income)}
            </div>
            <div className="text-sm text-green-500 font-medium">Total Receitas</div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(statement.total_expenses)}
            </div>
            <div className="text-sm text-red-500 font-medium">Total Despesas</div>
          </div>

          <div className={`rounded-xl p-4 text-center ${
            statement.net_savings >= 0 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
              : 'bg-gradient-to-r from-red-50 to-rose-50'
          }`}>
            <div className={`text-lg font-bold ${
              statement.net_savings >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(statement.net_savings)}
            </div>
            <div className={`text-sm font-medium ${
              statement.net_savings >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              Economia Líquida
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 text-center">
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(statement.closing_balance)}
            </div>
            <div className="text-sm text-purple-500 font-medium">Saldo Final</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {statement.summary.categories.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Breakdown por Categoria</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statement.summary.categories.map(category => (
              <div key={category.category} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <div className="text-sm text-gray-500">{category.count} transações</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(category.total)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    {category.percentage.toFixed(1)}% do total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {statement.insights.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
              <span className="text-lg">💡</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Insights do Mês</h3>
          </div>

          <div className="space-y-4">
            {statement.insights.map((insight, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-r ${getInsightColor(insight.type)} rounded-xl p-4 border-2`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown Chart */}
      {statement.summary.daily_breakdown.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg">
              <span className="text-lg">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Atividade Diária</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income vs Expenses Chart */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas</h4>
              <div className="space-y-2">
                {statement.summary.daily_breakdown
                  .filter(day => day.total_income > 0 || day.total_expenses > 0)
                  .slice(0, 10) // Show last 10 active days
                  .map(day => {
                    const maxAmount = Math.max(day.total_income, day.total_expenses);
                    return (
                      <div key={day.date} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                          <span className={`font-semibold ${
                            day.net_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(day.net_change)}
                          </span>
                        </div>
                        <div className="flex space-x-1 h-3">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-500 rounded-l"
                            style={{ 
                              width: `${maxAmount > 0 ? (day.total_income / maxAmount) * 100 : 0}%` 
                            }}
                          ></div>
                          <div
                            className="bg-gradient-to-r from-red-400 to-red-500 rounded-r"
                            style={{ 
                              width: `${maxAmount > 0 ? (day.total_expenses / maxAmount) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Transaction Count */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Volume de Transações</h4>
              <div className="space-y-2">
                {statement.summary.daily_breakdown
                  .filter(day => day.transaction_count > 0)
                  .slice(0, 10)
                  .map(day => {
                    const maxCount = Math.max(...statement.summary.daily_breakdown.map(d => d.transaction_count));
                    return (
                      <div key={day.date} className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 w-12">
                          {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ 
                              width: `${maxCount > 0 ? (day.transaction_count / maxCount) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 w-8">
                          {day.transaction_count}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Preview */}
      {statement.transactions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Transações Recentes</h3>
            <div className="text-sm text-gray-500">
              (Últimas 5 transações)
            </div>
          </div>

          <div className="space-y-3">
            {statement.transactions.slice(0, 5).map(transaction => {
              const categoryInfo = StatementsService.getCategoryInfo();
              const typeInfo = StatementsService.getTransactionTypeInfo();
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                >
                  <div className="text-xl">{categoryInfo[transaction.category]?.icon || '📝'}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at!).toLocaleDateString('pt-BR')} • {categoryInfo[transaction.category]?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      ['income', 'reward', 'allowance', 'interest'].includes(transaction.type) 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {['income', 'reward', 'allowance', 'interest'].includes(transaction.type) ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(transaction.balance_after)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      {statement.achievements.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
              <span className="text-lg">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Conquistas do Mês</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statement.achievements.map((achievement, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-800">{achievement.title}</h4>
                    <p className="text-sm text-yellow-700">{achievement.description}</p>
                    <div className="text-xs text-yellow-600 mt-1">
                      {new Date(achievement.earned_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}