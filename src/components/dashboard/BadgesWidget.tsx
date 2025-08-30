'use client';

import { useState, useEffect } from 'react';
import { GamificationService } from '@/lib/services/gamification';
import type { ChildBadge } from '@/lib/supabase';

interface BadgesWidgetProps {
  childId: string;
  compact?: boolean;
}

export default function BadgesWidget({ childId, compact = false }: BadgesWidgetProps) {
  const [badges, setBadges] = useState<ChildBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [childId]);

  const loadBadges = async () => {
    try {
      const childBadges = await GamificationService.getChildBadges(childId);
      setBadges(childBadges.slice(0, compact ? 3 : 5)); // Show 3-5 most recent badges
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-32 mb-4"></div>
          <div className="flex space-x-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-14 h-14 bg-gray-100 rounded-xl"></div>
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
          <h4 className="font-medium text-gray-900 text-sm">🏆 Recent Badges</h4>
          <span className="text-xs text-gray-500">{badges.length} earned</span>
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center py-3">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-gray-500">No badges yet</p>
          </div>
        ) : (
          <div className="flex space-x-1 overflow-x-auto">
            {badges.slice(0, 4).map(childBadge => {
              if (!childBadge.badge) return null;
              const rarityColors = GamificationService.getBadgeRarityColor(childBadge.badge.rarity);
              
              return (
                <div 
                  key={childBadge.id}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center ${rarityColors.bg} ${rarityColors.border}`}
                  title={childBadge.badge.name}
                >
                  <span className="text-lg">{childBadge.badge.icon}</span>
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
          <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg">
            <span className="text-xl">🏆</span>
          </div>
          <h3 className="font-bold text-gray-900">Recent Badges</h3>
        </div>
        <div className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
          <span className="text-xs font-semibold text-amber-700">{badges.length} earned</span>
        </div>
      </div>
      
      {badges.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">No badges yet!</h4>
          <p className="text-sm text-gray-600">Complete activities to earn your first badge</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/gamification-test'}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              View Challenges
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {badges.slice(0, 5).map(childBadge => {
            if (!childBadge.badge) return null;
            const rarityColors = GamificationService.getBadgeRarityColor(childBadge.badge.rarity);
            
            return (
              <div key={childBadge.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:shadow-md hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 border border-gray-200">
                <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 ${rarityColors.bg} ${rarityColors.border}`}>
                  <span className="text-2xl">{childBadge.badge.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{childBadge.badge.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${rarityColors.text} ${rarityColors.bg}`}>
                      {childBadge.badge.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{childBadge.badge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                        <span className="text-xs font-bold text-indigo-700">+{childBadge.badge.xp_reward} XP</span>
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(childBadge.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <button 
            onClick={() => window.location.href = '/gamification-test'}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 text-sm"
          >
            View All Badges →
          </button>
        </div>
      )}
    </div>
  );
}