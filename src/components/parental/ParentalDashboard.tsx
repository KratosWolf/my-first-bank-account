'use client';

import { useState, useEffect } from 'react';
import { ParentalDashboardService, type ParentalOverview } from '@/lib/services/parental-dashboard';

interface ParentalDashboardProps {
  familyId: string;
}

export default function ParentalDashboard({ familyId }: ParentalDashboardProps) {
  const [overview, setOverview] = useState<ParentalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'children' | 'approvals' | 'alerts' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [familyId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await ParentalDashboardService.getDashboardOverview(familyId);
      setOverview(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean, note?: string) => {
    try {
      const success = await ParentalDashboardService.handleApprovalRequest(requestId, approved, note);
      if (success) {
        // Refresh dashboard data
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error handling approval:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getStatusColor = (status: 'excellent' | 'good' | 'needs_attention' | 'concerning'): string => {
    const colors = {
      excellent: 'from-green-500 to-emerald-500',
      good: 'from-blue-500 to-cyan-500',
      needs_attention: 'from-yellow-500 to-orange-500',
      concerning: 'from-red-500 to-pink-500'
    };
    return colors[status];
  };

  const getStatusIcon = (status: 'excellent' | 'good' | 'needs_attention' | 'concerning'): string => {
    const icons = {
      excellent: '🌟',
      good: '👍',
      needs_attention: '⚠️',
      concerning: '🚨'
    };
    return icons[status];
  };

  const getSeverityColor = (severity: 'info' | 'warning' | 'success' | 'urgent'): string => {
    const colors = {
      info: 'from-blue-50 to-indigo-50 border-blue-200',
      warning: 'from-yellow-50 to-orange-50 border-yellow-300',
      success: 'from-green-50 to-emerald-50 border-green-200',
      urgent: 'from-red-50 to-rose-50 border-red-300'
    };
    return colors[severity];
  };

  const getActivityIcon = (type: string): string => {
    const icons = {
      transaction: '💰',
      goal_achieved: '🎯',
      level_up: '⬆️',
      task_completed: '✅',
      spending_alert: '⚠️'
    };
    return icons[type] || '📝';
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

  if (!overview) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Não Disponível</h3>
        <p className="text-gray-600">Não foi possível carregar os dados da família.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg">
            <span className="text-3xl">👨‍👩‍👧‍👦</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Parental
            </h2>
            <p className="text-gray-600 mt-1">
              Controle e supervisão familiar
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          {([
            { id: 'overview', label: 'Visão Geral', icon: '📊' },
            { id: 'children', label: 'Crianças', icon: '👶' },
            { id: 'approvals', label: 'Aprovações', icon: '✅' },
            { id: 'alerts', label: 'Alertas', icon: '🚨' },
            { id: 'settings', label: 'Configurações', icon: '⚙️' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Family Summary */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg">
                <span className="text-lg">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Resumo Familiar</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {overview.family_summary.total_children}
                </div>
                <div className="text-sm text-blue-500 font-medium">Crianças</div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview.family_summary.total_family_balance)}
                </div>
                <div className="text-sm text-green-500 font-medium">Saldo Total</div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {overview.family_summary.completed_tasks_this_week}
                </div>
                <div className="text-sm text-purple-500 font-medium">Tarefas Esta Semana</div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {overview.family_summary.family_financial_health}%
                </div>
                <div className="text-sm text-orange-500 font-medium">Saúde Financeira</div>
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Saúde Financeira Familiar</span>
                <span className="text-lg font-bold text-gray-900">
                  {overview.family_summary.family_financial_health}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overview.family_summary.family_financial_health}%` }}
                >
                  <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg">
                <span className="text-lg">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Atividade Recente</h3>
            </div>

            {overview.recent_activity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">😴</div>
                <p className="text-gray-600">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overview.recent_activity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                  >
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{activity.child_avatar}</span>
                        <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                        {activity.requires_attention && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            Atenção
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString('pt-BR')} às {' '}
                        {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(activity.amount)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Children Tab */}
      {selectedTab === 'children' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
              <span className="text-lg">👶</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Status das Crianças</h3>
          </div>

          {overview.children_summary.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Criança</h3>
              <p className="text-gray-600">Adicione crianças à família para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {overview.children_summary.map(childSummary => (
                <div 
                  key={childSummary.child.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{childSummary.child.avatar}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900">{childSummary.child.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">Nível {childSummary.current_level}</span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getStatusColor(childSummary.status)} text-white`}>
                          {getStatusIcon(childSummary.status)} {childSummary.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(childSummary.current_balance)}
                      </div>
                      <div className="text-xs text-gray-500">Saldo Atual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(childSummary.weekly_earnings)}
                      </div>
                      <div className="text-xs text-gray-500">Ganhos Semana</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {childSummary.active_goals}
                      </div>
                      <div className="text-xs text-gray-500">Metas Ativas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {childSummary.completed_tasks}
                      </div>
                      <div className="text-xs text-gray-500">Tarefas Semana</div>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Score de Saúde</span>
                      <span className="font-bold text-gray-900">{childSummary.health_score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full bg-gradient-to-r ${getStatusColor(childSummary.status)} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${childSummary.health_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Última atividade: {new Date(childSummary.last_activity).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {selectedTab === 'approvals' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
              <span className="text-lg">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Aprovações Pendentes ({overview.pending_approvals.length})
            </h3>
          </div>

          {overview.pending_approvals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tudo Aprovado!</h3>
              <p className="text-gray-600">Nenhuma solicitação pendente de aprovação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overview.pending_approvals.map(approval => (
                <div
                  key={approval.id}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{approval.child_avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{approval.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          approval.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          approval.urgency === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {approval.urgency}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{approval.description}</p>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{approval.child_name}</span> • {approval.category} •{' '}
                        {new Date(approval.requested_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 mb-4">
                        {formatCurrency(approval.amount)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(approval.id, false)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          ❌ Negar
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, true)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✅ Aprovar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {selectedTab === 'alerts' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
              <span className="text-lg">🚨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Alertas e Insights ({overview.alerts_and_insights.length})
            </h3>
          </div>

          {overview.alerts_and_insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tudo Tranquilo!</h3>
              <p className="text-gray-600">Nenhum alerta ou insight no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overview.alerts_and_insights.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-gradient-to-r ${getSeverityColor(alert.severity)} rounded-xl p-6 border-2`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {alert.severity === 'success' ? '🎉' :
                       alert.severity === 'warning' ? '⚠️' :
                       alert.severity === 'urgent' ? '🚨' : 'ℹ️'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{alert.title}</h4>
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      {alert.suggested_actions.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Ações Sugeridas:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {alert.suggested_actions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {alert.child_affected && (
                        <div className="text-sm font-medium text-gray-700 mt-1">
                          {alert.child_affected}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-lg">
              <span className="text-lg">⚙️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Configurações Familiares</h3>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-600">Configurações familiares serão implementadas em breve.</p>
          </div>
        </div>
      )}
    </div>
  );
}