'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { GoalsService, type Goal, type FamilyGoalsStats } from '@/lib/services/goals';
import GoalCard from '../src/components/goals/GoalCard';
import type { Child } from '@/lib/supabase';

export default function GoalsTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyGoalsStats | null>(null);
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
      addResult('🎯 Loading Goals test data...');

      // Get or create test children
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children...');
        
        const testChild1 = await StorageAdapter.createChild({
          family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
          name: 'Lucas Sonhador',
          pin: '1111',
          avatar: '👦',
          balance: 35.0,
          total_earned: 70.0,
          total_spent: 35.0,
          level: 2,
          xp: 180
        });
        
        testChildren = [testChild1].filter(child => child !== null) as Child[];
        addResult(`✅ Created ${testChildren.length} test children`);
      }

      setChildren(testChildren);
      setSelectedChild(testChildren[0] || null);

      // Load existing goals
      if (testChildren[0]) {
        await loadGoals(testChildren[0].id);
      }

      addResult('🎯 Goals system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async (childId: string) => {
    try {
      const childGoals = await GoalsService.getChildGoals(childId);
      setGoals(childGoals);
      
      const stats = await GoalsService.getFamilyGoalsStats('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      setFamilyStats(stats);
      
      addResult(`📊 Loaded ${childGoals.length} goals for ${selectedChild?.name}`);
    } catch (error) {
      addResult(`❌ Error loading goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createSampleGoal = async (type: 'toy' | 'electronics' | 'experiences') => {
    if (!selectedChild) return;

    try {
      addResult(`🎯 Creating sample ${type} goal...`);

      const goalTemplates = {
        toy: {
          title: 'LEGO Creator Expert',
          description: 'Set de construção avançado com mais de 2000 peças',
          target_amount: 299.99,
          emoji: '🧱',
          category: 'toy' as const
        },
        electronics: {
          title: 'Nintendo Switch',
          description: 'Console portátil para jogar onde quiser',
          target_amount: 1299.99,
          emoji: '🎮',
          category: 'electronics' as const
        },
        experiences: {
          title: 'Viagem Disney',
          description: 'Viagem em família para a Disney em Orlando',
          target_amount: 5000.00,
          emoji: '🏰',
          category: 'experiences' as const
        }
      };

      const template = goalTemplates[type];
      
      const newGoal = await GoalsService.createGoal({
        child_id: selectedChild.id,
        title: template.title,
        description: template.description,
        target_amount: template.target_amount,
        category: template.category,
        priority: type === 'experiences' ? 'high' : 'medium',
        emoji: template.emoji,
        is_active: true,
        target_date: type === 'experiences' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : // 1 year from now
          undefined
      });

      if (newGoal) {
        await loadGoals(selectedChild.id);
        addResult(`✅ Created ${type} goal: "${template.title}"`);
      } else {
        addResult(`❌ Failed to create ${type} goal`);
      }

    } catch (error) {
      addResult(`❌ Error creating goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addMoneyToGoal = async (goalId: string, amount: number) => {
    if (!selectedChild) return;

    try {
      addResult(`💰 Adding R$ ${amount.toFixed(2)} to goal...`);

      const updatedGoal = await GoalsService.addToGoal(goalId, amount, selectedChild.id);
      
      if (updatedGoal) {
        await loadGoals(selectedChild.id);
        
        const progress = GoalsService.calculateProgress(updatedGoal);
        addResult(`✅ Added R$ ${amount.toFixed(2)} - Progress: ${progress.percentage}%`);
        
        if (updatedGoal.is_completed) {
          addResult(`🎉 Goal "${updatedGoal.title}" completed!`);
        }
      } else {
        addResult(`❌ Failed to add money to goal`);
      }

    } catch (error) {
      addResult(`❌ Error adding money: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateProgress = async () => {
    if (goals.length === 0) return;

    try {
      addResult('⚡ Simulating progress on random goals...');

      // Add random amounts to random goals
      const activeGoals = goals.filter(g => !g.is_completed);
      
      for (let i = 0; i < Math.min(3, activeGoals.length); i++) {
        const randomGoal = activeGoals[Math.floor(Math.random() * activeGoals.length)];
        const randomAmount = Math.floor(Math.random() * 50) + 10; // R$ 10-60
        
        await addMoneyToGoal(randomGoal.id!, randomAmount);
      }

      addResult('✅ Progress simulation completed!');

    } catch (error) {
      addResult(`❌ Error simulating progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            🎯
          </div>
          <p className="text-gray-600 font-medium">Loading Goals System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Goals & Dreams System Test
            </h1>
          </div>
        
          {/* Child selector */}
          {children.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Select Child:
              </label>
              <div className="flex space-x-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChild(child);
                      loadGoals(child.id);
                    }}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedChild?.id === child.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    {child.avatar} {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Family Stats */}
          {familyStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{familyStats.active_goals}</div>
                <div className="text-sm text-purple-500">Metas Ativas</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{familyStats.completed_goals}</div>
                <div className="text-sm text-blue-500">Metas Concluídas</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">R$ {familyStats.total_saved_amount.toFixed(0)}</div>
                <div className="text-sm text-green-500">Total Economizado</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{familyStats.average_progress.toFixed(1)}%</div>
                <div className="text-sm text-orange-500">Progresso Médio</div>
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => createSampleGoal('toy')}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🧸</span>
              <span>Create Toy Goal</span>
            </button>
            
            <button
              onClick={() => createSampleGoal('electronics')}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>📱</span>
              <span>Create Electronics Goal</span>
            </button>
            
            <button
              onClick={() => createSampleGoal('experiences')}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🏰</span>
              <span>Create Dream Goal</span>
            </button>

            <button
              onClick={simulateProgress}
              disabled={goals.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>⚡</span>
              <span>Simulate Progress</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goals Display */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
                  <span className="text-lg">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedChild ? `Metas de ${selectedChild.name}` : 'Selecione uma Criança'}
                </h3>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Meta Ainda</h3>
                  <p className="text-gray-600">Crie uma meta para começar a economizar!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map(goal => {
                    const progress = GoalsService.calculateProgress(goal);
                    return (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        progress={progress}
                        onAddMoney={addMoneyToGoal}
                        showActions={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-lg">
                <span className="text-lg">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black text-green-400 rounded-2xl p-6 h-96 overflow-y-auto font-mono text-sm shadow-2xl border border-gray-700">
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
            href="/analytics-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>📊</span>
            <span>Test Analytics Dashboard</span>
          </a>
          <a
            href="/leaderboard-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Leaderboard</span>
          </a>
        </div>
      </div>
    </div>
  );
}