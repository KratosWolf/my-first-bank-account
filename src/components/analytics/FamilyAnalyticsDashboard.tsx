'use client';

import { useState, useEffect } from 'react';
import { AnalyticsService, type FamilyAnalytics } from '@/lib/services/analytics';

interface FamilyAnalyticsDashboardProps {
  familyId: string;
}

export default function FamilyAnalyticsDashboard({ familyId }: FamilyAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<FamilyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [familyId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.getFamilyAnalytics(familyId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Dados Insuficientes</h3>
        <p className="text-gray-600">Adicione mais atividades para gerar analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Familiar
            </h2>
          </div>

          {/* Period Selector */}
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'week' && 'Semana'}
                {period === 'month' && 'Mês'}
                {period === 'quarter' && 'Trimestre'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.overview.total_children}
            </div>
            <div className="text-sm text-blue-500 font-medium">Crianças Ativas</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(analytics.overview.total_balance)}
            </div>
            <div className="text-sm text-green-500 font-medium">Saldo Total</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics.overview.total_tasks_completed}
            </div>
            <div className="text-sm text-purple-500 font-medium">Tarefas Concluídas</div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatPercentage(analytics.overview.family_financial_health)}
            </div>
            <div className="text-sm text-orange-500 font-medium">Saúde Financeira</div>
          </div>
        </div>

        {/* Family Health Score */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Score de Saúde Familiar</h3>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview.family_financial_health.toFixed(0)}/100
            </div>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getHealthScoreColor(analytics.overview.family_financial_health)} transition-all duration-1000 ease-out`}
              style={{ width: `${analytics.overview.family_financial_health}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Children Performance */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg">
            <span className="text-lg">👥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Performance Individual</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.children_performance.map(child => (
            <div key={child.child_id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{child.avatar}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{child.name}</h4>
                  <div className="text-sm text-gray-500">Nível {child.level}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo</span>
                  <span className="font-bold text-green-600">{formatCurrency(child.balance)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tarefas</span>
                  <span className="font-bold text-blue-600">{child.tasks_completed}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">XP</span>
                  <span className="font-bold text-purple-600">{child.xp}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="font-bold text-orange-600">{child.current_streak} dias</span>
                </div>

                {/* Performance Score */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Performance</span>
                    <span className="font-bold text-gray-900">{child.performance_score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full bg-gradient-to-r ${getHealthScoreColor(child.performance_score)} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${child.performance_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends Analysis */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
            <span className="text-lg">📈</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Tendências Semanais</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks Trend */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Concluídas</h4>
            <div className="space-y-3">
              {analytics.weekly_trends.tasks.map((week, index) => (
                <div key={week.week} className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600 w-16">
                    Sem {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min((week.value / Math.max(...analytics.weekly_trends.tasks.map(w => w.value))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 w-8">{week.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings Trend */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Ganhos Semanais</h4>
            <div className="space-y-3">
              {analytics.weekly_trends.earnings.map((week, index) => (
                <div key={week.week} className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600 w-16">
                    Sem {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min((week.value / Math.max(...analytics.weekly_trends.earnings.map(w => w.value))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 w-16">{formatCurrency(week.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Insights */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
            <span className="text-lg">💡</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Insights Educacionais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.educational_insights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  <div className="text-xs text-blue-600 font-medium">
                    {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg">
            <span className="text-lg">🔮</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Previsões e Recomendações</h3>
        </div>

        <div className="space-y-4">
          {analytics.predictions.map((prediction, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-l-4 border-indigo-500">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{prediction.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">{prediction.title}</h4>
                  <p className="text-gray-700 mb-3">{prediction.description}</p>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      prediction.confidence >= 80 ? 'bg-green-100 text-green-800' :
                      prediction.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Confiança: {prediction.confidence}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Impacto: {prediction.impact_level}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}