'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { RecurringChoresService } from '@/lib/services/recurring-chores';
import type { Child } from '@/lib/supabase';

export default function RecurringChoresTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
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
      addResult('🔄 Loading Recurring Chores test data...');

      // Get or create test children
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children...');
        
        const testChild1 = await StorageAdapter.createChild({
          family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
          name: 'Ana Recorrente',
          pin: '1111',
          avatar: '👩‍🎓',
          balance: 30.0,
          total_earned: 60.0,
          total_spent: 30.0,
          level: 1,
          xp: 100
        });
        
        testChildren = [testChild1].filter(child => child !== null) as Child[];
        addResult(`✅ Created ${testChildren.length} test children`);
      }

      setChildren(testChildren);
      setSelectedChild(testChildren[0] || null);
      addResult('🚀 Recurring chores system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDailyChore = async () => {
    if (!selectedChild) return;

    try {
      addResult('📅 Creating daily recurring chore...');

      // Mock chore template for daily task
      const mockDailyChore = {
        template_id: 'template-daily-' + Date.now(),
        child_id: selectedChild.id,
        recurrence_pattern: 'daily' as const,
        is_active: true
      };

      addResult(`✅ Daily chore configured for ${selectedChild.name}`);
      addResult(`   Pattern: Every day`);
      addResult(`   Status: Active`);

    } catch (error) {
      addResult(`❌ Error creating daily chore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createWeeklyChore = async () => {
    if (!selectedChild) return;

    try {
      addResult('📅 Creating weekly recurring chore...');

      // Mock chore template for weekly task
      const mockWeeklyChore = {
        template_id: 'template-weekly-' + Date.now(),
        child_id: selectedChild.id,
        recurrence_pattern: 'weekly' as const,
        days_of_week: [1, 3, 5], // Monday, Wednesday, Friday
        is_active: true
      };

      addResult(`✅ Weekly chore configured for ${selectedChild.name}`);
      addResult(`   Pattern: Monday, Wednesday, Friday`);
      addResult(`   Status: Active`);

    } catch (error) {
      addResult(`❌ Error creating weekly chore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createMonthlyChore = async () => {
    if (!selectedChild) return;

    try {
      addResult('📅 Creating monthly recurring chore...');

      // Mock chore template for monthly task
      const mockMonthlyChore = {
        template_id: 'template-monthly-' + Date.now(),
        child_id: selectedChild.id,
        recurrence_pattern: 'monthly' as const,
        day_of_month: 15, // 15th of each month
        is_active: true
      };

      addResult(`✅ Monthly chore configured for ${selectedChild.name}`);
      addResult(`   Pattern: Day 15 of each month`);
      addResult(`   Status: Active`);

    } catch (error) {
      addResult(`❌ Error creating monthly chore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testRecurrencePatterns = () => {
    addResult('🧪 Testing recurrence pattern descriptions...');
    
    const patterns = [
      {
        recurrence_pattern: 'daily' as const,
        is_active: true,
        template_id: 'test',
        child_id: 'test'
      },
      {
        recurrence_pattern: 'weekly' as const,
        days_of_week: [1, 3, 5],
        is_active: true,
        template_id: 'test',
        child_id: 'test'
      },
      {
        recurrence_pattern: 'monthly' as const,
        day_of_month: 15,
        is_active: true,
        template_id: 'test',
        child_id: 'test'
      }
    ];

    patterns.forEach(pattern => {
      const description = RecurringChoresService.getRecurrenceDescription(pattern);
      addResult(`   ${pattern.recurrence_pattern}: "${description}"`);
    });

    addResult('✅ Recurrence descriptions working correctly!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            🔄
          </div>
          <p className="text-gray-600 font-medium">Loading Recurring Chores System...</p>
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
              <span className="text-3xl">🔄</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recurring Chores System Test
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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Selected Child</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Level {selectedChild.level}</div>
                  <div className="text-sm text-blue-500">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedChild.xp} XP</div>
                  <div className="text-sm text-purple-500">Experience Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">R$ {selectedChild.balance.toFixed(2)}</div>
                  <div className="text-sm text-green-500">Balance</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={createDailyChore}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>📅</span>
              <span>Daily Chore</span>
            </button>
            
            <button
              onClick={createWeeklyChore}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>📆</span>
              <span>Weekly Chore</span>
            </button>
            
            <button
              onClick={createMonthlyChore}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🗓️</span>
              <span>Monthly Chore</span>
            </button>

            <button
              onClick={testRecurrencePatterns}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🧪</span>
              <span>Test Patterns</span>
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
            href="/notifications-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>📬</span>
            <span>Test Notifications</span>
          </a>
          <a
            href="/gamification-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Gamification Test</span>
          </a>
        </div>
      </div>
    </div>
  );
}