'use client';

import { GamificationService, LEVEL_SYSTEM } from '@/lib/services/gamification';
import type { Child } from '@/lib/supabase';

interface LevelProgressProps {
  child: Child;
  showDetails?: boolean;
}

export default function LevelProgress({ child, showDetails = true }: LevelProgressProps) {
  const levelInfo = GamificationService.getLevelInfo(child.xp);
  const progress = GamificationService.getXpToNextLevel(child.xp);
  const isMaxLevel = child.level >= LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1].level;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{child.avatar}</div>
          <div>
            <h2 className="text-xl font-bold">{child.name}</h2>
            <p className="text-indigo-200">Level {child.level}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{child.xp.toLocaleString()}</div>
          <div className="text-sm text-indigo-200">Total XP</div>
        </div>
      </div>

      {/* Level Title & Badge */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👑</span>
            <span className="font-semibold text-lg">{levelInfo.title}</span>
          </div>
          
          {levelInfo.badge_reward && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              🏆 Badge Level
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress to Level {child.level + 1}</span>
            <span>{progress.percentage}%</span>
          </div>
          
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress.percentage}%` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-yellow-300 to-yellow-100 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-2 text-indigo-200">
            <span>Current XP: {child.xp}</span>
            <span>Need: {progress.needed} more</span>
          </div>
        </div>
      )}

      {isMaxLevel && (
        <div className="mb-4 text-center">
          <div className="bg-yellow-400 text-yellow-900 rounded-full px-4 py-2 font-bold">
            🌟 MAX LEVEL REACHED! 🌟
          </div>
        </div>
      )}

      {/* Benefits */}
      {showDetails && levelInfo.benefits.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-indigo-100">Current Benefits:</h4>
          <div className="space-y-1">
            {levelInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-indigo-100">
                <span className="text-green-300 mr-2">✓</span>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Level Preview */}
      {showDetails && !isMaxLevel && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="font-semibold mb-2 text-indigo-100">Next Level Benefits:</h4>
          {LEVEL_SYSTEM[child.level] && (
            <div>
              <div className="text-sm font-medium text-white mb-1">
                👑 {LEVEL_SYSTEM[child.level].title}
              </div>
              <div className="space-y-1">
                {LEVEL_SYSTEM[child.level].benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-indigo-200">
                    <span className="text-yellow-300 mr-2">🔒</span>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}