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

const cardStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '1rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '2px solid #e5e7eb'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem'
};

const cardIconStyle = {
  fontSize: '2rem',
  marginRight: '0.75rem'
};

const cardTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#374151'
};

const progressBarStyle = {
  width: '100%',
  height: '1rem',
  backgroundColor: '#e5e7eb',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  marginBottom: '1rem'
};

const progressFillStyle = (percentage: number) => ({
  width: `${percentage}%`,
  height: '100%',
  backgroundColor: '#10b981',
  borderRadius: '0.5rem',
  transition: 'width 0.3s ease'
});

const metricStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0',
  borderBottom: '1px solid #f3f4f6'
};

const metricLabelStyle = {
  color: '#6b7280',
  fontSize: '0.875rem'
};

const metricValueStyle = {
  fontWeight: '600',
  color: '#374151'
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

interface AnalyticsData {
  spendingByCategory: { [key: string]: number };
  monthlySpending: number[];
  savingsProgress: {
    current: number;
    target: number;
    percentage: number;
  };
  recentTransactions: any[];
  insights: string[];
}

export default function Analytics() {
  const [familyData, setFamilyData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get family data
        const family = await HybridStorage.getOrCreateFamily();
        setFamilyData(family);

        // Get all transactions for analytics
        const allTransactions = await HybridStorage.getTransactions();
        
        // Calculate spending by category
        const spendingByCategory: { [key: string]: number } = {};
        const monthlySpending = new Array(6).fill(0); // Last 6 months
        
        allTransactions.forEach(transaction => {
          if (transaction.amount < 0) { // Only spending
            const category = transaction.description.toLowerCase();
            if (category.includes('lanche') || category.includes('comida')) {
              spendingByCategory['Alimentação'] = (spendingByCategory['Alimentação'] || 0) + Math.abs(transaction.amount);
            } else if (category.includes('jogo') || category.includes('brinquedo')) {
              spendingByCategory['Jogos/Brinquedos'] = (spendingByCategory['Jogos/Brinquedos'] || 0) + Math.abs(transaction.amount);
            } else if (category.includes('livro') || category.includes('escola')) {
              spendingByCategory['Educação'] = (spendingByCategory['Educação'] || 0) + Math.abs(transaction.amount);
            } else {
              spendingByCategory['Outros'] = (spendingByCategory['Outros'] || 0) + Math.abs(transaction.amount);
            }
            
            // Add to monthly data (simplified - just current month)
            monthlySpending[5] += Math.abs(transaction.amount);
          }
        });

        // Calculate savings progress
        const totalBalance = family.children.reduce((sum: number, child: any) => sum + child.balance, 0);
        const savingsTarget = 500; // Example target
        
        const analyticsData: AnalyticsData = {
          spendingByCategory,
          monthlySpending,
          savingsProgress: {
            current: totalBalance,
            target: savingsTarget,
            percentage: Math.round((totalBalance / savingsTarget) * 100)
          },
          recentTransactions: allTransactions.slice(-5),
          insights: [
            `A família poupou R$ ${totalBalance.toFixed(2)} até agora! 🎉`,
            `${Object.keys(spendingByCategory).length} categorias diferentes de gastos identificadas`,
            `Meta de economia: ${Math.round((totalBalance / savingsTarget) * 100)}% concluída`
          ]
        };

        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <p>Carregando relatórios educativos...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Erro ao carregar dados dos relatórios.</p>
          <Link href="/" style={btnStyle}>Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📊 Relatórios Educativos</h1>
        <p style={subtitleStyle}>
          Aprenda sobre seus hábitos financeiros de forma visual e divertida!
        </p>
      </div>

      <div style={gridStyle}>
        {/* Savings Progress Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardIconStyle}>🎯</span>
            <h3 style={cardTitleStyle}>Progresso de Poupança</h3>
          </div>
          <div style={progressBarStyle}>
            <div style={progressFillStyle(analytics.savingsProgress.percentage)}></div>
          </div>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Valor Atual:</span>
            <span style={metricValueStyle}>R$ {analytics.savingsProgress.current.toFixed(2)}</span>
          </div>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Meta:</span>
            <span style={metricValueStyle}>R$ {analytics.savingsProgress.target.toFixed(2)}</span>
          </div>
          <div style={metricStyle}>
            <span style={metricLabelStyle}>Faltam:</span>
            <span style={metricValueStyle}>R$ {(analytics.savingsProgress.target - analytics.savingsProgress.current).toFixed(2)}</span>
          </div>
        </div>

        {/* Spending by Category */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardIconStyle}>📈</span>
            <h3 style={cardTitleStyle}>Gastos por Categoria</h3>
          </div>
          {Object.entries(analytics.spendingByCategory).map(([category, amount]) => {
            const total = Object.values(analytics.spendingByCategory).reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            
            return (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <div style={metricStyle}>
                  <span style={metricLabelStyle}>{category}:</span>
                  <span style={metricValueStyle}>R$ {amount.toFixed(2)}</span>
                </div>
                <div style={progressBarStyle}>
                  <div style={{
                    ...progressFillStyle(percentage),
                    backgroundColor: category === 'Alimentação' ? '#ef4444' : 
                                   category === 'Jogos/Brinquedos' ? '#f59e0b' :
                                   category === 'Educação' ? '#10b981' : '#6b7280'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Family Insights */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardIconStyle}>💡</span>
            <h3 style={cardTitleStyle}>Descobertas da Família</h3>
          </div>
          {analytics.insights.map((insight, index) => (
            <div key={index} style={{
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #bae6fd'
            }}>
              <p style={{ margin: 0, color: '#0369a1', fontWeight: '500' }}>
                {insight}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardIconStyle}>📝</span>
            <h3 style={cardTitleStyle}>Atividade Recente</h3>
          </div>
          {analytics.recentTransactions.map((transaction, index) => (
            <div key={index} style={metricStyle}>
              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {transaction.description}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <span style={{
                ...metricValueStyle,
                color: transaction.amount > 0 ? '#10b981' : '#ef4444'
              }}>
                {transaction.amount > 0 ? '+' : ''}R$ {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/" style={btnStyle}>🏠 Voltar ao Início</Link>
        <Link href="/gamification" style={btnStyle}>🏆 Ver Conquistas</Link>
      </div>
    </div>
  );
}