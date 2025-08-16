'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsData {
  period: string;
  familyTrends: {
    totalBalance: Array<{ date: string; amount: number }>;
    spendingTrend: Array<{ date: string; amount: number }>;
    savingsRate: Array<{ date: string; percentage: number }>;
  };
  childrenComparison: Array<{
    childId: number;
    childName: string;
    metrics: {
      totalBalance: number;
      spendingThisMonth: number;
      savingsRate: number;
      goalCompletion: number;
      behaviorScore: number;
    };
  }>;
  categoryAnalysis: Array<{
    category: string;
    totalSpent: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    icon: string;
  }>;
  insights: Array<{
    type: 'achievement' | 'warning' | 'opportunity';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
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
  color: '#0c4a6e',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#0369a1',
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

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const badgeStyle = (type: string) => {
  const colors = {
    achievement: { bg: '#16a34a', color: 'white' },
    warning: { bg: '#dc2626', color: 'white' },
    opportunity: { bg: '#2563eb', color: 'white' }
  };
  return {
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    background: colors[type as keyof typeof colors]?.bg || '#6b7280',
    color: colors[type as keyof typeof colors]?.color || 'white'
  };
};

export default function ParentAnalyticsPage() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulando dados de analytics
      const mockData: AnalyticsData = {
        period: selectedPeriod,
        familyTrends: {
          totalBalance: [
            { date: '2024-01-01', amount: 100 },
            { date: '2024-01-15', amount: 150 },
            { date: '2024-02-01', amount: 200 }
          ],
          spendingTrend: [
            { date: '2024-01-01', amount: 50 },
            { date: '2024-01-15', amount: 75 },
            { date: '2024-02-01', amount: 60 }
          ],
          savingsRate: [
            { date: '2024-01-01', percentage: 20 },
            { date: '2024-01-15', percentage: 35 },
            { date: '2024-02-01', percentage: 45 }
          ]
        },
        childrenComparison: [
          {
            childId: 1,
            childName: 'Demo Child',
            metrics: {
              totalBalance: 150.00,
              spendingThisMonth: 75.00,
              savingsRate: 35,
              goalCompletion: 80,
              behaviorScore: 85
            }
          }
        ],
        categoryAnalysis: [
          { category: 'Comida', totalSpent: 120.00, percentage: 40, trend: 'up', icon: '🍕' },
          { category: 'Jogos', totalSpent: 80.00, percentage: 27, trend: 'stable', icon: '🎮' },
          { category: 'Brinquedos', totalSpent: 60.00, percentage: 20, trend: 'down', icon: '🧸' },
          { category: 'Livros', totalSpent: 40.00, percentage: 13, trend: 'up', icon: '📚' }
        ],
        insights: [
          {
            type: 'achievement',
            title: 'Meta de Poupança Alcançada!',
            description: 'A família superou a meta de 30% de taxa de poupança este mês.',
            priority: 'high',
            actionable: false
          },
          {
            type: 'warning',
            title: 'Gastos com Comida em Alta',
            description: 'Os gastos com alimentação aumentaram 15% comparado ao mês anterior.',
            priority: 'medium',
            actionable: true
          },
          {
            type: 'opportunity',
            title: 'Oportunidade de Economia',
            description: 'Reduzindo gastos com jogos, a família pode economizar R$ 25 por mês.',
            priority: 'low',
            actionable: true
          }
        ]
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#dc2626';
      case 'down': return '#16a34a';
      default: return '#2563eb';
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #0369a1', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#0c4a6e'}}>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div style={loadingStyle}>
        <div style={cardStyle}>
          <p style={{color: '#dc2626', marginBottom: '1rem', textAlign: 'center'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchAnalyticsData} style={{...btnStyle, background: '#2563eb', color: 'white', border: '1px solid #2563eb'}}>
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
              <h1 style={titleStyle}>📊 Analytics Familiares</h1>
              <p style={subtitleStyle}>Análise detalhada dos hábitos financeiros da família</p>
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '0.75rem'}}>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{...btnStyle, width: '160px'}}
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>

        {/* Insights */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '1rem'}}>
            💡 Insights Inteligentes
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            {analyticsData.insights.map((insight, index) => (
              <div key={index} style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                background: '#f9fafb'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                  <span style={badgeStyle(insight.type)}>
                    {insight.type === 'achievement' ? '🏆' : insight.type === 'warning' ? '⚠️' : '💡'}
                    {' '}
                    {insight.type === 'achievement' ? 'Conquista' : insight.type === 'warning' ? 'Atenção' : 'Oportunidade'}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}>
                    {insight.priority}
                  </span>
                </div>
                <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>{insight.title}</h3>
                <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Children Comparison */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '1rem'}}>
            👶 Comparação entre Crianças
          </h2>
          
          {analyticsData.childrenComparison.map((child) => (
            <div key={child.childId} style={{
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              marginBottom: '1rem'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #06b6d4, #0369a1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem'
                }}>
                  {child.childName[0]}
                </div>
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151'}}>{child.childName}</h3>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Análise de desempenho</p>
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
                <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>{formatCurrency(child.metrics.totalBalance)}</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Saldo Total</p>
                </div>
                <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626'}}>{formatCurrency(child.metrics.spendingThisMonth)}</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Gastos do Mês</p>
                </div>
                <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb'}}>{child.metrics.savingsRate}%</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Taxa Poupança</p>
                </div>
                <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed'}}>{child.metrics.goalCompletion}%</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Metas Concluídas</p>
                </div>
                <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c'}}>{child.metrics.behaviorScore}</p>
                  <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Score Comportamental</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Analysis */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '1rem'}}>
            📈 Análise por Categoria
          </h2>
          
          <div style={gridStyle}>
            {analyticsData.categoryAnalysis.map((category, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                background: '#f9fafb'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem'}}>{category.icon}</span>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#374151'}}>{category.category}</h3>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <span>{getTrendIcon(category.trend)}</span>
                    <span style={{fontSize: '0.875rem', fontWeight: '500', color: getTrendColor(category.trend)}}>
                      {category.trend === 'up' ? 'Alta' : category.trend === 'down' ? 'Baixa' : 'Estável'}
                    </span>
                  </div>
                </div>
                
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem'}}>
                  {formatCurrency(category.totalSpent)}
                </p>
                
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <span style={{fontSize: '0.875rem', color: '#6b7280'}}>{category.percentage}% do total</span>
                  <div style={{
                    width: '60px',
                    height: '4px',
                    background: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${category.percentage}%`,
                      height: '100%',
                      background: '#2563eb'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends Summary */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '1rem'}}>
            📊 Tendências da Família
          </h2>
          
          <div style={gridStyle}>
            <div style={{textAlign: 'center', padding: '1.5rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd'}}>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '0.5rem'}}>💰 Saldo Total</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem'}}>
                {formatCurrency(analyticsData.familyTrends.totalBalance[analyticsData.familyTrends.totalBalance.length - 1]?.amount || 0)}
              </p>
              <p style={{fontSize: '0.875rem', color: '#0369a1'}}>+25% vs período anterior</p>
            </div>
            
            <div style={{textAlign: 'center', padding: '1.5rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca'}}>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem'}}>💸 Gastos</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem'}}>
                {formatCurrency(analyticsData.familyTrends.spendingTrend[analyticsData.familyTrends.spendingTrend.length - 1]?.amount || 0)}
              </p>
              <p style={{fontSize: '0.875rem', color: '#dc2626'}}>-5% vs período anterior</p>
            </div>
            
            <div style={{textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '0.5rem'}}>📈 Taxa Poupança</h3>
              <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem'}}>
                {analyticsData.familyTrends.savingsRate[analyticsData.familyTrends.savingsRate.length - 1]?.percentage || 0}%
              </p>
              <p style={{fontSize: '0.875rem', color: '#16a34a'}}>+10% vs período anterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}