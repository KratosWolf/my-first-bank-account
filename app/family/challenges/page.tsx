'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'saving' | 'spending' | 'learning' | 'teamwork';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  points: number;
  familyPoints: number;
  duration: number; // days
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  participants: Array<{
    childId: number;
    childName: string;
    contribution: number;
    isCompleted: boolean;
  }>;
  rewards: {
    individual: string;
    family: string;
    bonus?: string;
  };
}

interface ChallengesData {
  currentWeek: {
    weekNumber: number;
    theme: string;
    challenges: Challenge[];
  };
  familyStats: {
    totalChallenges: number;
    completedChallenges: number;
    weeklyStreak: number;
    familyRank: string;
    totalPoints: number;
  };
  upcomingChallenges: Challenge[];
  completedChallenges: Challenge[];
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '80rem',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap' as 'wrap',
  gap: '1rem'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#86198f',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#a21caf',
  fontSize: '1rem'
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
  display: 'inline-block'
};

const primaryBtnStyle = {
  ...btnStyle,
  background: '#a855f7',
  color: 'white',
  border: '1px solid #a855f7'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const progressBarStyle = (percent: number) => ({
  width: '100%',
  height: '8px',
  background: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden' as 'hidden',
  position: 'relative' as 'relative'
});

const progressFillStyle = (percent: number) => ({
  width: `${percent}%`,
  height: '100%',
  background: 'linear-gradient(90deg, #a855f7, #c084fc)',
  borderRadius: '4px',
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

export default function FamilyChallengesPage() {
  const router = useRouter();
  const [challengesData, setChallengesData] = useState<ChallengesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // Simulando dados de desafios familiares
      const mockData: ChallengesData = {
        currentWeek: {
          weekNumber: 12,
          theme: 'Economia em Família',
          challenges: [
            {
              id: 1,
              title: 'Desafio da Poupança Semanal',
              description: 'Cada criança deve economizar pelo menos R$ 5,00 esta semana sem gastar desnecessariamente.',
              type: 'saving',
              difficulty: 'easy',
              icon: '💰',
              points: 50,
              familyPoints: 100,
              duration: 7,
              startDate: '2024-08-12',
              endDate: '2024-08-19',
              isActive: true,
              isCompleted: false,
              progress: {
                current: 3.50,
                target: 5.00,
                percentage: 70
              },
              participants: [
                {
                  childId: 1,
                  childName: 'Demo Child',
                  contribution: 70,
                  isCompleted: false
                }
              ],
              rewards: {
                individual: 'R$ 2,00 de bônus',
                family: 'Pizza em família no fim de semana',
                bonus: 'Escolher o próximo filme da família'
              }
            },
            {
              id: 2,
              title: 'Missão Matemática Financeira',
              description: 'Resolver 3 problemas matemáticos sobre dinheiro e porcentagens durante a semana.',
              type: 'learning',
              difficulty: 'medium',
              icon: '📊',
              points: 75,
              familyPoints: 150,
              duration: 7,
              startDate: '2024-08-12',
              endDate: '2024-08-19',
              isActive: true,
              isCompleted: false,
              progress: {
                current: 2,
                target: 3,
                percentage: 67
              },
              participants: [
                {
                  childId: 1,
                  childName: 'Demo Child',
                  contribution: 67,
                  isCompleted: false
                }
              ],
              rewards: {
                individual: 'Certificado de Matemático Jr.',
                family: 'Jogo de tabuleiro novo para a família'
              }
            }
          ]
        },
        familyStats: {
          totalChallenges: 15,
          completedChallenges: 8,
          weeklyStreak: 3,
          familyRank: 'Ouro',
          totalPoints: 1250
        },
        upcomingChallenges: [],
        completedChallenges: [
          {
            id: 3,
            title: 'Desafio do Planejamento',
            description: 'Planejar gastos da semana e não ultrapassar o orçamento.',
            type: 'spending',
            difficulty: 'medium',
            icon: '📋',
            points: 60,
            familyPoints: 120,
            duration: 7,
            startDate: '2024-08-05',
            endDate: '2024-08-12',
            isActive: false,
            isCompleted: true,
            progress: {
              current: 1,
              target: 1,
              percentage: 100
            },
            participants: [
              {
                childId: 1,
                childName: 'Demo Child',
                contribution: 100,
                isCompleted: true
              }
            ],
            rewards: {
              individual: 'R$ 3,00 de bônus',
              family: 'Passeio no parque'
            }
          }
        ]
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChallengesData(mockData);
    } catch (error) {
      console.error('Challenges fetch error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'saving': return '#16a34a';
      case 'spending': return '#2563eb';
      case 'learning': return '#a855f7';
      case 'teamwork': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'saving': return 'Poupança';
      case 'spending': return 'Gastos';
      case 'learning': return 'Aprendizado';
      case 'teamwork': return 'Trabalho em Equipe';
      default: return 'Geral';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#16a34a';
      case 'medium': return '#eab308';
      case 'hard': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirado';
    if (diffDays === 0) return 'Termina hoje';
    if (diffDays === 1) return '1 dia restante';
    return `${diffDays} dias restantes`;
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #a855f7', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#86198f'}}>Carregando desafios familiares...</p>
        </div>
      </div>
    );
  }

  if (error || !challengesData) {
    return (
      <div style={loadingStyle}>
        <div style={cardStyle}>
          <p style={{color: '#dc2626', marginBottom: '1rem', textAlign: 'center'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchChallenges} style={primaryBtnStyle}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Link href="/parent/dashboard" style={{...btnStyle, marginRight: '1rem'}}>
              ← Voltar
            </Link>
            <div>
              <h1 style={titleStyle}>🏅 Desafios Familiares</h1>
              <p style={subtitleStyle}>
                Semana {challengesData.currentWeek.weekNumber} - {challengesData.currentWeek.theme}
              </p>
            </div>
          </div>
        </div>

        {/* Family Stats */}
        <div style={gridStyle}>
          <div style={{...cardStyle, border: '2px solid #e9d5ff'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              🏆 Pontos Familiares
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem'}}>
              {challengesData.familyStats.totalPoints}
            </p>
            <p style={{fontSize: '0.875rem', color: '#a21caf'}}>Total acumulado</p>
          </div>

          <div style={{...cardStyle, border: '2px solid #fed7aa'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#9a3412', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              🔥 Sequência
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem'}}>
              {challengesData.familyStats.weeklyStreak}
            </p>
            <p style={{fontSize: '0.875rem', color: '#c2410c'}}>Semanas seguidas</p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bbf7d0'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              ✅ Concluídos
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem'}}>
              {challengesData.familyStats.completedChallenges}
            </p>
            <p style={{fontSize: '0.875rem', color: '#15803d'}}>
              de {challengesData.familyStats.totalChallenges}
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bfdbfe'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              👑 Ranking
            </h3>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem'}}>
              {challengesData.familyStats.familyRank}
            </p>
            <p style={{fontSize: '0.875rem', color: '#1d4ed8'}}>Seu nível</p>
          </div>
        </div>

        {/* Current Week Challenges */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', marginBottom: '1rem'}}>
            ⭐ Desafios Ativos da Semana
          </h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {challengesData.currentWeek.challenges.map(challenge => (
              <div key={challenge.id} style={{...cardStyle, border: '2px solid #e9d5ff', transition: 'box-shadow 0.3s ease'}}>
                {/* Challenge Header */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <span style={{fontSize: '2.5rem'}}>{challenge.icon}</span>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap'}}>
                        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f'}}>
                          {challenge.title}
                        </h3>
                        <span style={{...badgeStyle(getTypeColor(challenge.type))}}>
                          {getTypeLabel(challenge.type)}
                        </span>
                        <span style={{...badgeStyle(getDifficultyColor(challenge.difficulty))}}>
                          {getDifficultyLabel(challenge.difficulty)}
                        </span>
                      </div>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{challenge.description}</p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                      <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7'}}>
                        {challenge.points}
                      </span>
                      <span style={{fontSize: '0.75rem', color: '#a21caf'}}>pts individuais</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ea580c'}}>
                        {challenge.familyPoints}
                      </span>
                      <span style={{fontSize: '0.75rem', color: '#c2410c'}}>pts familiares</span>
                    </div>
                  </div>
                </div>
                {/* Challenge Progress */}
                <div style={{marginBottom: '1rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '0.875rem', fontWeight: '500'}}>Progresso do Desafio</span>
                    <span style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#a855f7'}}>
                      {challenge.progress.percentage}%
                    </span>
                  </div>
                  <div style={progressBarStyle(challenge.progress.percentage)}>
                    <div style={progressFillStyle(challenge.progress.percentage)}></div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem'}}>
                    <span>{challenge.progress.current} / {challenge.progress.target}</span>
                    <span>{calculateTimeLeft(challenge.endDate)}</span>
                  </div>
                </div>

                {/* Participants Progress */}
                <div style={{marginBottom: '1rem'}}>
                  <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem'}}>
                    Participação das Crianças:
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem'}}>
                    {challenge.participants.map(participant => (
                      <div 
                        key={participant.childId} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: '2px solid',
                          borderColor: participant.isCompleted ? '#bbf7d0' : '#e5e7eb',
                          background: participant.isCompleted ? '#f0fdf4' : '#f9fafb'
                        }}
                      >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            {participant.childName[0]}
                          </div>
                          <span style={{fontWeight: '500', fontSize: '0.875rem'}}>{participant.childName}</span>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          {participant.isCompleted ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                              <span style={{color: '#16a34a', fontSize: '1.25rem'}}>✅</span>
                              <span style={{fontSize: '0.75rem', color: '#15803d', fontWeight: '500'}}>Completo</span>
                            </div>
                          ) : (
                            <div>
                              <p style={{fontWeight: 'bold', color: '#a855f7', fontSize: '0.875rem'}}>
                                {participant.contribution}%
                              </p>
                              <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Progresso</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewards */}
                <div style={{background: '#fefce8', border: '1px solid #fde047', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem'}}>
                  <h4 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#a16207', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    🎁 Recompensas
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.75rem'}}>
                    <div>
                      <span style={{fontWeight: '500', color: '#a16207'}}>Individual:</span>
                      <span style={{marginLeft: '0.25rem', color: '#ca8a04'}}>{challenge.rewards.individual}</span>
                    </div>
                    <div>
                      <span style={{fontWeight: '500', color: '#a16207'}}>Familiar:</span>
                      <span style={{marginLeft: '0.25rem', color: '#ca8a04'}}>{challenge.rewards.family}</span>
                    </div>
                    {challenge.rewards.bonus && (
                      <div style={{gridColumn: '1 / -1'}}>
                        <span style={{fontWeight: '500', color: '#a16207'}}>Bônus:</span>
                        <span style={{marginLeft: '0.25rem', color: '#ca8a04'}}>{challenge.rewards.bonus}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Challenge Status */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </div>
                  {challenge.isCompleted ? (
                    <span style={{...badgeStyle('#16a34a')}}>
                      ✅ Concluído!
                    </span>
                  ) : challenge.isActive ? (
                    <span style={{...badgeStyle('#2563eb')}}>
                      🔄 Em Progresso
                    </span>
                  ) : (
                    <span style={{...badgeStyle('#6b7280')}}>
                      ⏳ Em Breve
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Challenges Preview */}
        {challengesData.completedChallenges.length > 0 && (
          <div>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#15803d', marginBottom: '1rem'}}>
              🏆 Últimos Desafios Concluídos
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
              {challengesData.completedChallenges.slice(0, 6).map(challenge => (
                <div key={challenge.id} style={{...cardStyle, background: '#f0fdf4', border: '2px solid #bbf7d0'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{fontSize: '1.5rem'}}>{challenge.icon}</span>
                      <div>
                        <h3 style={{fontWeight: '600', color: '#166534', fontSize: '0.875rem'}}>{challenge.title}</h3>
                        <p style={{fontSize: '0.75rem', color: '#16a34a'}}>
                          {challenge.points} pts + {challenge.familyPoints} pts família
                        </p>
                      </div>
                    </div>
                    <span style={{...badgeStyle('#16a34a'), fontSize: '0.75rem'}}>
                      100%
                    </span>
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#16a34a'}}>
                    {challenge.participants.filter(p => p.isCompleted).length} de {challenge.participants.length} crianças participaram
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}