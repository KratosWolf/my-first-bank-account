'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { supabase } from '@/lib/supabase';
import type { Child, Family } from '@/lib/supabase';

// Import dashboard widgets
import LevelWidget from '@/components/dashboard/LevelWidget';
import GoalsWidget from '@/components/dashboard/GoalsWidget';
import BadgesWidget from '@/components/dashboard/BadgesWidget';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';

export default function Dashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get families
      const { data: familiesData } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (familiesData && familiesData.length > 0) {
        setFamilies(familiesData);
        
        // Get children from first family
        const childrenData = await StorageAdapter.getChildren(familiesData[0].id);
        setChildren(childrenData);
        
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (families.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Banco da Família!</h1>
            <p className="text-gray-600 mb-6">Create your family and start your financial education journey.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-blue-900">Set Goals</h3>
                  <p className="text-blue-700">Create financial goals and track progress</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold text-purple-900">Earn Badges</h3>
                  <p className="text-purple-700">Complete activities and earn rewards</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                  <h3 className="font-semibold text-green-900">Family Fun</h3>
                  <p className="text-green-700">Compete and collaborate with family</p>
                </div>
              </div>
              
              <div className="pt-4">
                <a 
                  href="/test-database"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  🚀 Create Test Family
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Children to Your Family</h1>
            <p className="text-gray-600 mb-6">Add children to start using the financial education features.</p>
            
            <a 
              href="/test-database"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              👶 Add Children
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">🏠 Banco da Família</h1>
                <p className="text-blue-100">Family: {families[0]?.parent_name} • {children.length} children</p>
              </div>
              <div className="text-6xl">🌟</div>
            </div>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Child:</h2>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{child.avatar}</span>
                    <span>{child.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Level Progress */}
              <div className="lg:col-span-4">
                <LevelWidget child={selectedChild} />
              </div>
              
              {/* Quick Stats */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {selectedChild.balance.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Current Balance</div>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {selectedChild.total_earned.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Earned</div>
                    </div>
                    <div className="text-3xl">📈</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedChild.xp}
                      </div>
                      <div className="text-sm text-gray-500">Total XP</div>
                    </div>
                    <div className="text-3xl">⭐</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <GoalsWidget childId={selectedChild.id} childName={selectedChild.name} />
              <BadgesWidget childId={selectedChild.id} />
              <LeaderboardWidget familyId={selectedChild.family_id} currentChildId={selectedChild.id} />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="/goals-test"
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-medium text-blue-900">Goals & Dreams</div>
              <div className="text-sm text-blue-700">Set and track goals</div>
            </a>
            
            <a 
              href="/gamification-test"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center"
            >
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-medium text-purple-900">Badges & Levels</div>
              <div className="text-sm text-purple-700">View achievements</div>
            </a>
            
            <a 
              href="/test-database"
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center"
            >
              <div className="text-3xl mb-2">🗃️</div>
              <div className="font-medium text-green-900">Database</div>
              <div className="text-sm text-green-700">Manage data</div>
            </a>
            
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl text-center opacity-75">
              <div className="text-3xl mb-2">🔮</div>
              <div className="font-medium text-gray-700">More Coming</div>
              <div className="text-sm text-gray-500">Stay tuned!</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🏠 Banco da Família - Teaching Financial Literacy Through Fun! 🌟</p>
        </div>
      </div>
    </div>
  );
}