'use client';

import { useState, useEffect } from 'react';
import { GamificationService } from '@/lib/services/gamification';
import type { ChildStreak } from '@/lib/supabase';

interface StreakDisplayProps {
  childId: string;
}

export default function StreakDisplay({ childId }: StreakDisplayProps) {
  const [streaks, setStreaks] = useState<ChildStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadStreaks();
    }
  }, [childId]);

  const loadStreaks = async () => {
    try {
      const childStreaks = await GamificationService.getChildStreaks(childId);
      setStreaks(childStreaks);
    } catch (error) {
      console.error('Error loading streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (streaks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Active Streaks</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active streaks</h3>
          <p className="text-gray-600">Start saving or completing tasks to build streaks!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Active Streaks</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streaks.map(streak => {
          const streakInfo = GamificationService.getStreakDisplayInfo(streak);
          const daysSinceLastActivity = Math.floor(
            (new Date().getTime() - new Date(streak.last_activity).getTime()) / (1000 * 60 * 60 * 24)
          );
          const isAtRisk = daysSinceLastActivity > 0;

          return (
            <div 
              key={streak.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isAtRisk 
                  ? 'border-orange-200 bg-orange-50' 
                  : 'border-green-200 bg-green-50'
              }`}
            >
              {/* Streak Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{streakInfo.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{streakInfo.title}</h3>
                    <p className="text-xs text-gray-600">{streakInfo.description}</p>
                  </div>
                </div>
                
                {isAtRisk && (
                  <div className="text-orange-500 text-sm font-medium">
                    ⚠️ At Risk
                  </div>
                )}
              </div>

              {/* Current Streak */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    isAtRisk ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {streak.current_count}
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                
                <div className="text-4xl">
                  {isAtRisk ? '⏰' : '🔥'}
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {streak.best_count}
                  </div>
                  <div className="text-xs text-gray-500">Best</div>
                </div>
              </div>

              {/* Progress towards next milestone */}
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">
                  Progress to next milestone
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      isAtRisk ? 'bg-orange-400' : 'bg-green-400'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (streak.current_count % 7) * (100/7))}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {7 - (streak.current_count % 7)} days to next badge milestone
                </div>
              </div>

              {/* Last Activity */}
              <div className="text-xs text-gray-500">
                Last activity: {daysSinceLastActivity === 0 
                  ? 'Today' 
                  : `${daysSinceLastActivity} day${daysSinceLastActivity > 1 ? 's' : ''} ago`
                }
              </div>

              {/* Streak Warning */}
              {isAtRisk && (
                <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-800">
                  💡 Complete a {streakInfo.description.toLowerCase()} activity today to keep your streak alive!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips for building streaks */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Building Streaks</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• Save a little bit every day to build your Daily Saver streak</div>
          <div>• Set weekly goals and track your progress regularly</div>
          <div>• Log all your transactions to maintain your Activity Logger streak</div>
          <div>• Streaks reset if you miss a day, so stay consistent!</div>
        </div>
      </div>
    </div>
  );
}