'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FamilyGoal {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  category: string;
  icon: string;
  isCompleted: boolean;
  createdAt: string;
  targetDate?: string;
  participants: Array<{
    childId: number;
    childName: string;
    contribution: number;
    contributionPercent: number;
  }>;
  rewards: {
    familyBonus: number;
    individualBonus: number;
    specialReward?: string;
  };
}

interface FamilyGoalsData {
  activeGoals: FamilyGoal[];
  completedGoals: FamilyGoal[];
  familyStats: {
    totalGoals: number;
    totalSaved: number;
    completionRate: number;
    averageContribution: number;
  };
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
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
  color: '#92400e',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#a16207',
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
  background: '#f59e0b',
  color: 'white',
  border: '1px solid #f59e0b'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
  background: 'linear-gradient(90deg, #f59e0b, #eab308)',
  borderRadius: '4px',
  transition: 'width 0.3s ease'
});

export default function FamilyGoalsPage() {
  const router = useRouter();
  const [goalsData, setGoalsData] = useState<FamilyGoalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const fetchGoalsData = async () => {
    setLoading(true);
    try {
      // Simulando dados de metas familiares
      const mockData: FamilyGoalsData = {
        activeGoals: [
          {
            id: 1,
            title: 'Viagem para Disney',
            description: 'Economizar para uma viagem em família para a Disney',
            targetAmount: 5000,
            currentAmount: 2150,
            progressPercent: 43,
            category: 'Viagem',
            icon: '🏰',
            isCompleted: false,
            createdAt: '2024-01-15',
            targetDate: '2024-12-31',
            participants: [
              { childId: 1, childName: 'Demo Child', contribution: 500, contributionPercent: 23 }
            ],
            rewards: {
              familyBonus: 100,
              individualBonus: 50,
              specialReward: 'Escolher primeiro brinquedo na Disney'
            }
          },
          {
            id: 2,
            title: 'Novo Videogame',
            description: 'Console de videogame para toda a família',
            targetAmount: 800,
            currentAmount: 320,
            progressPercent: 40,
            category: 'Eletrônicos',
            icon: '🎮',
            isCompleted: false,
            createdAt: '2024-02-01',
            targetDate: '2024-06-30',
            participants: [
              { childId: 1, childName: 'Demo Child', contribution: 150, contributionPercent: 47 }
            ],
            rewards: {
              familyBonus: 50,
              individualBonus: 25,
              specialReward: 'Escolher primeiro jogo'
            }
          }
        ],
        completedGoals: [
          {
            id: 3,
            title: 'Bicicletas Novas',
            description: 'Bicicletas para exercitar em família',
            targetAmount: 600,
            currentAmount: 600,
            progressPercent: 100,
            category: 'Esporte',
            icon: '🚲',
            isCompleted: true,
            createdAt: '2023-12-01',
            targetDate: '2024-03-01',
            participants: [
              { childId: 1, childName: 'Demo Child', contribution: 200, contributionPercent: 33 }
            ],
            rewards: {
              familyBonus: 30,
              individualBonus: 20,
              specialReward: 'Primeira volta no parque'
            }
          }
        ],
        familyStats: {
          totalGoals: 3,
          totalSaved: 3070,
          completionRate: 67,
          averageContribution: 283
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGoalsData(mockData);
    } catch (error) {
      console.error('Goals fetch error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const addNewGoal = () => {
    if (newGoalTitle && newGoalAmount && newGoalCategory) {
      const newGoal: FamilyGoal = {
        id: Date.now(),
        title: newGoalTitle,
        description: `Meta familiar: ${newGoalTitle}`,
        targetAmount: parseFloat(newGoalAmount),
        currentAmount: 0,
        progressPercent: 0,
        category: newGoalCategory,
        icon: '🎯',
        isCompleted: false,
        createdAt: new Date().toISOString().split('T')[0],
        participants: [],
        rewards: {
          familyBonus: Math.floor(parseFloat(newGoalAmount) * 0.02),
          individualBonus: Math.floor(parseFloat(newGoalAmount) * 0.01),
          specialReward: 'Primeira escolha!'
        }
      };

      if (goalsData) {
        const updatedData = {
          ...goalsData,
          activeGoals: [...goalsData.activeGoals, newGoal]
        };
        setGoalsData(updatedData);
      }

      setNewGoalTitle('');
      setNewGoalAmount('');
      setNewGoalCategory('');
    }
  };

  const tabStyle = (isActive: boolean) => ({
    ...btnStyle,
    background: isActive ? '#f59e0b' : 'white',
    color: isActive ? 'white' : '#374151',
    border: isActive ? '1px solid #f59e0b' : '1px solid #d1d5db',
    marginRight: '0.5rem',
    marginBottom: '0.5rem'
  });

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #f59e0b', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#92400e'}}>Carregando metas familiares...</p>
        </div>
      </div>
    );
  }

  if (error || !goalsData) {
    return (
      <div style={loadingStyle}>
        <div style={cardStyle}>
          <p style={{color: '#dc2626', marginBottom: '1rem', textAlign: 'center'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchGoalsData} style={primaryBtnStyle}>
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
              <h1 style={titleStyle}>🏆 Metas Familiares</h1>
              <p style={subtitleStyle}>Objetivos e sonhos da família trabalhando juntos</p>
            </div>
          </div>
        </div>

        {/* Family Stats */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem'}}>
            📊 Estatísticas da Família
          </h2>
          
          <div style={gridStyle}>
            <div style={{textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fde68a'}}>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#92400e'}}>{goalsData.familyStats.totalGoals}</p>
              <p style={{fontSize: '0.875rem', color: '#a16207'}}>Total de Metas</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#166534'}}>{formatCurrency(goalsData.familyStats.totalSaved)}</p>
              <p style={{fontSize: '0.875rem', color: '#15803d'}}>Total Economizado</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe'}}>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#1e40af'}}>{goalsData.familyStats.completionRate}%</p>
              <p style={{fontSize: '0.875rem', color: '#1d4ed8'}}>Taxa de Conclusão</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', background: '#faf5ff', borderRadius: '0.5rem', border: '1px solid #e9d5ff'}}>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#6b21a8'}}>{formatCurrency(goalsData.familyStats.averageContribution)}</p>
              <p style={{fontSize: '0.875rem', color: '#7c3aed'}}>Contribuição Média</p>
            </div>
          </div>
        </div>

        {/* Add New Goal */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem'}}>
            ➕ Criar Nova Meta
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                Nome da Meta
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Ex: Viagem de férias"
              />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                Valor Alvo
              </label>
              <input
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                type="number"
                step="0.01"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                placeholder="1000.00"
              />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                Categoria
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Viagem">Viagem</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Esporte">Esporte</option>
                <option value="Educação">Educação</option>
                <option value="Casa">Casa</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end'}}>
              <button onClick={addNewGoal} style={primaryBtnStyle}>
                Criar Meta
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{marginBottom: '2rem'}}>
          <button 
            onClick={() => setActiveTab('active')} 
            style={tabStyle(activeTab === 'active')}
          >
            🎯 Metas Ativas ({goalsData.activeGoals.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')} 
            style={tabStyle(activeTab === 'completed')}
          >
            ✅ Concluídas ({goalsData.completedGoals.length})
          </button>
        </div>

        {/* Goals List */}
        <div style={gridStyle}>
          {(activeTab === 'active' ? goalsData.activeGoals : goalsData.completedGoals).map((goal) => (
            <div key={goal.id} style={{
              ...cardStyle,
              border: goal.isCompleted ? '2px solid #16a34a' : '2px solid #f59e0b'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <span style={{fontSize: '2rem'}}>{goal.icon}</span>
                  <div>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem'}}>
                      {goal.title}
                    </h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{goal.description}</p>
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  background: goal.isCompleted ? '#16a34a' : '#f59e0b',
                  color: 'white'
                }}>
                  {goal.category}
                </div>
              </div>

              {/* Progress */}
              <div style={{marginBottom: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
                    {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                  </span>
                  <span style={{fontSize: '0.875rem', fontWeight: 'bold', color: goal.isCompleted ? '#16a34a' : '#f59e0b'}}>
                    {goal.progressPercent}%
                  </span>
                </div>
                <div style={progressBarStyle(goal.progressPercent)}>
                  <div style={progressFillStyle(goal.progressPercent)}></div>
                </div>
              </div>

              {/* Participants */}
              {goal.participants.length > 0 && (
                <div style={{marginBottom: '1rem'}}>
                  <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                    👨‍👩‍👧‍👦 Participantes:
                  </h4>
                  {goal.participants.map((participant) => (
                    <div key={participant.childId} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: '#f9fafb',
                      borderRadius: '0.25rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{fontSize: '0.875rem', fontWeight: '500'}}>{participant.childName}</span>
                      <div>
                        <span style={{fontSize: '0.875rem', color: '#16a34a', fontWeight: '500'}}>
                          {formatCurrency(participant.contribution)}
                        </span>
                        <span style={{fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem'}}>
                          ({participant.contributionPercent}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rewards */}
              <div style={{padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fde68a'}}>
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem'}}>
                  🎁 Recompensas:
                </h4>
                <div style={{fontSize: '0.875rem', color: '#a16207'}}>
                  <p>• Bônus família: {formatCurrency(goal.rewards.familyBonus)}</p>
                  <p>• Bônus individual: {formatCurrency(goal.rewards.individualBonus)}</p>
                  {goal.rewards.specialReward && (
                    <p>• Recompensa especial: {goal.rewards.specialReward}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280'}}>
                <span>Criada: {formatDate(goal.createdAt)}</span>
                {goal.targetDate && (
                  <span>Meta: {formatDate(goal.targetDate)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(activeTab === 'active' ? goalsData.activeGoals : goalsData.completedGoals).length === 0 && (
          <div style={{...cardStyle, textAlign: 'center', padding: '3rem'}}>
            <span style={{fontSize: '4rem', marginBottom: '1rem', display: 'block'}}>
              {activeTab === 'active' ? '🎯' : '✅'}
            </span>
            <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem'}}>
              {activeTab === 'active' ? 'Nenhuma meta ativa' : 'Nenhuma meta concluída'}
            </h3>
            <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
              {activeTab === 'active' 
                ? 'Crie sua primeira meta familiar e comece a economizar juntos!' 
                : 'Complete suas primeiras metas para vê-las aqui.'}
            </p>
            {activeTab === 'active' && (
              <button 
                onClick={() => document.querySelector('input')?.focus()}
                style={primaryBtnStyle}
              >
                Criar Primeira Meta
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}