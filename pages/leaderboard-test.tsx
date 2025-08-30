'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { LeaderboardService } from '@/lib/services/leaderboard';
import FamilyLeaderboard from '../src/components/leaderboard/FamilyLeaderboard';
import type { Child } from '@/lib/supabase';

export default function LeaderboardTest() {
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
      addResult('🏆 Loading Leaderboard test data...');

      // Get or create test children with varied stats for interesting leaderboard
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children with varied stats...');
        
        const children = [
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Maria Líder',
            pin: '1111',
            avatar: '👧',
            balance: 80.0,
            total_earned: 160.0,
            total_spent: 80.0,
            level: 4,
            xp: 450
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'João Competidor',
            pin: '2222',
            avatar: '🧑',
            balance: 60.0,
            total_earned: 120.0,
            total_spent: 60.0,
            level: 3,
            xp: 380
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Ana Iniciante',
            pin: '3333',
            avatar: '👶',
            balance: 20.0,
            total_earned: 40.0,
            total_spent: 20.0,
            level: 2,
            xp: 180
          },
          {
            family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
            name: 'Pedro Novato',
            pin: '4444',
            avatar: '🧒',
            balance: 10.0,
            total_earned: 20.0,
            total_spent: 10.0,
            level: 1,
            xp: 80
          }
        ];

        for (const childData of children) {
          const child = await StorageAdapter.createChild(childData);
          if (child) testChildren.push(child);
        }
        
        addResult(`✅ Created ${testChildren.length} test children with varied stats`);
      }

      setChildren(testChildren);
      addResult('🏆 Leaderboard system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateXPGain = async () => {
    if (children.length === 0) return;

    try {
      addResult('⭐ Simulating XP gain for random child...');

      // Pick a random child and give them some XP
      const randomChild = children[Math.floor(Math.random() * children.length)];
      const xpGain = Math.floor(Math.random() * 50) + 25; // 25-75 XP
      
      // Update child in localStorage (simplified)
      randomChild.xp += xpGain;
      
      // Check for level up
      const xpForNextLevel = Math.floor(100 * Math.pow(1.5, randomChild.level));
      if (randomChild.xp >= xpForNextLevel) {
        randomChild.level += 1;
        addResult(`🎉 ${randomChild.name} subiu para o nível ${randomChild.level}!`);
      }

      addResult(`✅ ${randomChild.name} ganhou ${xpGain} XP (Total: ${randomChild.xp})`);
      
      // Force re-render
      setChildren([...children]);

    } catch (error) {
      addResult(`❌ Error simulating XP gain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateTaskCompletion = async () => {
    if (children.length === 0) return;

    try {
      addResult('✅ Simulating task completion...');

      const randomChild = children[Math.floor(Math.random() * children.length)];
      const earnings = Math.floor(Math.random() * 20) + 10; // R$ 10-30
      
      randomChild.total_earned += earnings;
      randomChild.balance += earnings;
      randomChild.xp += Math.floor(earnings / 2); // 1 XP per R$ 2

      // Check for level up
      const xpForNextLevel = Math.floor(100 * Math.pow(1.5, randomChild.level));
      if (randomChild.xp >= xpForNextLevel) {
        randomChild.level += 1;
        addResult(`🎉 ${randomChild.name} subiu para o nível ${randomChild.level}!`);
      }

      addResult(`✅ ${randomChild.name} completou tarefa: +R$ ${earnings} e +${Math.floor(earnings / 2)} XP`);
      
      // Force re-render
      setChildren([...children]);

    } catch (error) {
      addResult(`❌ Error simulating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetStats = async () => {
    try {
      addResult('🔄 Resetting all stats...');
      
      children.forEach(child => {
        child.xp = Math.floor(Math.random() * 200) + 50; // 50-250 XP
        child.level = Math.floor(child.xp / 100) + 1;
        child.total_earned = Math.floor(Math.random() * 100) + 20; // R$ 20-120
        child.balance = child.total_earned * 0.7;
        child.total_spent = child.total_earned * 0.3;
      });

      setChildren([...children]);
      addResult('✅ All stats randomized for testing!');

    } catch (error) {
      addResult(`❌ Error resetting stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            🏆
          </div>
          <p className="text-gray-600 font-medium">Loading Leaderboard System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Family Leaderboard Test
            </h1>
          </div>

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={simulateXPGain}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>⭐</span>
              <span>Random XP Gain</span>
            </button>
            
            <button
              onClick={simulateTaskCompletion}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>✅</span>
              <span>Complete Task</span>
            </button>
            
            <button
              onClick={resetStats}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🔄</span>
              <span>Randomize Stats</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <FamilyLeaderboard 
              familyId="ad3bf4c0-b441-48ae-9c7d-4a2e29237c36" 
              showStats={true}
            />
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
            href="/goals-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>🎯</span>
            <span>Test Goals & Dreams</span>
          </a>
          <a
            href="/notifications-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Notifications</span>
          </a>
        </div>
      </div>
    </div>
  );
}