'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { ChoresService } from '@/lib/services/chores';
import { GamificationService } from '@/lib/services/gamification';
import AchievementCelebration from '@/components/gamification/AchievementCelebration';
import type { Child } from '@/lib/supabase';

export default function GamificationTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadTestData();
  }, []);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const loadTestData = async () => {
    try {
      addResult('🎮 Loading Gamification test data...');

      // Get test children - try both Supabase and create test data if needed
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        // Create test children for gamification testing
        addResult('📝 Creating test children for gamification...');
        
        const testChild1 = await StorageAdapter.createChild({
          family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
          name: 'João Teste',
          pin: '1234',
          avatar: '🧑‍🎓',
          balance: 50.0,
          total_earned: 100.0,
          total_spent: 50.0,
          level: 2,
          xp: 150
        });
        
        const testChild2 = await StorageAdapter.createChild({
          family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
          name: 'Maria Teste',
          pin: '5678',
          avatar: '👧',
          balance: 25.0,
          total_earned: 75.0,
          total_spent: 50.0,
          level: 1,
          xp: 75
        });
        
        testChildren = [testChild1, testChild2].filter(child => child !== null) as Child[];
        addResult(`✅ Created ${testChildren.length} test children`);
      }
      
      if (testChildren.length === 0) {
        addResult('❌ No test children found. Please run database tests first.');
        return;
      }

      addResult(`✅ Found ${testChildren.length} test children`);
      setChildren(testChildren);
      setSelectedChild(testChildren[0]);

      addResult('🚀 Gamification system loaded successfully!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateFirstChore = async () => {
    if (!selectedChild) return;

    try {
      addResult('🌟 Simulating first chore achievement...');

      const awarded = await GamificationService.checkFirstChoreAchievement(selectedChild.id);
      
      if (awarded) {
        addResult('✅ First chore achievement unlocked!');
        
        const firstChoreAchievement = [{
          type: 'badge',
          title: 'Primeira Tarefa',
          description: 'Você completou sua primeira tarefa! Continue assim!',
          icon: '🌟',
          xp_reward: 25
        }];
        
        setAchievements(firstChoreAchievement);
        setShowCelebration(true);
      } else {
        addResult('ℹ️ First chore achievement already unlocked');
      }

    } catch (error) {
      addResult(`❌ Error simulating first chore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateStreak = async () => {
    if (!selectedChild) return;

    try {
      addResult('🔥 Simulating streak update...');

      const streakCount = await GamificationService.updateDailyChoreStreak(selectedChild.id);
      addResult(`✅ Streak updated: ${streakCount} days`);

      if (streakCount >= 7) {
        const streakAchievements = [{
          type: 'streak',
          title: 'Trabalhador Consistente',
          description: 'Você completou tarefas por 7 dias seguidos!',
          icon: '🔥',
          streak_count: streakCount,
          xp_reward: 50
        }];
        
        setAchievements(streakAchievements);
        setShowCelebration(true);
        addResult('🎉 Streak achievement unlocked!');
      }

    } catch (error) {
      addResult(`❌ Error simulating streak: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateLevelUp = async () => {
    if (!selectedChild) return;

    try {
      addResult('⭐ Simulating level progression...');

      const levelProgress = await GamificationService.checkLevelProgression(selectedChild.id);
      
      if (levelProgress.leveled_up) {
        addResult(`🎉 Level up! New level: ${levelProgress.new_level}`);
        
        const levelAchievements = [{
          type: 'level',
          title: 'Subiu de Nível!',
          description: `Parabéns! Você alcançou o nível ${levelProgress.new_level}!`,
          icon: '⭐',
          level: levelProgress.new_level,
          xp_reward: 100
        }];
        
        setAchievements(levelAchievements);
        setShowCelebration(true);
      } else {
        addResult('ℹ️ No level up yet - need more XP');
      }

    } catch (error) {
      addResult(`❌ Error checking level progression: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testMultipleAchievements = () => {
    const multipleAchievements = [
      {
        type: 'badge',
        title: 'Primeira Tarefa',
        description: 'Você completou sua primeira tarefa!',
        icon: '🌟',
        xp_reward: 25
      },
      {
        type: 'streak',
        title: 'Trabalhador Consistente',
        description: 'Você completou tarefas por 7 dias seguidos!',
        icon: '🔥',
        streak_count: 7,
        xp_reward: 50
      },
      {
        type: 'level',
        title: 'Subiu de Nível!',
        description: 'Parabéns! Você alcançou o nível 3!',
        icon: '⭐',
        level: 3,
        xp_reward: 100
      }
    ];
    
    setAchievements(multipleAchievements);
    setShowCelebration(true);
    addResult('🎊 Showing multiple achievements celebration');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            🎮
          </div>
          <p className="text-gray-600 font-medium">Loading Gamification System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
              <span className="text-3xl">🎮</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gamification System Test
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
                    onClick={() => setSelectedChild(child)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedChild?.id === child.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    {child.avatar} {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedChild && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Selected Child</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Level {selectedChild.level}</div>
                  <div className="text-sm text-purple-500">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{selectedChild.xp} XP</div>
                  <div className="text-sm text-pink-500">Experience Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">R$ {selectedChild.balance.toFixed(2)}</div>
                  <div className="text-sm text-orange-500">Balance</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={simulateFirstChore}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🌟</span>
              <span>First Chore Badge</span>
            </button>
            
            <button
              onClick={simulateStreak}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🔥</span>
              <span>Update Streak</span>
            </button>
            
            <button
              onClick={simulateLevelUp}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>⭐</span>
              <span>Check Level Up</span>
            </button>

            <button
              onClick={testMultipleAchievements}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🎊</span>
              <span>Multiple Achievements</span>
            </button>
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
          
          <div className="bg-gradient-to-br from-gray-900 to-black text-green-400 rounded-2xl p-6 h-64 overflow-y-auto font-mono text-sm shadow-2xl border border-gray-700">
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

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/recurring-chores-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>🔄</span>
            <span>Test Recurring Chores</span>
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </a>
        </div>
      </div>

      {/* Achievement Celebration Modal */}
      {showCelebration && (
        <AchievementCelebration
          achievements={achievements}
          childName={selectedChild?.name || 'Criança'}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}