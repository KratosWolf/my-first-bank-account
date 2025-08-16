'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedAt?: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '64rem',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem'
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#86198f'
};

const subtitleStyle = {
  color: '#a21caf',
  fontSize: '0.875rem'
};

const cardStyle = {
  background: 'white',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  marginBottom: '1.5rem'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  background: 'white',
  color: '#374151',
  textDecoration: 'none',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const progressBarStyle = (percent: number) => ({
  width: '100%',
  height: '12px',
  background: '#e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden' as 'hidden'
});

const progressFillStyle = (percent: number, color: string = '#ea580c') => ({
  width: `${percent}%`,
  height: '100%',
  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
  borderRadius: '6px',
  transition: 'width 0.3s ease'
});

const badgeStyle = (color: string) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  background: color
});

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return '#6b7280';
    case 'rare': return '#2563eb';
    case 'epic': return '#a855f7';
    case 'legendary': return '#eab308';
    default: return '#6b7280';
  }
};

const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'rare': return 'Raro';
    case 'epic': return 'Épico';
    case 'legendary': return 'Lendário';
    default: return 'Comum';
  }
};

export default function ChildAchievementsPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPoints: 340,
    currentLevel: 4,
    pointsToNextLevel: 160,
    levelProgress: 68,
    earnedBadges: 8,
    totalBadges: 15
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // Mock data para demonstração
      const mockAchievements: Achievement[] = [
        {
          id: 1,
          name: 'Primeiro Poupador',
          description: 'Economizou pela primeira vez',
          icon: '💰',
          isEarned: true,
          earnedAt: '2024-08-01T00:00:00Z',
          category: 'Poupança',
          rarity: 'common'
        },
        {
          id: 2,
          name: 'Meta Cumprida',
          description: 'Completou seu primeiro objetivo',
          icon: '🎯',
          isEarned: true,
          earnedAt: '2024-08-05T00:00:00Z',
          category: 'Objetivos',
          rarity: 'rare'
        },
        {
          id: 3,
          name: 'Planejador Expert',
          description: 'Planejou gastos por 7 dias seguidos',
          icon: '📋',
          isEarned: true,
          earnedAt: '2024-08-10T00:00:00Z',
          category: 'Planejamento',
          rarity: 'epic'
        },
        {
          id: 4,
          name: 'Matemático Jr.',
          description: 'Resolveu 10 problemas de matemática financeira',
          icon: '🧮',
          isEarned: true,
          earnedAt: '2024-08-12T00:00:00Z',
          category: 'Aprendizado',
          rarity: 'rare'
        },
        {
          id: 5,
          name: 'Poupador de Elite',
          description: 'Economizou R$ 100 sem gastar',
          icon: '💎',
          isEarned: false,
          category: 'Poupança',
          rarity: 'legendary'
        },
        {
          id: 6,
          name: 'Sequência de Ouro',
          description: 'Usou o app por 30 dias seguidos',
          icon: '🔥',
          isEarned: false,
          category: 'Dedicação',
          rarity: 'epic'
        },
        {
          id: 7,
          name: 'Gastador Consciente',
          description: 'Ficou dentro do orçamento por 5 semanas',
          icon: '🎖️',
          isEarned: false,
          category: 'Gastos',
          rarity: 'rare'
        },
        {
          id: 8,
          name: 'Super Organizador',
          description: 'Categorizou 50 transações',
          icon: '📊',
          isEarned: false,
          category: 'Organização',
          rarity: 'common'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Fetch achievements error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const earnedAchievements = achievements.filter(a => a.isEarned);
  const lockedAchievements = achievements.filter(a => !a.isEarned);

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #ea580c', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#ea580c'}}>Carregando suas conquistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <button
            onClick={() => router.push(`/child/${childId}/dashboard`)}
            style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>🏆 Minhas Conquistas</h1>
            <p style={subtitleStyle}>Suas medalhas e progresso</p>
          </div>
        </div>

        {error && (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', color: '#dc2626'}}>
              <p>{error}</p>
              <button onClick={fetchAchievements} style={btnStyle}>
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
          <div style={{...cardStyle, border: '2px solid #fed7aa'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#9a3412', marginBottom: '1rem'}}>
              ⭐ Pontos Totais
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem'}}>
              {stats.totalPoints}
            </p>
            <p style={{fontSize: '0.875rem', color: '#c2410c'}}>Pontos acumulados</p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bfdbfe'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem'}}>
              🎖️ Nível Atual
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem'}}>
              {stats.currentLevel}
            </p>
            <div style={{marginBottom: '0.5rem'}}>
              <div style={progressBarStyle(stats.levelProgress)}>
                <div style={progressFillStyle(stats.levelProgress, '#2563eb')}></div>
              </div>
            </div>
            <p style={{fontSize: '0.75rem', color: '#1d4ed8'}}>
              {stats.pointsToNextLevel} pontos para o próximo nível
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bbf7d0'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#166534', marginBottom: '1rem'}}>
              🏅 Medalhas
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem'}}>
              {stats.earnedBadges}/{stats.totalBadges}
            </p>
            <p style={{fontSize: '0.875rem', color: '#15803d'}}>
              {Math.round((stats.earnedBadges / stats.totalBadges) * 100)}% conquistadas
            </p>
          </div>
        </div>

        {/* Earned Achievements */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem'}}>
            ✨ Conquistas Desbloqueadas ({earnedAchievements.length})
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            {earnedAchievements.map(achievement => (
              <div key={achievement.id} style={{
                ...cardStyle, 
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                  <div style={{
                    fontSize: '3rem',
                    width: '4rem',
                    height: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                  }}>
                    {achievement.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                      <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#166534'}}>
                        {achievement.name}
                      </h3>
                      <span style={{...badgeStyle(getRarityColor(achievement.rarity))}}>
                        {getRarityLabel(achievement.rarity)}
                      </span>
                    </div>
                    <p style={{fontSize: '0.875rem', color: '#15803d', marginBottom: '0.75rem'}}>
                      {achievement.description}
                    </p>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        {achievement.category}
                      </span>
                      <span style={{fontSize: '0.75rem', color: '#16a34a', fontWeight: '500'}}>
                        Conquistado em {formatDate(achievement.earnedAt!)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Achievements */}
        <div>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '1rem'}}>
            🔒 Conquistas Bloqueadas ({lockedAchievements.length})
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            {lockedAchievements.map(achievement => (
              <div key={achievement.id} style={{
                ...cardStyle, 
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                opacity: 0.7
              }}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                  <div style={{
                    fontSize: '3rem',
                    width: '4rem',
                    height: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    filter: 'grayscale(100%)'
                  }}>
                    {achievement.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                      <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#6b7280'}}>
                        {achievement.name}
                      </h3>
                      <span style={{...badgeStyle('#6b7280')}}>
                        {getRarityLabel(achievement.rarity)}
                      </span>
                    </div>
                    <p style={{fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem'}}>
                      {achievement.description}
                    </p>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>
                        {achievement.category}
                      </span>
                      <span style={{fontSize: '0.75rem', color: '#6b7280', fontWeight: '500'}}>
                        🔒 Bloqueado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}