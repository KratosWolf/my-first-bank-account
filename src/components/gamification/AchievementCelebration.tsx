'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  type: 'badge' | 'level' | 'streak';
  title: string;
  description: string;
  icon: string;
  xp_reward?: number;
  level?: number;
  streak_count?: number;
}

interface AchievementCelebrationProps {
  achievements: Achievement[];
  childName: string;
  onComplete: () => void;
}

export default function AchievementCelebration({ 
  achievements, 
  childName, 
  onComplete 
}: AchievementCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
    }
  }, [achievements]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  if (!isVisible || achievements.length === 0) return null;

  const achievement = achievements[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-lg w-full">
        {/* Main celebration card */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl shadow-2xl p-8 text-center transform animate-pulse">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <span className="text-6xl animate-bounce">{achievement.icon}</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Parabéns, {childName}!
            </div>

            <div className="text-xl font-bold text-purple-600 mb-3">
              {achievement.title}
            </div>

            <p className="text-gray-700 mb-4">
              {achievement.description}
            </p>

            {/* Achievement specific details */}
            {achievement.type === 'level' && achievement.level && (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                  Nível {achievement.level}
                </div>
                {achievement.xp_reward && (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold">
                    +{achievement.xp_reward} XP
                  </div>
                )}
              </div>
            )}

            {achievement.type === 'streak' && achievement.streak_count && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl">🔥</span>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                  {achievement.streak_count} dias seguidos!
                </div>
              </div>
            )}

            {achievement.type === 'badge' && achievement.xp_reward && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold inline-block">
                +{achievement.xp_reward} XP Bônus
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white/80 text-sm">
              {currentIndex + 1} de {achievements.length}
            </div>
            
            <button
              onClick={handleNext}
              className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {currentIndex < achievements.length - 1 ? 'Próxima' : 'Continuar'} ✨
            </button>
          </div>
        </div>

        {/* Floating celebration elements */}
        <div className="absolute -top-4 -left-4 text-4xl animate-spin">🌟</div>
        <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🎊</div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse">🏆</div>
        <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce delay-300">🎉</div>
      </div>
    </div>
  );
}

// Example usage component for testing
export function TestAchievementCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);

  const mockAchievements: Achievement[] = [
    {
      type: 'badge',
      title: 'Primeira Tarefa',
      description: 'Você completou sua primeira tarefa! Continue assim!',
      icon: '🌟',
      xp_reward: 25
    },
    {
      type: 'streak',
      title: 'Trabalhador Consistente',
      description: 'Você completou tarefas por 7 dias seguidos!',
      icon: '🔥',
      streak_count: 7,
      xp_reward: 50
    },
    {
      type: 'level',
      title: 'Subiu de Nível!',
      description: 'Parabéns! Você alcançou o nível 3!',
      icon: '⭐',
      level: 3,
      xp_reward: 100
    }
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => setShowCelebration(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg"
      >
        🎉 Testar Celebração
      </button>

      {showCelebration && (
        <AchievementCelebration
          achievements={mockAchievements}
          childName="João"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}