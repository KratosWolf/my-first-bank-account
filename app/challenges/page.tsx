'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

const sectionStyle = {
  marginBottom: '3rem'
};

const sectionTitleStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#374151',
  marginBottom: '1.5rem',
  textAlign: 'center' as 'center'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '1.5rem'
};

const challengeCardStyle = (isActive: boolean, isCompleted: boolean) => ({
  backgroundColor: isCompleted ? '#f0fdf4' : isActive ? '#fefce8' : 'white',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: `2px solid ${isCompleted ? '#22c55e' : isActive ? '#eab308' : '#e5e7eb'}`,
  position: 'relative' as 'relative'
});

const challengeHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1rem'
};

const challengeIconStyle = {
  fontSize: '2.5rem'
};

const challengeTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const challengeDescStyle = {
  color: '#6b7280',
  marginBottom: '1.5rem',
  lineHeight: '1.5'
};

const progressBarStyle = {
  width: '100%',
  height: '0.75rem',
  backgroundColor: '#e5e7eb',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  marginBottom: '1rem'
};

const progressFillStyle = (percentage: number, isCompleted: boolean) => ({
  width: `${percentage}%`,
  height: '100%',
  backgroundColor: isCompleted ? '#22c55e' : '#3b82f6',
  borderRadius: '0.5rem',
  transition: 'width 0.3s ease'
});

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const statStyle = {
  textAlign: 'center' as 'center',
  padding: '0.75rem',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderRadius: '0.5rem'
};

const statValueStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#3b82f6'
};

const statLabelStyle = {
  fontSize: '0.75rem',
  color: '#6b7280',
  textTransform: 'uppercase' as 'uppercase'
};

const participantsStyle = {
  marginBottom: '1.5rem'
};

const participantStyle = (isCompleted: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem',
  backgroundColor: isCompleted ? '#dcfce7' : '#f3f4f6',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem'
});

const rewardsStyle = {
  backgroundColor: '#fef3c7',
  padding: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #fbbf24'
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

const actionBtnStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#10b981',
  color: 'white',
  borderRadius: '0.25rem',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600'
};

interface ChallengeData {
  currentWeek: {
    weekNumber: number;
    theme: string;
    challenges: any[];
  };
  familyStats: {
    totalChallenges: number;
    completedChallenges: number;
    weeklyStreak: number;
    familyRank: string;
    totalPoints: number;
  };
  upcomingChallenges: any[];
  completedChallenges: any[];
}

export default function Challenges() {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await fetch('/api/family/challenges');
        if (response.ok) {
          const data = await response.json();
          setChallengeData(data);
        } else {
          console.error('Failed to load challenges');
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const updateChallengeProgress = async (challengeId: number, action: string, childId?: string) => {
    try {
      const response = await fetch('/api/family/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId,
          action,
          childId
        })
      });

      if (response.ok) {
        // Reload challenges data
        const updatedResponse = await fetch('/api/family/challenges');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setChallengeData(updatedData);
        }
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮</div>
          <p>Carregando desafios familiares...</p>
        </div>
      </div>
    );
  }

  if (!challengeData) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Erro ao carregar desafios.</p>
          <Link href="/" style={btnStyle}>Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  const renderChallenge = (challenge: any, showActions = true) => (
    <div key={challenge.id} style={challengeCardStyle(challenge.isActive, challenge.isCompleted)}>
      <div style={challengeHeaderStyle}>
        <div>
          <span style={challengeIconStyle}>{challenge.icon}</span>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: challenge.isCompleted ? '#dcfce7' : challenge.isActive ? '#fef3c7' : '#f3f4f6',
          color: challenge.isCompleted ? '#15803d' : challenge.isActive ? '#92400e' : '#6b7280'
        }}>
          {challenge.isCompleted ? 'CONCLUÍDO' : challenge.isActive ? 'ATIVO' : 'FUTURO'}
        </div>
      </div>
      
      <h3 style={challengeTitleStyle}>{challenge.title}</h3>
      <p style={challengeDescStyle}>{challenge.description}</p>
      
      <div style={progressBarStyle}>
        <div style={progressFillStyle(challenge.progress.percentage, challenge.isCompleted)}></div>
      </div>
      
      <div style={statsStyle}>
        <div style={statStyle}>
          <div style={statValueStyle}>{challenge.progress.current}/{challenge.progress.target}</div>
          <div style={statLabelStyle}>Progresso</div>
        </div>
        <div style={statStyle}>
          <div style={statValueStyle}>{challenge.familyPoints}</div>
          <div style={statLabelStyle}>Pontos</div>
        </div>
      </div>
      
      <div style={participantsStyle}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
          Participantes da Família
        </h4>
        {challenge.participants.map((participant: any) => (
          <div key={participant.childId} style={participantStyle(participant.isCompleted)}>
            <div>
              <span style={{ fontWeight: '500' }}>{participant.childName}</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                {participant.contribution}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {participant.isCompleted ? (
                <span style={{ color: '#10b981', fontWeight: '600' }}>✅</span>
              ) : (
                showActions && challenge.isActive && (
                  <button
                    style={actionBtnStyle}
                    onClick={() => updateChallengeProgress(challenge.id, 'complete_child', participant.childId)}
                  >
                    Marcar como Concluído
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div style={rewardsStyle}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#92400e' }}>
          🎁 Recompensas
        </h4>
        <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
          <div>Individual: {challenge.rewards.individual}</div>
          <div>Família: {challenge.rewards.family}</div>
          {challenge.rewards.bonus && <div>Bônus: {challenge.rewards.bonus}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🎮 Desafios Familiares</h1>
        <p style={subtitleStyle}>
          {challengeData.currentWeek.theme} - Semana {challengeData.currentWeek.weekNumber}
        </p>
      </div>

      {/* Family Stats */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '2px solid #3b82f6',
        marginBottom: '3rem'
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '600', color: '#3b82f6', marginBottom: '1.5rem' }}>
          🏆 Estatísticas da Família
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={statStyle}>
            <div style={statValueStyle}>{challengeData.familyStats.completedChallenges}</div>
            <div style={statLabelStyle}>Desafios Concluídos</div>
          </div>
          <div style={statStyle}>
            <div style={statValueStyle}>{challengeData.familyStats.weeklyStreak}</div>
            <div style={statLabelStyle}>Semanas Seguidas</div>
          </div>
          <div style={statStyle}>
            <div style={statValueStyle}>{challengeData.familyStats.totalPoints}</div>
            <div style={statLabelStyle}>Pontos Totais</div>
          </div>
          <div style={statStyle}>
            <div style={statValueStyle}>{challengeData.familyStats.familyRank}</div>
            <div style={statLabelStyle}>Ranking</div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>🔥 Desafios Desta Semana</h2>
        <div style={gridStyle}>
          {challengeData.currentWeek.challenges.map(challenge => renderChallenge(challenge, true))}
        </div>
      </div>

      {/* Completed Challenges */}
      {challengeData.completedChallenges.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>✅ Desafios Conquistados</h2>
          <div style={gridStyle}>
            {challengeData.completedChallenges.slice(0, 4).map(challenge => renderChallenge(challenge, false))}
          </div>
        </div>
      )}

      {/* Upcoming Challenges */}
      {challengeData.upcomingChallenges.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🔮 Próximos Desafios</h2>
          <div style={gridStyle}>
            {challengeData.upcomingChallenges.slice(0, 3).map(challenge => renderChallenge(challenge, false))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/" style={btnStyle}>🏠 Voltar ao Início</Link>
        <Link href="/analytics" style={btnStyle}>📊 Ver Relatórios</Link>
        <Link href="/gamification" style={btnStyle}>🏆 Ver Conquistas</Link>
      </div>
    </div>
  );
}