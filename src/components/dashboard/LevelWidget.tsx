'use client';

import { GamificationService } from '@/lib/services/gamification';
import type { Child } from '@/lib/supabase';

interface LevelWidgetProps {
  child: Child;
  compact?: boolean;
}

export default function LevelWidget({ child, compact = false }: LevelWidgetProps) {
  const levelInfo = GamificationService.getLevelInfo(child.xp);
  const progress = GamificationService.getXpToNextLevel(child.xp);
  const isMaxLevel = child.level >= 10;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">{child.avatar}</div>
            <div>
              <div className="font-bold text-sm">{child.name}</div>
              <div className="text-xs text-indigo-200">Level {child.level}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">{child.xp}</div>
            <div className="text-xs text-indigo-200">XP</div>
          </div>
        </div>
        
        {!isMaxLevel && (
          <div className="mt-2">
            <div className="bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-indigo-200 mt-1">
              {progress.needed} XP to level {child.level + 1}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
            <span className="text-xl">👑</span>
          </div>
          <h3 className="font-bold text-gray-900">Level Progress</h3>
        </div>
        <div className="text-3xl transform hover:scale-110 transition-transform duration-200">{child.avatar}</div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Level {child.level}
            </span>
            <div className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
              <span className="text-xs font-medium text-indigo-700">{child.xp} XP</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {levelInfo.title}
          </div>
        </div>
        
        {!isMaxLevel && (
          <>
            <div className="space-y-2">
              <div className="bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 shadow-lg animate-pulse"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 font-medium">
                <span className="text-indigo-600">{progress.needed} XP</span> needed for Level <span className="font-bold text-purple-600">{child.level + 1}</span>
              </div>
            </div>
          </>
        )}
        
        {isMaxLevel && (
          <div className="text-center py-3">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
              <span className="text-white font-bold text-sm animate-pulse">🌟 MAX LEVEL ACHIEVED! 🌟</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}