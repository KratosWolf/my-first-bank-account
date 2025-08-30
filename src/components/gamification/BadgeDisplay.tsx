'use client';

import { useState, useEffect } from 'react';
import { GamificationService } from '@/lib/services/gamification';
import type { Badge, ChildBadge } from '@/lib/supabase';

interface BadgeDisplayProps {
  childId: string;
  showProgress?: boolean;
}

interface BadgeWithProgress extends Badge {
  earned: boolean;
  earnedAt?: string;
}

export default function BadgeDisplay({ childId, showProgress = true }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Badge['category'] | 'all'>('all');

  useEffect(() => {
    if (childId) {
      loadBadges();
    }
  }, [childId]);

  const loadBadges = async () => {
    try {
      const badgeProgress = await GamificationService.getBadgeProgress(childId);
      setBadges(badgeProgress);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const categories: Array<{ key: Badge['category'] | 'all'; label: string; emoji: string }> = [
    { key: 'all', label: 'All', emoji: '🏆' },
    { key: 'earning', label: 'Earning', emoji: '💰' },
    { key: 'saving', label: 'Saving', emoji: '🐷' },
    { key: 'spending', label: 'Spending', emoji: '🛒' },
    { key: 'goal', label: 'Goals', emoji: '🎯' },
    { key: 'streak', label: 'Streaks', emoji: '🔥' },
    { key: 'level', label: 'Levels', emoji: '⭐' },
    { key: 'special', label: 'Special', emoji: '✨' }
  ];

  const completion = GamificationService.calculateBadgeCompletion(badges);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏆 Badge Collection</h2>
          {showProgress && (
            <p className="text-gray-600 mt-1">
              {completion.earned} of {completion.total} badges earned ({completion.percentage}%)
            </p>
          )}
        </div>
        
        {showProgress && (
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">{completion.percentage}%</div>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completion.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.key
                ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-200'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            {category.emoji} {category.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet!</h3>
          <p className="text-gray-600">Complete activities to earn your first badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBadges.map(badge => {
            const rarityColors = GamificationService.getBadgeRarityColor(badge.rarity);
            
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  badge.earned
                    ? `${rarityColors.bg} ${rarityColors.border}`
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                {/* Rarity indicator */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  badge.earned ? rarityColors.text : 'text-gray-500'
                }`}>
                  {badge.rarity}
                </div>

                {/* Badge icon */}
                <div className="text-center mb-3">
                  <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <h3 className={`font-semibold text-sm ${
                    badge.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                </div>

                {/* Badge description */}
                <p className={`text-xs text-center ${
                  badge.earned ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {badge.description}
                </p>

                {/* XP reward */}
                <div className={`mt-2 text-center text-xs font-medium ${
                  badge.earned ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  +{badge.xp_reward} XP
                </div>

                {/* Earned date */}
                {badge.earned && badge.earnedAt && (
                  <div className="mt-2 text-center text-xs text-gray-500">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}

                {/* Earned checkmark */}
                {badge.earned && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}