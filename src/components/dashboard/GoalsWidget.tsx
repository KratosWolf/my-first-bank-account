'use client';

import { useState, useEffect } from 'react';
import { GoalsService } from '@/lib/services/goals';
import type { Goal } from '@/lib/supabase';

interface GoalsWidgetProps {
  childId: string;
  childName: string;
  compact?: boolean;
}

export default function GoalsWidget({ childId, childName, compact = false }: GoalsWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, [childId]);

  const loadGoals = async () => {
    try {
      const childGoals = await GoalsService.getChildGoals(childId);
      setGoals(childGoals.slice(0, compact ? 2 : 3)); // Show 2-3 most recent goals
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">🎯 Goals</h4>
          <span className="text-xs text-gray-500">{activeGoals.length} active</span>
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-3">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-gray-500">No goals yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.slice(0, 2).map(goal => {
              const progress = GoalsService.getGoalProgress(goal);
              const categoryInfo = GoalsService.getCategoryInfo(goal.category);
              
              return (
                <div key={goal.id} className="flex items-center space-x-2">
                  <span className="text-sm">{categoryInfo.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {goal.title}
                    </div>
                    <div className="bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          goal.is_completed ? 'bg-green-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {progress.percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="font-bold text-gray-900">Recent Goals</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
            <span className="text-xs font-semibold text-green-700">{activeGoals.length} active</span>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
            <span className="text-xs font-semibold text-gray-700">{completedGoals.length} done</span>
          </div>
        </div>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">No goals yet!</h4>
          <p className="text-sm text-gray-600">Create your first financial goal and start saving</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/goals-test'}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              Create Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.slice(0, 3).map(goal => {
            const progress = GoalsService.getGoalProgress(goal);
            const categoryInfo = GoalsService.getCategoryInfo(goal.category);
            
            return (
              <div key={goal.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-indigo-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                      <span className="text-lg">{categoryInfo.emoji}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{goal.title}</h4>
                      <p className="text-xs text-gray-600 font-medium">
                        <span className="text-green-600">R$ {goal.current_amount.toFixed(2)}</span> / <span className="text-indigo-600">R$ {goal.target_amount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  
                  {goal.is_completed && (
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✨ Done
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 shadow-sm ${
                      goal.is_completed 
                        ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 animate-pulse' 
                        : 'bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {progress.percentage.toFixed(1)}% complete
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    R$ {(goal.target_amount - goal.current_amount).toFixed(2)} to go
                  </span>
                </div>
              </div>
            );
          })}
          
          <button 
            onClick={() => window.location.href = '/goals-test'}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 text-sm"
          >
            View All Goals →
          </button>
        </div>
      )}
    </div>
  );
}