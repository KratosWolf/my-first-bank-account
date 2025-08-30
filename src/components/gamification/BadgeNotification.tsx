'use client';

import { useState, useEffect } from 'react';
import { GamificationService } from '@/lib/services/gamification';
import type { Badge } from '@/lib/supabase';

interface BadgeNotificationProps {
  badges: Badge[];
  onClose: () => void;
}

export default function BadgeNotification({ badges, onClose }: BadgeNotificationProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badges.length > 0) {
      setIsVisible(true);
      
      // Auto-advance through badges
      const timer = setTimeout(() => {
        if (currentBadgeIndex < badges.length - 1) {
          setCurrentBadgeIndex(currentBadgeIndex + 1);
        } else {
          // All badges shown, close notification
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation to complete
          }, 3000);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [badges, currentBadgeIndex, onClose]);

  if (badges.length === 0 || !isVisible) {
    return null;
  }

  const currentBadge = badges[currentBadgeIndex];
  const rarityColors = GamificationService.getBadgeRarityColor(currentBadge.rarity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`
        relative max-w-md mx-4 p-8 rounded-2xl shadow-2xl transform transition-all duration-500
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300
      `}>
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          ✕
        </button>

        {/* Badge earned animation */}
        <div className="text-center">
          {/* Celebration header */}
          <div className="mb-6">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-1">Badge Earned!</h2>
            <p className="text-yellow-100">Congratulations on your achievement!</p>
          </div>

          {/* Badge display */}
          <div className={`
            relative mx-auto w-32 h-32 rounded-2xl border-4 flex items-center justify-center mb-4
            ${rarityColors.bg} ${rarityColors.border}
            transform transition-transform duration-1000 animate-pulse
          `}>
            {/* Rarity indicator */}
            <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-white ${rarityColors.text}`}>
              {currentBadge.rarity.toUpperCase()}
            </div>

            {/* Badge icon */}
            <div className="text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>
              {currentBadge.icon}
            </div>

            {/* Sparkle effects */}
            <div className="absolute -top-2 -left-2 text-2xl animate-spin">✨</div>
            <div className="absolute -bottom-2 -right-2 text-2xl animate-spin" style={{ animationDelay: '1s' }}>⭐</div>
          </div>

          {/* Badge info */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{currentBadge.name}</h3>
            <p className="text-yellow-100 text-sm mb-3">{currentBadge.description}</p>
            
            {/* XP reward */}
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <span className="text-yellow-200">⚡</span>
              <span className="font-bold text-white">+{currentBadge.xp_reward} XP</span>
            </div>
          </div>

          {/* Progress indicator for multiple badges */}
          {badges.length > 1 && (
            <div className="mb-4">
              <div className="flex justify-center space-x-2">
                {badges.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentBadgeIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-yellow-100 mt-2">
                Badge {currentBadgeIndex + 1} of {badges.length}
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={() => {
              if (currentBadgeIndex < badges.length - 1) {
                setCurrentBadgeIndex(currentBadgeIndex + 1);
              } else {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }
            }}
            className="bg-white text-yellow-600 font-bold px-6 py-3 rounded-full hover:bg-yellow-50 transition-colors shadow-lg"
          >
            {currentBadgeIndex < badges.length - 1 ? 'Next Badge' : 'Awesome!'}
          </button>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-2xl animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎊', '🎉', '✨', '⭐', '🌟', '💫'][i]}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}