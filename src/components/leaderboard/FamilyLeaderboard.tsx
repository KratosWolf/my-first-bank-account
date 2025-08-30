'use client';

import { useState, useEffect } from 'react';
import { LeaderboardService, type LeaderboardEntry, type FamilyStats } from '@/lib/services/leaderboard';

interface FamilyLeaderboardProps {
  familyId: string;
  period?: 'week' | 'month' | 'all';
  showStats?: boolean;
}

export default function FamilyLeaderboard({ 
  familyId, 
  period = 'all', 
  showStats = true 
}: FamilyLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    loadLeaderboard();
  }, [familyId, selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const [leaderboardData, statsData] = await Promise.all([
        LeaderboardService.getFamilyLeaderboard(familyId, selectedPeriod),
        showStats ? LeaderboardService.getFamilyStats(familyId) : Promise.resolve(null)
      ]);
      
      setLeaderboard(leaderboardData);
      setFamilyStats(statsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankingBadge = (rank: number) => LeaderboardService.getRankingBadge(rank);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            <span className="text-2xl">🏆</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ranking Familiar</h2>
            <p className="text-gray-600">Competição saudável em família</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'all'] as const).map((periodOption) => (
            <button
              key={periodOption}
              onClick={() => setSelectedPeriod(periodOption)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === periodOption
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {periodOption === 'week' ? 'Semana' : periodOption === 'month' ? 'Mês' : 'Geral'}
            </button>
          ))}
        </div>
      </div>

      {/* Family Stats */}
      {showStats && familyStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{familyStats.total_xp}</div>
            <div className="text-sm text-blue-500">XP Total</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">R$ {familyStats.total_earnings.toFixed(2)}</div>
            <div className="text-sm text-green-500">Ganhos Totais</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{familyStats.total_chores_completed}</div>
            <div className="text-sm text-purple-500">Tarefas Feitas</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{familyStats.family_streak}</div>
            <div className="text-sm text-orange-500">Sequência Familiar</div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum Ranking Ainda</h3>
          <p className="text-gray-600">Complete algumas tarefas para aparecer no ranking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const badge = getRankingBadge(entry.rank);
            const isTopThree = entry.rank <= 3;
            
            return (
              <div
                key={entry.child_id}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isTopThree
                    ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200 shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                  <span className="text-2xl">{badge.emoji}</span>
                </div>

                {/* Avatar */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-2xl shadow-lg">
                  {entry.child_avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{entry.child_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${badge.color} bg-white shadow-sm`}>
                      {badge.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-purple-500">⭐</span>
                      <span className="text-sm font-medium text-gray-600">Nível {entry.level}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-500">🎯</span>
                      <span className="text-sm font-medium text-gray-600">{entry.xp} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500">💰</span>
                      <span className="text-sm font-medium text-gray-600">R$ {entry.total_earned.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="hidden md:flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Progresso</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((entry.xp % 100) / 100 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {entry.rank === 1 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-yellow-600 font-medium">👑 Líder</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational Footer */}
      {leaderboard.length > 0 && (
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h4 className="font-bold text-gray-900">Dica da Semana</h4>
              <p className="text-sm text-gray-600">
                Complete tarefas todos os dias para subir no ranking e ganhar mais XP!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}