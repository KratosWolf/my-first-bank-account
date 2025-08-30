'use client';

import { useState, useEffect } from 'react';
import { GamificationService } from '@/lib/services/gamification';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  balance: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  familyId: string;
  currentChildId?: string;
  compact?: boolean;
}

export default function LeaderboardWidget({ familyId, currentChildId, compact = false }: LeaderboardWidgetProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [familyId]);

  const loadLeaderboard = async () => {
    try {
      const data = await GamificationService.getFamilyLeaderboard(familyId);
      setLeaderboard(data.slice(0, compact ? 3 : 5));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-36 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl"></div>
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
          <h4 className="font-medium text-gray-900 text-sm">🏆 Family Ranking</h4>
          <span className="text-xs text-gray-500">{leaderboard.length} members</span>
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-3">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-gray-500">No family members</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 3).map((entry) => (
              <div 
                key={entry.id}
                className={`flex items-center space-x-2 p-1 rounded ${
                  entry.id === currentChildId ? 'bg-indigo-50 border border-indigo-200' : ''
                }`}
              >
                <span className="text-sm">{getRankIcon(entry.rank)}</span>
                <span className="text-lg">{entry.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {entry.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Level {entry.level} • {entry.xp} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg">
            <span className="text-xl">🏆</span>
          </div>
          <h3 className="font-bold text-gray-900">Family Leaderboard</h3>
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
          <span className="text-xs font-semibold text-purple-700">{leaderboard.length} members</span>
        </div>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">No family members yet</h4>
          <p className="text-sm text-gray-600">Add children to see the leaderboard</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/test-database'}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              Add Children
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div 
              key={entry.id}
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 border ${
                entry.id === currentChildId 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' 
                  : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:shadow-md hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${
                entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                entry.rank === 3 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                'bg-gradient-to-r from-indigo-400 to-purple-500'
              }`}>
                <span className={`font-bold text-lg ${
                  entry.rank <= 3 ? 'text-white' : 'text-white'
                }`}>{getRankIcon(entry.rank)}</span>
              </div>
              
              <div className="text-3xl transform hover:scale-110 transition-transform duration-200">
                {entry.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-bold text-gray-900">{entry.name}</h4>
                  {entry.id === currentChildId && (
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-xs font-bold rounded-full shadow-sm">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                    <span className="text-xs font-bold text-indigo-700">Level {entry.level}</span>
                  </div>
                  <div className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    <span className="text-xs font-bold text-purple-700">{entry.xp} XP</span>
                  </div>
                  <span className="text-xs text-green-600 font-bold">R$ {entry.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => window.location.href = '/gamification-test'}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 text-sm"
          >
            View Full Leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}