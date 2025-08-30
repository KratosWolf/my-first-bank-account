'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { AnalyticsService } from '@/lib/services/analytics';
import FamilyAnalyticsDashboard from '../src/components/analytics/FamilyAnalyticsDashboard';
import type { Child } from '@/lib/supabase';

export default function AnalyticsTest() {
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
      addResult('📊 Loading Analytics test data...');

      // Get or create test children with rich financial data
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children with analytics data...');
        
        const children = [
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Sofia Analítica',
            pin: '1111',
            avatar: '👧',
            balance: 125.50,
            total_earned: 300.0,
            total_spent: 174.50,
            level: 5,
            xp: 650
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Miguel Poupador',
            pin: '2222',
            avatar: '🧑',
            balance: 89.25,
            total_earned: 200.0,
            total_spent: 110.75,
            level: 4,
            xp: 420
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Clara Iniciante',
            pin: '3333',
            avatar: '👶',
            balance: 45.75,
            total_earned: 80.0,
            total_spent: 34.25,
            level: 2,
            xp: 180
          }
        ];

        for (const childData of children) {
          const child = await StorageAdapter.createChild(childData);
          if (child) testChildren.push(child);
        }
        
        addResult(`✅ Created ${testChildren.length} test children with rich data`);
      }

      setChildren(testChildren);
      addResult('📊 Analytics dashboard ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTasks = async () => {
    if (children.length === 0) return;

    try {
      addResult('📋 Generating mock task history...');

      // Simulate task completion history for analytics
      const taskTypes = [
        'Arrumar a cama', 'Guardar brinquedos', 'Ajudar na cozinha',
        'Fazer lição de casa', 'Escovar dentes', 'Organizar quarto',
        'Regar plantas', 'Levar lixo', 'Ajudar irmão'
      ];

      // Generate random task completions for last 4 weeks
      for (const child of children) {
        const tasksThisMonth = Math.floor(Math.random() * 30) + 15; // 15-45 tasks
        
        for (let i = 0; i < tasksThisMonth; i++) {
          const randomTask = taskTypes[Math.floor(Math.random() * taskTypes.length)];
          const daysAgo = Math.floor(Math.random() * 28); // Last 4 weeks
          const completedAt = new Date();
          completedAt.setDate(completedAt.getDate() - daysAgo);

          // Store mock data in localStorage for analytics
          const taskKey = `task-${child.id}-${Date.now()}-${i}`;
          const taskData = {
            id: taskKey,
            child_id: child.id,
            title: randomTask,
            reward_amount: Math.floor(Math.random() * 15) + 5, // R$ 5-20
            xp_reward: Math.floor(Math.random() * 20) + 10, // 10-30 XP
            completed_at: completedAt.toISOString(),
            status: 'completed'
          };

          // Store in localStorage for analytics service to read
          const tasks = JSON.parse(localStorage.getItem('banco-familia-tasks') || '[]');
          tasks.push(taskData);
          localStorage.setItem('banco-familia-tasks', JSON.stringify(tasks));
        }

        addResult(`✅ Generated ${tasksThisMonth} tasks for ${child.name}`);
      }

      addResult('📊 Mock task history generated successfully!');

    } catch (error) {
      addResult(`❌ Error generating mock tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateWeeklyActivity = async () => {
    try {
      addResult('📅 Simulating weekly activity patterns...');

      // Create weekly patterns for better analytics
      const weeks = ['2025-08-17', '2025-08-10', '2025-08-03', '2025-07-27']; // Last 4 weeks

      for (const weekStart of weeks) {
        for (const child of children) {
          const tasksThisWeek = Math.floor(Math.random() * 8) + 3; // 3-11 tasks per week
          const earningsThisWeek = tasksThisWeek * (Math.floor(Math.random() * 10) + 8); // R$ 8-18 per task

          // Store weekly summary for analytics
          const weeklyData = {
            week: weekStart,
            child_id: child.id,
            tasks_completed: tasksThisWeek,
            total_earned: earningsThisWeek,
            streak_days: Math.floor(Math.random() * 7) + 1,
            level_at_end: child.level,
            xp_gained: tasksThisWeek * 15
          };

          const weeklyAnalytics = JSON.parse(localStorage.getItem('banco-familia-weekly-stats') || '[]');
          weeklyAnalytics.push(weeklyData);
          localStorage.setItem('banco-familia-weekly-stats', JSON.stringify(weeklyAnalytics));
        }
      }

      addResult('✅ Weekly activity patterns created for rich analytics!');

    } catch (error) {
      addResult(`❌ Error simulating weekly activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateFamilyGoals = async () => {
    if (children.length === 0) return;

    try {
      addResult('🎯 Generating family goals for analytics...');

      const goalTemplates = [
        { title: 'Nintendo Switch', target: 1299.99, category: 'electronics', child: 0 },
        { title: 'Bicicleta Nova', target: 599.99, category: 'sports', child: 1 },
        { title: 'Kit LEGO', target: 199.99, category: 'toy', child: 2 },
        { title: 'Viagem Disney', target: 8000.00, category: 'experiences', child: 0 },
        { title: 'Tablet', target: 899.99, category: 'electronics', child: 1 }
      ];

      const goals = [];
      for (let i = 0; i < goalTemplates.length; i++) {
        const template = goalTemplates[i];
        const child = children[template.child] || children[0];
        
        const goal = {
          id: `goal-analytics-${i}`,
          child_id: child.id,
          title: template.title,
          description: `Meta de ${child.name}`,
          target_amount: template.target,
          current_amount: Math.floor(Math.random() * template.target * 0.7), // 0-70% progress
          category: template.category,
          priority: i < 2 ? 'high' : 'medium',
          emoji: template.category === 'electronics' ? '📱' : template.category === 'sports' ? '🚴' : template.category === 'toy' ? '🧸' : template.category === 'experiences' ? '🏰' : '🎯',
          is_active: true,
          is_completed: Math.random() < 0.2, // 20% chance of being completed
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
        };

        goals.push(goal);
      }

      localStorage.setItem('banco-familia-goals', JSON.stringify(goals));
      addResult(`✅ Generated ${goals.length} family goals for analytics`);

    } catch (error) {
      addResult(`❌ Error generating goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runCompleteAnalytics = async () => {
    try {
      addResult('🚀 Running complete analytics generation...');
      
      await generateMockTasks();
      await simulateWeeklyActivity();
      await generateFamilyGoals();

      addResult('✨ Complete analytics dataset generated!');
      addResult('📊 Dashboard should now show rich analytics data');

    } catch (error) {
      addResult(`❌ Error running complete analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAnalyticsData = () => {
    try {
      localStorage.removeItem('banco-familia-tasks');
      localStorage.removeItem('banco-familia-weekly-stats');
      localStorage.removeItem('banco-familia-goals');
      
      addResult('🗑️ All analytics data cleared');
      addResult('💡 Generate new data to see analytics again');

    } catch (error) {
      addResult(`❌ Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            📊
          </div>
          <p className="text-gray-600 font-medium">Loading Analytics System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard Test
            </h1>
          </div>

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateMockTasks}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>📋</span>
              <span>Generate Tasks</span>
            </button>
            
            <button
              onClick={simulateWeeklyActivity}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>📅</span>
              <span>Weekly Patterns</span>
            </button>
            
            <button
              onClick={generateFamilyGoals}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🎯</span>
              <span>Generate Goals</span>
            </button>

            <button
              onClick={runCompleteAnalytics}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🚀</span>
              <span>Complete Analytics</span>
            </button>

            <button
              onClick={clearAnalyticsData}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🗑️</span>
              <span>Clear Data</span>
            </button>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 mb-2">Como Usar o Analytics</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Generate Tasks:</strong> Cria histórico de tarefas para análise</li>
                  <li>• <strong>Weekly Patterns:</strong> Simula padrões semanais de atividade</li>
                  <li>• <strong>Generate Goals:</strong> Cria metas familiares para insights</li>
                  <li>• <strong>Complete Analytics:</strong> Gera conjunto completo de dados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Analytics Dashboard */}
          <div className="lg:col-span-3">
            <FamilyAnalyticsDashboard familyId="ad3bf4c0-b441-48ae-9c7d-4a2e29237c36" />
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
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>📊</span>
            <span>Test Statements System</span>
          </a>
          <a
            href="/goals-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Goals</span>
          </a>
        </div>
      </div>
    </div>
  );
}