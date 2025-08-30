'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { ParentalDashboardService } from '@/lib/services/parental-dashboard';
import ParentalDashboard from '../src/components/parental/ParentalDashboard';
import type { Child } from '@/lib/supabase';

export default function ParentalDashboardTest() {
  const [familyId, setFamilyId] = useState('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const loadTestData = async () => {
    try {
      addResult('👨‍👩‍👧‍👦 Loading Parental Dashboard test data...');

      // Get or create test children with comprehensive data
      let testChildren = await StorageAdapter.getChildren(familyId);
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test family with diverse profiles...');
        
        const children = [
          {
            family_id: familyId,
            name: 'Sofia Responsável',
            pin: '1111',
            avatar: '👧',
            balance: 180.75,
            total_earned: 450.0,
            total_spent: 269.25,
            level: 7,
            xp: 890
          },
          {
            family_id: familyId,
            name: 'Miguel Explorador',
            pin: '2222',
            avatar: '🧑',
            balance: 95.30,
            total_earned: 280.0,
            total_spent: 184.70,
            level: 4,
            xp: 420
          },
          {
            family_id: familyId,
            name: 'Ana Iniciante',
            pin: '3333',
            avatar: '👶',
            balance: 35.50,
            total_earned: 80.0,
            total_spent: 44.50,
            level: 2,
            xp: 180
          },
          {
            family_id: familyId,
            name: 'Pedro Gastador',
            pin: '4444',
            avatar: '🧒',
            balance: 12.20,
            total_earned: 150.0,
            total_spent: 137.80,
            level: 3,
            xp: 290
          }
        ];

        for (const childData of children) {
          const child = await StorageAdapter.createChild(childData);
          if (child) testChildren.push(child);
        }
        
        addResult(`✅ Created ${testChildren.length} test children with diverse financial profiles`);
      }

      setChildren(testChildren);
      addResult('👨‍👩‍👧‍👦 Parental dashboard system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFamilyActivity = async () => {
    if (children.length === 0) return;

    try {
      addResult('⚡ Generating family activity data...');

      const activities = [];
      const activityTypes = [
        { 
          type: 'task_completed',
          templates: [
            'Organizou o quarto perfeitamente',
            'Completou lição de casa sem lembrete',
            'Ajudou na preparação do jantar',
            'Cuidou do jardim com dedicação'
          ]
        },
        {
          type: 'goal_achieved',
          templates: [
            'Alcançou meta de poupança mensal',
            'Completou desafio de economia',
            'Atingiu objetivo de tarefas semanais'
          ]
        },
        {
          type: 'level_up',
          templates: [
            'Subiu para o próximo nível!',
            'Alcançou novo marco de XP',
            'Desbloqueou nova conquista'
          ]
        },
        {
          type: 'spending_alert',
          templates: [
            'Excedeu limite de gastos diários',
            'Padrão de gastos incomum detectado',
            'Gasto grande realizado'
          ]
        }
      ];

      // Generate activities for last 7 days
      for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - dayOffset);

        // 70% chance of having activities each day
        if (Math.random() < 0.7) {
          const numActivities = Math.floor(Math.random() * 3) + 1; // 1-3 activities per day
          
          for (let i = 0; i < numActivities; i++) {
            const child = children[Math.floor(Math.random() * children.length)];
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const template = activityType.templates[Math.floor(Math.random() * activityType.templates.length)];
            
            // Add random time
            activityDate.setHours(Math.floor(Math.random() * 14) + 8); // 8 AM to 10 PM
            activityDate.setMinutes(Math.floor(Math.random() * 60));

            activities.push({
              id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: activityType.type,
              child_name: child.name,
              child_avatar: child.avatar,
              child_id: child.id,
              title: template,
              description: `${child.name}: ${template}`,
              amount: activityType.type === 'task_completed' ? Math.floor(Math.random() * 30) + 10 : undefined,
              timestamp: activityDate.toISOString(),
              requires_attention: activityType.type === 'spending_alert'
            });
          }
        }
      }

      // Store in localStorage for dashboard to read
      localStorage.setItem('banco-familia-family-activities', JSON.stringify(activities));
      
      addResult(`✅ Generated ${activities.length} family activities over the last week`);

    } catch (error) {
      addResult(`❌ Error generating family activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generatePendingApprovals = async () => {
    if (children.length === 0) return;

    try {
      addResult('✅ Creating pending approval requests...');

      const approvalTypes = [
        {
          type: 'spending_request',
          templates: [
            { title: 'Comprar jogo novo', desc: 'Jogo educativo para tablet', amount: [40, 80], urgency: 'medium' },
            { title: 'Livros da escola', desc: 'Material didático necessário', amount: [60, 120], urgency: 'high' },
            { title: 'Brinquedo colecionável', desc: 'Item especial da coleção', amount: [25, 50], urgency: 'low' }
          ]
        },
        {
          type: 'large_purchase',
          templates: [
            { title: 'Bicicleta nova', desc: 'Para ir à escola e passeios', amount: [300, 500], urgency: 'medium' },
            { title: 'Tablet educativo', desc: 'Para estudos e entretenimento', amount: [400, 600], urgency: 'high' }
          ]
        },
        {
          type: 'goal_withdrawal',
          templates: [
            { title: 'Retirar da meta', desc: 'Para compra urgente necessária', amount: [50, 150], urgency: 'medium' }
          ]
        }
      ];

      const approvals = [];
      
      // Generate 2-4 pending approvals
      const numApprovals = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numApprovals; i++) {
        const child = children[Math.floor(Math.random() * children.length)];
        const approvalType = approvalTypes[Math.floor(Math.random() * approvalTypes.length)];
        const template = approvalType.templates[Math.floor(Math.random() * approvalType.templates.length)];
        
        const amount = Math.floor(Math.random() * (template.amount[1] - template.amount[0])) + template.amount[0];
        
        // Request made in the last 1-3 days
        const requestDate = new Date();
        requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 3) - 1);

        approvals.push({
          id: `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: approvalType.type,
          child_name: child.name,
          child_avatar: child.avatar,
          child_id: child.id,
          title: template.title,
          amount: amount,
          description: template.desc,
          requested_at: requestDate.toISOString(),
          category: approvalType.type === 'spending_request' ? 'purchase' : 
                   approvalType.type === 'large_purchase' ? 'major_purchase' : 'goal_management',
          urgency: template.urgency
        });
      }

      // Store in localStorage
      localStorage.setItem('banco-familia-pending-approvals', JSON.stringify(approvals));
      
      addResult(`✅ Created ${approvals.length} pending approval requests`);

    } catch (error) {
      addResult(`❌ Error generating pending approvals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateAlertsAndInsights = async () => {
    if (children.length === 0) return;

    try {
      addResult('🚨 Generating alerts and insights...');

      const alerts = [];

      for (const child of children) {
        // Spending pattern analysis
        if (child.balance < 50) {
          alerts.push({
            id: `alert-low-balance-${child.id}`,
            type: 'spending_pattern',
            severity: 'warning',
            title: 'Saldo Baixo Detectado',
            message: `${child.name} está com saldo baixo (R$ ${child.balance.toFixed(2)}). Considere revisar os gastos recentes.`,
            child_affected: child.name,
            suggested_actions: [
              'Revisar histórico de transações',
              'Conversar sobre planejamento de gastos',
              'Ajustar mesada se necessário',
              'Estabelecer metas de economia'
            ],
            created_at: new Date().toISOString()
          });
        }

        // Savings milestone
        if (child.balance > 150) {
          alerts.push({
            id: `alert-savings-${child.id}`,
            type: 'savings_milestone',
            severity: 'success',
            title: 'Excelente Poupança!',
            message: `${child.name} demonstra ótimos hábitos de poupança com R$ ${child.balance.toFixed(2)} economizados.`,
            child_affected: child.name,
            suggested_actions: [
              'Parabenizar o progresso',
              'Discutir metas de longo prazo',
              'Considerar recompensa especial',
              'Compartilhar conquista com familiares'
            ],
            created_at: new Date().toISOString()
          });
        }

        // Educational opportunities
        if (child.level >= 5) {
          alerts.push({
            id: `alert-education-${child.id}`,
            type: 'educational_opportunity',
            severity: 'info',
            title: 'Oportunidade Educacional',
            message: `${child.name} está no nível ${child.level} e pronto para lições financeiras avançadas.`,
            child_affected: child.name,
            suggested_actions: [
              'Introduzir conceitos de juros compostos',
              'Ensinar sobre investimentos básicos',
              'Discutir planejamento financeiro',
              'Explorar metas de longo prazo'
            ],
            created_at: new Date().toISOString()
          });
        }

        // Behavioral changes
        if (child.total_spent > child.total_earned * 0.8) {
          alerts.push({
            id: `alert-behavior-${child.id}`,
            type: 'behavior_change',
            severity: 'warning',
            title: 'Padrão de Gastos Elevado',
            message: `${child.name} tem gastado uma alta porcentagem dos seus ganhos (${((child.total_spent / child.total_earned) * 100).toFixed(0)}%).`,
            child_affected: child.name,
            suggested_actions: [
              'Conversar sobre a importância da poupança',
              'Estabelecer metas de economia',
              'Revisar compras recentes juntos',
              'Implementar regra 50/30/20'
            ],
            created_at: new Date().toISOString()
          });
        }
      }

      // Family-wide insights
      const totalBalance = children.reduce((sum, child) => sum + child.balance, 0);
      const avgBalance = totalBalance / children.length;

      if (avgBalance > 100) {
        alerts.push({
          id: 'alert-family-savings',
          type: 'savings_milestone',
          severity: 'success',
          title: 'Família Poupadora!',
          message: `Parabéns! A família tem uma média excelente de R$ ${avgBalance.toFixed(2)} por criança.`,
          suggested_actions: [
            'Celebrar o sucesso familiar',
            'Definir uma meta familiar grande',
            'Considerar viagem ou atividade especial',
            'Compartilhar estratégias que funcionam'
          ],
          created_at: new Date().toISOString()
        });
      }

      // Store in localStorage
      localStorage.setItem('banco-familia-alerts-insights', JSON.stringify(alerts));
      
      addResult(`✅ Generated ${alerts.length} alerts and insights`);

    } catch (error) {
      addResult(`❌ Error generating alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runCompleteDashboardGeneration = async () => {
    try {
      addResult('🚀 Running complete dashboard data generation...');
      
      // Clear existing mock data
      localStorage.removeItem('banco-familia-family-activities');
      localStorage.removeItem('banco-familia-pending-approvals');
      localStorage.removeItem('banco-familia-alerts-insights');
      
      await generateFamilyActivity();
      await generatePendingApprovals();
      await generateAlertsAndInsights();

      addResult('✨ Complete parental dashboard dataset generated!');
      addResult('👨‍👩‍👧‍👦 Dashboard now shows comprehensive family management data');

    } catch (error) {
      addResult(`❌ Error in complete generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearDashboardData = () => {
    try {
      localStorage.removeItem('banco-familia-family-activities');
      localStorage.removeItem('banco-familia-pending-approvals');
      localStorage.removeItem('banco-familia-alerts-insights');
      
      addResult('🗑️ All parental dashboard data cleared');
      addResult('💡 Generate new data to test dashboard functionality');
    } catch (error) {
      addResult(`❌ Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            👨‍👩‍👧‍👦
          </div>
          <p className="text-gray-600 font-medium">Loading Parental Dashboard System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Parental Test
            </h1>
          </div>

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateFamilyActivity}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>⚡</span>
              <span>Generate Activities</span>
            </button>
            
            <button
              onClick={generatePendingApprovals}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>✅</span>
              <span>Generate Approvals</span>
            </button>
            
            <button
              onClick={generateAlertsAndInsights}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🚨</span>
              <span>Generate Alerts</span>
            </button>

            <button
              onClick={runCompleteDashboardGeneration}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🚀</span>
              <span>Complete Dataset</span>
            </button>

            <button
              onClick={clearDashboardData}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🗑️</span>
              <span>Clear Data</span>
            </button>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-900 mb-2">Como Usar o Dashboard Parental</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>Generate Activities:</strong> Cria atividades familiares dos últimos 7 dias</li>
                  <li>• <strong>Generate Approvals:</strong> Simula pedidos de aprovação pendentes</li>
                  <li>• <strong>Generate Alerts:</strong> Cria alertas e insights educacionais</li>
                  <li>• <strong>Complete Dataset:</strong> Gera conjunto completo de dados parentais</li>
                  <li>• <strong>Navegação por Abas:</strong> Visão Geral, Crianças, Aprovações, Alertas</li>
                  <li>• <strong>Controles Parentais:</strong> Aprovação/rejeição de solicitações</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Parental Dashboard */}
          <div className="lg:col-span-3">
            <ParentalDashboard familyId={familyId} />
          </div>

          {/* Test Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-lg">
                <span className="text-lg">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black text-green-400 rounded-2xl p-6 h-[600px] overflow-y-auto font-mono text-sm shadow-2xl border border-gray-700">
              {testResults.map((result, index) => (
                <div key={index} className="mb-2 opacity-90 hover:opacity-100 transition-opacity">
                  {result}
                </div>
              ))}
              {testResults.length === 0 && (
                <div className="text-gray-500 italic">Running tests...</div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/statements-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Statements</span>
          </a>
        </div>
      </div>
    </div>
  );
}