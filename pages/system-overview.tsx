'use client';

import { useState } from 'react';

interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'completed' | 'in_progress' | 'planned';
  url: string;
  features: string[];
  color: string;
}

export default function SystemOverview() {
  const [selectedModule, setSelectedModule] = useState<SystemModule | null>(null);

  const systems: SystemModule[] = [
    {
      id: 'gamification',
      name: 'Sistema de Gamificação',
      description: 'Badges, streaks, níveis e celebrações para engajar as crianças',
      icon: '🏆',
      status: 'completed',
      url: '/gamification-test',
      color: 'from-yellow-500 to-orange-500',
      features: [
        'Sistema de badges/conquistas',
        'Streaks de tarefas consecutivas',
        'Progressão de níveis com XP',
        'Celebrações animadas',
        'Recompensas por marcos'
      ]
    },
    {
      id: 'leaderboard',
      name: 'Leaderboard Familiar',
      description: 'Competição saudável entre irmãos com rankings e estatísticas',
      icon: '🏅',
      status: 'completed',
      url: '/leaderboard-test',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Rankings por diferentes métricas',
        'Estatísticas detalhadas por criança',
        'Períodos flexíveis (semana, mês)',
        'Badges de posição',
        'Histórico de performance'
      ]
    },
    {
      id: 'goals',
      name: 'Metas e Sonhos',
      description: 'Sistema de objetivos financeiros de longo prazo',
      icon: '🎯',
      status: 'completed',
      url: '/goals-test',
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Metas por categorias (brinquedos, eletrônicos, experiências)',
        'Progresso visual com barras animadas',
        'Sistema de contribuições',
        'Mensagens motivacionais',
        'Estatísticas familiares de metas'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Insights e relatórios avançados para a família',
      icon: '📊',
      status: 'completed',
      url: '/analytics-test',
      color: 'from-indigo-500 to-blue-500',
      features: [
        'Visão geral familiar com KPIs',
        'Performance individual detalhada',
        'Tendências semanais e mensais',
        'Insights educacionais personalizados',
        'Previsões e recomendações'
      ]
    },
    {
      id: 'statements',
      name: 'Extratos Detalhados',
      description: 'Transparência total com histórico financeiro completo',
      icon: '📋',
      status: 'completed',
      url: '/statements-test',
      color: 'from-green-500 to-emerald-500',
      features: [
        'Extrato detalhado com filtros avançados',
        'Extrato mensal com insights',
        'Exportação CSV/JSON/PDF',
        'Categorização inteligente',
        'Análise de padrões de gastos'
      ]
    },
    {
      id: 'parental',
      name: 'Dashboard Parental',
      description: 'Central de comando para pais supervisionarem e controlarem',
      icon: '👨‍👩‍👧‍👦',
      status: 'completed',
      url: '/parental-dashboard-test',
      color: 'from-purple-500 to-indigo-500',
      features: [
        'Visão geral familiar completa',
        'Status individual das crianças',
        'Sistema de aprovações pendentes',
        'Alertas e insights parentais',
        'Controles e configurações'
      ]
    },
    {
      id: 'notifications',
      name: 'Notificações',
      description: 'Sistema de comunicação em tempo real',
      icon: '🔔',
      status: 'completed',
      url: '/notifications-test',
      color: 'from-red-500 to-pink-500',
      features: [
        'Notificações para conquistas',
        'Lembretes de tarefas',
        'Alertas de gastos',
        'Celebrações de marcos',
        'Comunicação pais-filhos'
      ]
    },
    {
      id: 'recurring-chores',
      name: 'Tarefas Recorrentes',
      description: 'Automação de tarefas regulares e afazeres domésticos',
      icon: '🔄',
      status: 'completed',
      url: '/recurring-chores-test',
      color: 'from-orange-500 to-red-500',
      features: [
        'Padrões diários, semanais, mensais',
        'Configuração flexível de horários',
        'Auto-geração de instâncias',
        'Descrições inteligentes',
        'Integração com gamificação'
      ]
    },
    {
      id: 'interest',
      name: 'Sistema de Rendimento',
      description: 'Dinheiro parado na conta rende juros educativos automaticamente',
      icon: '💰',
      status: 'completed',
      url: '/interest-test',
      color: 'from-green-500 to-blue-500',
      features: [
        'Taxa de 5% ao ano (0,42% mensal)',
        'Aplicação automática mensal',
        'Saldo mínimo configurável (R$ 10)',
        'Cálculo proporcional ao saldo',
        'Histórico completo de rendimentos'
      ]
    }
  ];

  const completedSystems = systems.filter(s => s.status === 'completed').length;
  const totalFeatures = systems.reduce((total, system) => total + system.features.length, 0);

  const openSystemTest = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
              <span className="text-3xl">🏦</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Banco da Família - Sistema Completo
              </h1>
              <p className="text-gray-600 mt-2">
                Plataforma completa de educação financeira para famílias
              </p>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600">{completedSystems}</div>
              <div className="text-sm text-green-500 font-medium">Sistemas Completos</div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{totalFeatures}</div>
              <div className="text-sm text-blue-500 font-medium">Funcionalidades</div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 text-center border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-purple-500 font-medium">Implementado</div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200">
              <div className="text-3xl font-bold text-orange-600">8</div>
              <div className="text-sm text-orange-500 font-medium">Módulos</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progresso do Sistema</span>
              <span className="text-lg font-bold text-green-600">100% Completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out animate-pulse">
                <div className="h-full bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.open('/demo-parent-view', '_blank')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>👨‍💼</span>
              <span>Demo: Visão do Pai</span>
            </button>

            <button
              onClick={() => window.open('/demo-child-view', '_blank')}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>👧</span>
              <span>Demo: Visão da Criança</span>
            </button>
            
            <button
              onClick={() => window.open('/parental-dashboard-test', '_blank')}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Dashboard Parental</span>
            </button>

            <button
              onClick={() => {
                systems.forEach((system, index) => {
                  setTimeout(() => {
                    const newWindow = window.open(system.url, '_blank');
                    if (!newWindow) {
                      alert(`Por favor, permita pop-ups para abrir o sistema: ${system.name}`);
                    }
                  }, index * 500);
                });
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🌟</span>
              <span>Abrir Todos os Sistemas</span>
            </button>
          </div>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {systems.map(system => (
            <div
              key={system.id}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => setSelectedModule(selectedModule?.id === system.id ? null : system)}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${system.color} p-6 text-white`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{system.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{system.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        system.status === 'completed' ? 'bg-white/20 text-white' :
                        system.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {system.status === 'completed' ? '✅ Completo' :
                         system.status === 'in_progress' ? '🚧 Em Progresso' :
                         '📅 Planejado'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-white/90 text-sm">{system.description}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Funcionalidades Principais:</h4>
                  <ul className="space-y-2">
                    {system.features.slice(0, selectedModule?.id === system.id ? system.features.length : 3).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {system.features.length > 3 && selectedModule?.id !== system.id && (
                    <div className="text-xs text-gray-500 mt-2">
                      +{system.features.length - 3} funcionalidades adicionais...
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSystemTest(system.url);
                    }}
                    className={`flex-1 bg-gradient-to-r ${system.color} hover:shadow-lg text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105`}
                  >
                    🚀 Testar Sistema
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModule(selectedModule?.id === system.id ? null : system);
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    {selectedModule?.id === system.id ? '📖' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Integration Map */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
              <span className="text-lg">🔗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Fluxo de Navegação Integrado</h3>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-semibold text-gray-900">Gamificação</div>
                <div className="text-xs text-gray-600">Badges → Níveis → Conquistas</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🏅</div>
                <div className="font-semibold text-gray-900">Leaderboard</div>
                <div className="text-xs text-gray-600">Rankings → Competição</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-900">Metas</div>
                <div className="text-xs text-gray-600">Objetivos → Progresso</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-900">Analytics</div>
                <div className="text-xs text-gray-600">Insights → Relatórios</div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <div className="text-2xl">⬇️</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center mt-6">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-semibold text-gray-900">Extratos</div>
                <div className="text-xs text-gray-600">Transparência → Histórico</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                <div className="font-semibold text-gray-900">Dashboard Parental</div>
                <div className="text-xs text-gray-600">Controle → Supervisão</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🔔</div>
                <div className="font-semibold text-gray-900">Notificações</div>
                <div className="text-xs text-gray-600">Comunicação → Alertas</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-semibold text-gray-900">Tarefas</div>
                <div className="text-xs text-gray-600">Automação → Recorrência</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Sequence Recommendation */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl shadow-xl border border-green-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
              <span className="text-lg text-white">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Sequência Recomendada de Testes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-green-800 mb-4">🧒 Perspectiva da Criança:</h4>
              <ol className="space-y-2 text-sm text-green-700">
                <li>1. <strong>Gamificação:</strong> Teste badges, níveis e celebrações</li>
                <li>2. <strong>Tarefas Recorrentes:</strong> Configure padrões de afazeres</li>
                <li>3. <strong>Metas e Sonhos:</strong> Crie objetivos motivadores</li>
                <li>4. <strong>Leaderboard:</strong> Veja competição saudável</li>
                <li>5. <strong>Extratos:</strong> Entenda transparência financeira</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-green-800 mb-4">👨‍👩‍👧‍👦 Perspectiva dos Pais:</h4>
              <ol className="space-y-2 text-sm text-green-700">
                <li>1. <strong>Dashboard Parental:</strong> Central de comando familiar</li>
                <li>2. <strong>Analytics:</strong> Insights e relatórios avançados</li>
                <li>3. <strong>Notificações:</strong> Comunicação em tempo real</li>
                <li>4. <strong>Sistema de Aprovações:</strong> Controle de gastos</li>
                <li>5. <strong>Configurações:</strong> Limites e regras personalizadas</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Ready for PWA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl text-white p-8 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-3xl font-bold mb-4">Sistema Pronto para PWA!</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Todos os 8 módulos principais estão implementados e funcionando. 
            O sistema está pronto para ser transformado em Progressive Web App.
          </p>
          <div className="text-sm text-blue-200">
            ✅ {completedSystems} sistemas completos • ✅ {totalFeatures} funcionalidades • ✅ Integração total
          </div>
        </div>
      </div>
    </div>
  );
}