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
  total_earned: number;
  rank: number;
  levelInfo: any;
  progress: any;
}

interface FamilyLeaderboardProps {
  familyId: string;
  currentChildId?: string;
}

export default function FamilyLeaderboard({ familyId, currentChildId }: FamilyLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'level' | 'balance' | 'earned'>('level');

  useEffect(() => {
    if (familyId) {
      loadLeaderboard();
    }
  }, [familyId, sortBy]);

  const loadLeaderboard = async () => {
    try {
      let data = await GamificationService.getFamilyLeaderboard(familyId);
      
      // Sort based on selected criteria
      if (sortBy === 'balance') {
        data.sort((a, b) => b.balance - a.balance);
      } else if (sortBy === 'earned') {
        data.sort((a, b) => b.total_earned - a.total_earned);
      }
      // Default is already sorted by level and XP

      // Update ranks after sorting
      data = data.map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      setLeaderboard(data);
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

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 2: return 'bg-gray-100 border-gray-300 text-gray-800';
      case 3: return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-white border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Family Leaderboard</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600">Add more children to see the family leaderboard!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">🏆 Family Leaderboard</h2>
        
        {/* Sort Options */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy('level')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'level'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Level
          </button>
          <button
            onClick={() => setSortBy('balance')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'balance'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Balance
          </button>
          <button
            onClick={() => setSortBy('earned')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              sortBy === 'earned'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Earned
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const isCurrentChild = entry.id === currentChildId;
          
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrentChild 
                  ? 'border-indigo-300 bg-indigo-50 shadow-md' 
                  : getRankColor(entry.rank)
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Rank, Avatar, Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    <span className="text-lg font-bold">
                      {getRankIcon(entry.rank)}
                    </span>
                  </div>
                  
                  <div className="text-3xl">{entry.avatar}</div>
                  
                  <div>
                    <h3 className={`font-semibold ${
                      isCurrentChild ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {entry.name}
                      {isCurrentChild && (
                        <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        👑 Level {entry.level} - {entry.levelInfo.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Stats */}
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className={`font-bold ${
                        sortBy === 'level' && entry.rank === 1 ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {entry.xp.toLocaleString()}
                      </div>
                      <div className="text-gray-500">XP</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-bold ${
                        sortBy === 'balance' && entry.rank === 1 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        R$ {entry.balance.toFixed(2)}
                      </div>
                      <div className="text-gray-500">Balance</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      sortBy === 'earned' && entry.rank === 1 ? 'text-yellow-600' : 'text-indigo-600'
                    }`}>
                      R$ {entry.total_earned.toFixed(2)} earned
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar for current child */}
              {isCurrentChild && !entry.progress.percentage !== 100 && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <div className="flex items-center justify-between text-xs text-indigo-700 mb-1">
                    <span>Progress to Level {entry.level + 1}</span>
                    <span>{entry.progress.percentage}%</span>
                  </div>
                  <div className="bg-indigo-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${entry.progress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {entry.progress.needed} XP needed
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Achievement Message */}
      {leaderboard.length > 1 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-sm text-yellow-800">
              <strong>{leaderboard[0].name}</strong> is leading the family with Level {leaderboard[0].level}!
              {leaderboard.length > 1 && (
                <div className="mt-1">
                  Keep saving and earning to climb the leaderboard! 🚀
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}