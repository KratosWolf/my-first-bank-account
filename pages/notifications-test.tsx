'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { NotificationService } from '@/lib/services/notifications';
import type { Child } from '@/lib/supabase';
import type { Notification } from '@/lib/services/notifications';

export default function NotificationsTest() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const loadTestData = async () => {
    try {
      addResult('📬 Loading Notifications test data...');

      // Get or create test children
      let testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      
      if (testChildren.length === 0) {
        addResult('📝 Creating test children...');
        
        const testChild1 = await StorageAdapter.createChild({
          family_id: 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36',
          name: 'Clara Notificações',
          pin: '2222',
          avatar: '👩‍💻',
          balance: 40.0,
          total_earned: 80.0,
          total_spent: 40.0,
          level: 2,
          xp: 200
        });
        
        testChildren = [testChild1].filter(child => child !== null) as Child[];
        addResult(`✅ Created ${testChildren.length} test children`);
      }

      setChildren(testChildren);
      setSelectedChild(testChildren[0] || null);
      addResult('📨 Notification system ready for testing!');

    } catch (error) {
      addResult(`❌ Error loading test data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAchievementNotification = async () => {
    if (!selectedChild) return;

    try {
      addResult('🏆 Testing achievement notification...');

      await NotificationService.notifyAchievement(
        selectedChild.id,
        'parent-test-id',
        {
          type: 'badge',
          title: 'Super Organizador',
          description: 'Você organizou o quarto perfeitamente!',
          icon: '🏠',
          xp_reward: 50
        }
      );

      addResult('✅ Achievement notification sent successfully!');
      await loadNotifications();

    } catch (error) {
      addResult(`❌ Error sending achievement notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testLevelUpNotification = async () => {
    if (!selectedChild) return;

    try {
      addResult('⭐ Testing level up notification...');

      await NotificationService.notifyLevelUp(
        selectedChild.id,
        'parent-test-id',
        selectedChild.level + 1,
        100
      );

      addResult(`✅ Level up notification sent! New level: ${selectedChild.level + 1}`);
      await loadNotifications();

    } catch (error) {
      addResult(`❌ Error sending level up notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testStreakNotification = async () => {
    if (!selectedChild) return;

    try {
      addResult('🔥 Testing streak notification...');

      const streakCount = 7; // Simulate 7-day streak
      await NotificationService.notifyStreak(
        selectedChild.id,
        'parent-test-id',
        streakCount
      );

      addResult(`✅ Streak notification sent! ${streakCount} days streak!`);
      await loadNotifications();

    } catch (error) {
      addResult(`❌ Error sending streak notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testChoreCompletedNotification = async () => {
    if (!selectedChild) return;

    try {
      addResult('✅ Testing chore completed notification...');

      await NotificationService.notifyChoreCompleted(
        selectedChild.id,
        'parent-test-id',
        'Lavar a louça',
        15.00
      );

      addResult('✅ Chore completed notification sent to parent!');
      await loadNotifications();

    } catch (error) {
      addResult(`❌ Error sending chore notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadNotifications = async () => {
    if (!selectedChild) return;

    try {
      const childNotifications = await NotificationService.getNotifications(selectedChild.id);
      const parentNotifications = await NotificationService.getNotifications('parent-test-id');
      
      setNotifications([...childNotifications, ...parentNotifications]);
      addResult(`📱 Loaded ${childNotifications.length} child + ${parentNotifications.length} parent notifications`);

    } catch (error) {
      addResult(`❌ Error loading notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    addResult('🗑️ Notifications cleared from display');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            📬
          </div>
          <p className="text-gray-600 font-medium">Loading Notifications System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg">
              <span className="text-3xl">📬</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Notifications System Test
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
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    {child.avatar} {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={testAchievementNotification}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🏆</span>
              <span>Achievement</span>
            </button>
            
            <button
              onClick={testLevelUpNotification}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>⭐</span>
              <span>Level Up</span>
            </button>
            
            <button
              onClick={testStreakNotification}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>🔥</span>
              <span>Streak</span>
            </button>

            <button
              onClick={testChoreCompletedNotification}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>✅</span>
              <span>Chore Done</span>
            </button>

            <button
              onClick={loadNotifications}
              disabled={!selectedChild}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <span>📱</span>
              <span>Load Notifications</span>
            </button>

            <button
              onClick={clearNotifications}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>🗑️</span>
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

          {/* Notifications Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg">
                <span className="text-lg">📨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Notifications ({notifications.length})</h3>
            </div>
            
            <div className="space-y-3 h-64 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    notification.recipient_type === 'child'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-bold text-gray-600">
                          {notification.recipient_type === 'child' ? '👶 Child' : '👨‍👩‍👧‍👦 Parent'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.created_at ? new Date(notification.created_at).toLocaleTimeString() : 'Now'}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No notifications yet. Click the test buttons above!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/leaderboard-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>🏆</span>
            <span>Test Leaderboard</span>
          </a>
          <a
            href="/recurring-chores-test"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span>←</span>
            <span>Back to Recurring Chores</span>
          </a>
        </div>
      </div>
    </div>
  );
}