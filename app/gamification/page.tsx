'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HybridStorage } from '@/lib/storage/hybrid-storage';

const containerStyle = {
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '2rem 1rem',
  backgroundColor: '#f8fafc'
};

const headerStyle = {
  textAlign: 'center' as 'center',
  marginBottom: '3rem'
};

const titleStyle = {
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '1rem'
};

const subtitleStyle = {
  fontSize: '1.25rem',
  color: '#6b7280',
  marginBottom: '2rem'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginBottom: '3rem'
};

const badgeCardStyle = (isEarned: boolean) => ({
  backgroundColor: isEarned ? '#f0fdf4' : '#f9fafb',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: `2px solid ${isEarned ? '#22c55e' : '#e5e7eb'}`,
  textAlign: 'center' as 'center',
  opacity: isEarned ? 1 : 0.6,
  transform: isEarned ? 'scale(1.02)' : 'scale(1)',
  transition: 'all 0.3s ease'
});

const badgeIconStyle = (isEarned: boolean) => ({
  fontSize: '4rem',
  marginBottom: '1rem',
  filter: isEarned ? 'none' : 'grayscale(100%)'
});

const badgeTitleStyle = (isEarned: boolean) => ({
  fontSize: '1.5rem',
  fontWeight: '600',
  color: isEarned ? '#15803d' : '#6b7280',
  marginBottom: '0.5rem'
});

const badgeDescStyle = {
  fontSize: '0.875rem',
  color: '#6b7280',
  marginBottom: '1rem'
};

const progressStyle = {
  backgroundColor: '#e5e7eb',
  borderRadius: '0.5rem',
  height: '0.5rem',
  overflow: 'hidden',
  marginBottom: '0.5rem'
};

const progressFillStyle = (percentage: number) => ({
  width: `${Math.min(percentage, 100)}%`,
  height: '100%',
  backgroundColor: '#22c55e',
  borderRadius: '0.5rem',
  transition: 'width 0.3s ease'
});

const levelCardStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '2px solid #3b82f6',
  textAlign: 'center' as 'center'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  marginRight: '1rem',
  border: 'none',
  cursor: 'pointer'
};

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  currentProgress: number;
  isEarned: boolean;
  earnedDate?: string;
}

interface GamificationData {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  badges: Badge[];
  achievements: any[];
  weeklyProgress: {
    goalsCompleted: number;
    totalGoals: number;
  };
}

export default function Gamification() {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGamificationData = async () => {
      try {
        const family = await HybridStorage.getOrCreateFamily();
        const transactions = await HybridStorage.getTransactions();
        
        // Calculate user statistics
        const totalSavings = family.children.reduce((sum: number, child: any) => sum + child.balance, 0);
        const totalTransactions = transactions.length;
        const savingTransactions = transactions.filter(t => t.amount > 0).length;
        const spendingTransactions = transactions.filter(t => t.amount < 0).length;
        
        // Calculate level and points
        const totalPoints = Math.floor(totalSavings * 2) + (totalTransactions * 10);
        const level = Math.floor(totalPoints / 100) + 1;
        const pointsToNextLevel = ((level * 100) - totalPoints);
        
        // Define badges with dynamic progress
        const badges: Badge[] = [
          {
            id: 'first_saving',
            title: 'Primeiro Poupador',
            description: 'Faça sua primeira transação de poupança',
            icon: '🥇',
            category: 'Iniciante',
            requirement: 1,
            currentProgress: savingTransactions,
            isEarned: savingTransactions >= 1,
            earnedDate: savingTransactions >= 1 ? new Date().toISOString() : undefined
          },
          {
            id: 'saver_bronze',
            title: 'Poupador Bronze',
            description: 'Alcance R$ 50 em economia',
            icon: '🥉',
            category: 'Poupança',
            requirement: 50,
            currentProgress: Math.floor(totalSavings),
            isEarned: totalSavings >= 50
          },
          {
            id: 'saver_silver',
            title: 'Poupador Prata',
            description: 'Alcance R$ 100 em economia',
            icon: '🥈',
            category: 'Poupança',
            requirement: 100,
            currentProgress: Math.floor(totalSavings),
            isEarned: totalSavings >= 100
          },
          {
            id: 'saver_gold',
            title: 'Poupador Ouro',
            description: 'Alcance R$ 200 em economia',
            icon: '🥇',
            category: 'Poupança',
            requirement: 200,
            currentProgress: Math.floor(totalSavings),
            isEarned: totalSavings >= 200
          },
          {
            id: 'transaction_master',
            title: 'Mestre das Transações',
            description: 'Complete 20 transações',
            icon: '📊',
            category: 'Atividade',
            requirement: 20,
            currentProgress: totalTransactions,
            isEarned: totalTransactions >= 20
          },
          {
            id: 'smart_spender',
            title: 'Gastador Inteligente',
            description: 'Faça 10 compras conscientes',
            icon: '🧠',
            category: 'Educação',
            requirement: 10,
            currentProgress: spendingTransactions,
            isEarned: spendingTransactions >= 10
          },
          {
            id: 'goal_setter',
            title: 'Definidor de Metas',
            description: 'Crie sua primeira meta de poupança',
            icon: '🎯',
            category: 'Planejamento',
            requirement: 1,
            currentProgress: totalSavings > 0 ? 1 : 0,
            isEarned: totalSavings > 0
          },
          {
            id: 'consistency_king',
            title: 'Rei da Consistência',
            description: 'Use o app por 7 dias seguidos',
            icon: '👑',
            category: 'Dedicação',
            requirement: 7,
            currentProgress: Math.min(7, totalTransactions), // Simplified calculation
            isEarned: totalTransactions >= 7
          },
          {
            id: 'family_helper',
            title: 'Ajudante da Família',
            description: 'Participe de 3 desafios familiares',
            icon: '👨‍👩‍👧‍👦',
            category: 'Família',
            requirement: 3,
            currentProgress: Math.min(3, Math.floor(totalTransactions / 5)),
            isEarned: totalTransactions >= 15
          },
          {
            id: 'money_master',
            title: 'Mestre do Dinheiro',
            description: 'Alcance R$ 500 em economia total',
            icon: '💰',
            category: 'Expert',
            requirement: 500,
            currentProgress: Math.floor(totalSavings),
            isEarned: totalSavings >= 500
          }
        ];

        const data: GamificationData = {
          level,
          totalPoints,
          pointsToNextLevel,
          badges,
          achievements: [],
          weeklyProgress: {
            goalsCompleted: badges.filter(b => b.isEarned).length,
            totalGoals: badges.length
          }
        };

        setGamificationData(data);
      } catch (error) {
        console.error('Error loading gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, []);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
          <p>Carregando suas conquistas...</p>
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Erro ao carregar dados de gamificação.</p>
          <Link href="/" style={btnStyle}>Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  const earnedBadges = gamificationData.badges.filter(b => b.isEarned);
  const availableBadges = gamificationData.badges.filter(b => !b.isEarned);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🏆 Conquistas & Badges</h1>
        <p style={subtitleStyle}>
          Acompanhe seu progresso e desbloqueie recompensas incríveis!
        </p>
      </div>

      {/* Level and Progress */}
      <div style={levelCardStyle}>
        <h2 style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '1rem' }}>
          Nível {gamificationData.level} - Poupador {gamificationData.level <= 3 ? 'Iniciante' : gamificationData.level <= 7 ? 'Intermediário' : 'Avançado'}
        </h2>
        <div style={progressStyle}>
          <div style={progressFillStyle(((gamificationData.totalPoints % 100) / 100) * 100)}></div>
        </div>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          {gamificationData.totalPoints} pontos • Faltam {gamificationData.pointsToNextLevel} para o próximo nível
        </p>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Badges conquistados: {earnedBadges.length}/{gamificationData.badges.length}
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d', margin: '3rem 0 2rem', textAlign: 'center' }}>
            🎉 Badges Conquistados
          </h2>
          <div style={gridStyle}>
            {earnedBadges.map((badge) => (
              <div key={badge.id} style={badgeCardStyle(true)}>
                <div style={badgeIconStyle(true)}>{badge.icon}</div>
                <h3 style={badgeTitleStyle(true)}>{badge.title}</h3>
                <p style={badgeDescStyle}>{badge.description}</p>
                <div style={{ 
                  backgroundColor: '#dcfce7', 
                  padding: '0.5rem', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#15803d'
                }}>
                  ✅ CONQUISTADO!
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Available Badges */}
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#374151', margin: '3rem 0 2rem', textAlign: 'center' }}>
        🎯 Próximas Conquistas
      </h2>
      <div style={gridStyle}>
        {availableBadges.map((badge) => {
          const progressPercentage = (badge.currentProgress / badge.requirement) * 100;
          
          return (
            <div key={badge.id} style={badgeCardStyle(false)}>
              <div style={badgeIconStyle(false)}>{badge.icon}</div>
              <h3 style={badgeTitleStyle(false)}>{badge.title}</h3>
              <p style={badgeDescStyle}>{badge.description}</p>
              
              <div style={progressStyle}>
                <div style={progressFillStyle(progressPercentage)}></div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                {badge.currentProgress}/{badge.requirement} • {Math.round(progressPercentage)}%
              </div>
              
              <div style={{ 
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                color: '#374151'
              }}>
                {badge.category}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/" style={btnStyle}>🏠 Voltar ao Início</Link>
        <Link href="/analytics" style={btnStyle}>📊 Ver Relatórios</Link>
        <Link href="/challenges" style={btnStyle}>🎮 Desafios Familiares</Link>
      </div>
    </div>
  );
}