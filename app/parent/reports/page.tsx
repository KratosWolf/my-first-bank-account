'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChildReport {
  id: number;
  name: string;
  avatar: string | null;
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  financialSummary: {
    startingBalance: number;
    endingBalance: number;
    totalIncome: number;
    totalSpent: number;
    totalSaved: number;
    netChange: number;
  };
  spendingBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
    icon: string;
  }>;
  goalProgress: {
    activeGoals: number;
    completedGoals: number;
    totalTargetAmount: number;
    totalSavedAmount: number;
    averageProgress: number;
  };
  achievements: {
    pointsEarned: number;
    badgesEarned: number;
    levelProgress: number;
    streakDays: number;
  };
  behaviors: {
    savingsRate: number;
    spendingConsistency: number;
    goalCommitment: number;
    overallScore: number;
  };
}

interface FamilyReport {
  period: {
    startDate: string;
    endDate: string;
    description: string;
  };
  familyOverview: {
    totalChildren: number;
    totalFamilyBalance: number;
    totalFamilySpent: number;
    totalFamilySaved: number;
    averageChildBalance: number;
  };
  topPerformers: {
    bestSaver: { childId: number; childName: string; amount: number };
    mostImproved: { childId: number; childName: string; improvement: number };
    goalAchiever: { childId: number; childName: string; goalsCompleted: number };
  };
  insights: Array<{
    type: 'positive' | 'neutral' | 'improvement';
    title: string;
    description: string;
    recommendation?: string;
    icon: string;
  }>;
  childrenReports: ChildReport[];
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)',
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
  color: '#166534',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#15803d',
  fontSize: '1rem'
};

const cardStyle = {
  background: 'white',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb'
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
  background: '#16a34a',
  color: 'white',
  border: '1px solid #16a34a'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const greenCard = { ...cardStyle, border: '2px solid #bbf7d0' };
const blueCard = { ...cardStyle, border: '2px solid #bfdbfe' };
const purpleCard = { ...cardStyle, border: '2px solid #e9d5ff' };
const orangeCard = { ...cardStyle, border: '2px solid #fed7aa' };

const cardTitleStyle = {
  fontSize: '1.125rem',
  fontWeight: 'bold',
  marginBottom: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const cardValueStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem'
};

const cardSubtextStyle = {
  fontSize: '0.875rem',
  color: '#6b7280'
};

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function ParentReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<FamilyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/parent/reports?period=${selectedPeriod}&child=${selectedChild}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('Erro ao carregar relatórios');
      }
    } catch (error) {
      console.error('Reports fetch error:', error);
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

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return { border: '2px solid #bbf7d0', background: '#f0fdf4' };
      case 'improvement': return { border: '2px solid #fed7aa', background: '#fffbeb' };
      case 'neutral': return { border: '2px solid #bfdbfe', background: '#eff6ff' };
      default: return { border: '2px solid #e5e7eb', background: '#f9fafb' };
    }
  };

  const getBehaviorColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    return '#dc2626';
  };

  const getBehaviorLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #16a34a', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#15803d'}}>Gerando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div style={loadingStyle}>
        <div style={cardStyle}>
          <p style={{color: '#dc2626', marginBottom: '1rem', textAlign: 'center'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchReportData} style={primaryBtnStyle}>
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
              <h1 style={titleStyle}>📈 Relatórios Familiares</h1>
              <p style={subtitleStyle}>
                {reportData.period.description} • {formatDate(reportData.period.startDate)} - {formatDate(reportData.period.endDate)}
              </p>
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
            
            <button
              onClick={() => window.print()}
              style={btnStyle}
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>

        {/* Family Overview */}
        <div style={gridStyle}>
          <div style={greenCard}>
            <div style={{...cardTitleStyle, color: '#166534'}}>
              💰 Saldo Familiar
            </div>
            <p style={{...cardValueStyle, color: '#16a34a'}}>
              {formatCurrency(reportData.familyOverview.totalFamilyBalance)}
            </p>
            <p style={{...cardSubtextStyle, color: '#15803d'}}>
              Média: {formatCurrency(reportData.familyOverview.averageChildBalance)} por criança
            </p>
          </div>

          <div style={blueCard}>
            <div style={{...cardTitleStyle, color: '#1e40af'}}>
              📊 Total Gasto
            </div>
            <p style={{...cardValueStyle, color: '#2563eb'}}>
              {formatCurrency(reportData.familyOverview.totalFamilySpent)}
            </p>
            <p style={{...cardSubtextStyle, color: '#1d4ed8'}}>
              {reportData.familyOverview.totalChildren} crianças ativas
            </p>
          </div>

          <div style={purpleCard}>
            <div style={{...cardTitleStyle, color: '#6b21a8'}}>
              🎯 Total Poupado
            </div>
            <p style={{...cardValueStyle, color: '#9333ea'}}>
              {formatCurrency(reportData.familyOverview.totalFamilySaved)}
            </p>
            <p style={{...cardSubtextStyle, color: '#7c3aed'}}>
              Economia familiar
            </p>
          </div>

          <div style={orangeCard}>
            <div style={{...cardTitleStyle, color: '#9a3412'}}>
              👑 Destaques
            </div>
            <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#9a3412', marginBottom: '0.25rem'}}>
              🥇 {reportData.topPerformers.bestSaver.childName}
            </p>
            <p style={{fontSize: '0.75rem', color: '#c2410c'}}>
              Maior poupador: {formatCurrency(reportData.topPerformers.bestSaver.amount)}
            </p>
          </div>
        </div>

        {/* Insights */}
        <div style={{...cardStyle, marginBottom: '2rem'}}>
          <h2 style={{...cardTitleStyle, fontSize: '1.25rem', color: '#374151'}}>💡 Insights e Recomendações</h2>
          <p style={{...cardSubtextStyle, marginBottom: '1.5rem'}}>Análise do comportamento financeiro da família</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            {reportData.insights.map((insight, index) => {
              const colors = getInsightColor(insight.type);
              return (
                <div key={index} style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: colors.border,
                  background: colors.background
                }}>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
                    <span style={{fontSize: '1.5rem'}}>{insight.icon}</span>
                    <div>
                      <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>{insight.title}</h3>
                      <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>{insight.description}</p>
                      {insight.recommendation && (
                        <p style={{
                          fontSize: '0.75rem', 
                          color: '#1d4ed8', 
                          background: '#eff6ff', 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem',
                          borderLeft: '2px solid #3b82f6'
                        }}>
                          💡 {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Children Reports */}
        <div>
          <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem'}}>👶 Relatórios Individuais</h2>
          
          {reportData.childrenReports.map(child => (
            <div key={child.id} style={{...cardStyle, marginBottom: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {child.name[0]}
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827'}}>{child.name}</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      Relatório de {formatDate(child.period.startDate)} a {formatDate(child.period.endDate)}
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  background: getBehaviorColor(child.behaviors.overallScore),
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {child.behaviors.overallScore}% - {getBehaviorLabel(child.behaviors.overallScore)}
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                {/* Financial Summary */}
                <div>
                  <h4 style={{fontWeight: '600', color: '#374151', marginBottom: '0.75rem'}}>💰 Resumo Financeiro</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Saldo Inicial:</span>
                      <span style={{fontWeight: '500'}}>{formatCurrency(child.financialSummary.startingBalance)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Receitas:</span>
                      <span style={{fontWeight: '500', color: '#16a34a'}}>+{formatCurrency(child.financialSummary.totalIncome)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Gastos:</span>
                      <span style={{fontWeight: '500', color: '#dc2626'}}>-{formatCurrency(child.financialSummary.totalSpent)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem'}}>
                      <span style={{fontSize: '0.875rem', fontWeight: '500'}}>Saldo Final:</span>
                      <span style={{fontWeight: 'bold', fontSize: '1.125rem'}}>{formatCurrency(child.financialSummary.endingBalance)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{fontSize: '0.875rem', color: '#6b7280'}}>Variação:</span>
                      <span style={{
                        fontWeight: '500', 
                        color: child.financialSummary.netChange >= 0 ? '#16a34a' : '#dc2626'
                      }}>
                        {child.financialSummary.netChange >= 0 ? '+' : ''}{formatCurrency(child.financialSummary.netChange)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spending Breakdown */}
                <div>
                  <h4 style={{fontWeight: '600', color: '#374151', marginBottom: '0.75rem'}}>📊 Categorias de Gastos</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {child.spendingBreakdown.map((category, index) => (
                      <div key={index} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <span style={{fontSize: '1.125rem'}}>{category.icon}</span>
                          <span style={{fontSize: '0.875rem'}}>{category.category}</span>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <p style={{fontSize: '0.875rem', fontWeight: '500'}}>{formatCurrency(category.amount)}</p>
                          <p style={{fontSize: '0.75rem', color: '#6b7280'}}>{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals & Achievements */}
                <div>
                  <h4 style={{fontWeight: '600', color: '#374151', marginBottom: '0.75rem'}}>🎯 Objetivos e Conquistas</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <div style={{background: '#fefce8', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fde047'}}>
                      <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#a16207'}}>Objetivos Ativos: {child.goalProgress.activeGoals}</p>
                      <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#166534'}}>Concluídos: {child.goalProgress.completedGoals}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                        Progresso médio: {child.goalProgress.averageProgress}%
                      </p>
                    </div>
                    
                    <div style={{background: '#faf5ff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e9d5ff'}}>
                      <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#7c2d12'}}>⭐ {child.achievements.pointsEarned} pontos ganhos</p>
                      <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#9a3412'}}>🏅 {child.achievements.badgesEarned} medalhas novas</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                        Sequência: {child.achievements.streakDays} dias
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior Analysis */}
              <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb'}}>
                <h4 style={{fontWeight: '600', color: '#374151', marginBottom: '0.75rem'}}>🧠 Análise Comportamental</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem'}}>
                  <div style={{textAlign: 'center'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>{child.behaviors.savingsRate}%</p>
                    <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Taxa de Poupança</p>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb'}}>{child.behaviors.spendingConsistency}%</p>
                    <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Consistência nos Gastos</p>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea'}}>{child.behaviors.goalCommitment}%</p>
                    <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Comprometimento com Metas</p>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <p style={{
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: getBehaviorColor(child.behaviors.overallScore)
                    }}>
                      {child.behaviors.overallScore}%
                    </p>
                    <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Pontuação Geral</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}