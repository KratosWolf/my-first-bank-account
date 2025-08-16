'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  icon: string;
  isCompleted: boolean;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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
  flexDirection: 'column' as 'column',
  gap: '1rem',
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

const primaryBtnStyle = {
  ...btnStyle,
  background: '#a855f7',
  color: 'white',
  border: '1px solid #a855f7'
};

const dangerBtnStyle = {
  ...btnStyle,
  color: '#dc2626',
  borderColor: '#dc2626',
  background: '#fef2f2'
};

const badgeStyle = (color: string) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  background: color
});

const progressBarStyle = (percent: number) => ({
  width: '100%',
  height: '16px',
  background: '#e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden' as 'hidden'
});

const progressFillStyle = (percent: number, color: string = '#a855f7') => ({
  width: `${percent}%`,
  height: '100%',
  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
  borderRadius: '8px',
  transition: 'width 0.3s ease'
});

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function ChildGoalsPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      // Load custom goals from localStorage
      const savedGoals = JSON.parse(localStorage.getItem(`child-${childId}-goals`) || '[]');
      
      // Mock data para demonstração - as crianças criam suas próprias metas
      const mockGoals: Goal[] = [
        {
          id: 1,
          name: 'Nintendo Switch',
          description: 'Quero comprar um Nintendo Switch para jogar com meus amigos!',
          targetAmount: 300,
          currentAmount: 125,
          category: 'Eletrônicos',
          icon: '🎮',
          isCompleted: false,
          progressPercent: 42,
          createdAt: '2024-08-01T00:00:00Z',
          updatedAt: '2024-08-12T00:00:00Z'
        },
        {
          id: 2,
          name: 'Bicicleta Nova',
          description: 'Uma bicicleta rosa para andar no parque com minha família',
          targetAmount: 150,
          currentAmount: 89,
          category: 'Esportes',
          icon: '🚲',
          isCompleted: false,
          progressPercent: 59,
          createdAt: '2024-07-15T00:00:00Z',
          updatedAt: '2024-08-10T00:00:00Z'
        },
        {
          id: 3,
          name: 'Kit de Arte',
          description: 'Conjunto completo de tintas e pincéis para fazer desenhos bonitos',
          targetAmount: 50,
          currentAmount: 50,
          category: 'Arte',
          icon: '🎨',
          isCompleted: true,
          progressPercent: 100,
          createdAt: '2024-06-01T00:00:00Z',
          updatedAt: '2024-07-20T00:00:00Z',
          completedAt: '2024-07-20T00:00:00Z'
        }
      ];
      
      // Combine saved and mock goals, with saved goals first
      const allGoals = [...savedGoals, ...mockGoals];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoals(allGoals);
    } catch (error) {
      console.error('Fetch goals error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (goalId: number) => {
    if (confirm('Tem certeza que quer excluir este objetivo?')) {
      try {
        // Simulação de exclusão
        setGoals(currentGoals => currentGoals.filter(goal => goal.id !== goalId));
        alert('Objetivo excluído com sucesso!');
      } catch (error) {
        console.error('Delete goal error:', error);
        alert('Erro ao excluir objetivo');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

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
          <p style={{color: '#86198f'}}>Carregando seus objetivos...</p>
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
            <button
              onClick={() => router.push(`/child/${childId}/dashboard`)}
              style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
            >
              ← Voltar
            </button>
            <div>
              <h1 style={titleStyle}>🎯 Meus Objetivos</h1>
              <p style={subtitleStyle}>Suas metas de poupança</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/child/${childId}/goals/new`)}
            style={{...primaryBtnStyle, height: '3rem', width: '100%', fontSize: '1rem', fontWeight: '500'}}
          >
            + Novo Objetivo
          </button>
        </div>

        {error && (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', color: '#dc2626'}}>
              <p>{error}</p>
              <button onClick={fetchGoals} style={{...primaryBtnStyle, marginTop: '0.5rem'}}>
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Active Goals */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', marginBottom: '1rem'}}>
            🎯 Objetivos Ativos ({activeGoals.length})
          </h2>
          
          {activeGoals.length === 0 ? (
            <div style={cardStyle}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎯</div>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem'}}>Nenhum objetivo ainda</h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Crie seu primeiro objetivo e comece a poupar!
                </p>
                <button
                  onClick={() => router.push(`/child/${childId}/goals/new`)}
                  style={primaryBtnStyle}
                >
                  Criar Primeiro Objetivo
                </button>
              </div>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
              {activeGoals.map(goal => (
                <div key={goal.id} style={{...cardStyle, border: '2px solid #e9d5ff', transition: 'box-shadow 0.3s ease'}}>
                  {/* Goal Header */}
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        <span style={{fontSize: '2rem'}}>{goal.icon}</span>
                        <span style={{fontSize: '1.125rem', fontWeight: 'bold'}}>{goal.name}</span>
                      </div>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        {goal.category} • {formatDate(goal.createdAt)}
                      </p>
                    </div>
                    <span style={{...badgeStyle('#a855f7'), fontWeight: 'bold'}}>
                      {goal.progressPercent}%
                    </span>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p style={{
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      background: '#f9fafb', 
                      padding: '0.75rem', 
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {goal.description}
                    </p>
                  )}
                  
                  {/* Progress */}
                  <div style={{marginBottom: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                      <span style={{fontSize: '0.875rem', fontWeight: '500'}}>Progresso</span>
                      <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#a855f7'}}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div style={progressBarStyle(goal.progressPercent)}>
                      <div style={progressFillStyle(goal.progressPercent, '#a855f7')}></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <button
                      onClick={() => router.push(`/child/${childId}/goals/${goal.id}/deposit`)}
                      style={{...primaryBtnStyle, width: '100%', height: '2.5rem', fontSize: '0.875rem'}}
                    >
                      💰 Depositar Dinheiro
                    </button>
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                      <button
                        onClick={() => router.push(`/child/${childId}/goals/${goal.id}/edit`)}
                        style={{...btnStyle, flex: 1, height: '2.5rem', fontSize: '0.875rem'}}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        style={{...dangerBtnStyle, flex: 1, height: '2.5rem', fontSize: '0.875rem'}}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#15803d', marginBottom: '1rem'}}>
              ✅ Objetivos Concluídos ({completedGoals.length})
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {completedGoals.map(goal => (
                <div key={goal.id} style={{...cardStyle, background: '#f0fdf4', border: '2px solid #bbf7d0'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h3 style={{fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        <span style={{fontSize: '1.25rem'}}>{goal.icon}</span>
                        {goal.name}
                        <span style={{...badgeStyle('#16a34a')}}>Concluído</span>
                      </h3>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        {formatCurrency(goal.targetAmount)} • Concluído em {formatDate(goal.completedAt!)}
                      </p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '2rem'}}>🎉</div>
                    </div>
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