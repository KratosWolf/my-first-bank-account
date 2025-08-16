'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface SpendingTransaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'expense' | 'allowance' | 'gift' | 'goal_deposit';
  balanceAfter: number;
}

interface CategorySpending {
  category: string;
  totalSpent: number;
  transactions: number;
  percentage: number;
  color: string;
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

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const badgeStyle = (color: string) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  background: color
});

const progressBarStyle = {
  width: '100%',
  height: '8px',
  background: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden' as 'hidden'
};

const progressFillStyle = (percent: number, color: string) => ({
  width: `${percent}%`,
  height: '100%',
  background: color,
  borderRadius: '4px',
  transition: 'width 0.3s ease'
});

export default function ChildSpendingPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [transactions, setTransactions] = useState<SpendingTransaction[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'month': return 'Este Mês';
      case 'semester': return 'Este Semestre';
      case 'year': return 'Este Ano';
      default: return 'Este Mês';
    }
  };

  useEffect(() => {
    fetchSpendingData();
  }, [period]);

  const fetchSpendingData = async () => {
    setLoading(true);
    try {
      // Generate period-specific mock data
      const generateDataForPeriod = (period: string) => {
        const now = new Date();
        let startDate: Date;
        let transactions: SpendingTransaction[] = [];
        
        switch (period) {
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            transactions = [
              {
                id: 1,
                amount: 25,
                description: 'Mesada da semana',
                category: 'Allowance',
                date: '2024-08-12',
                type: 'allowance',
                balanceAfter: 87.50
              },
              {
                id: 2,
                amount: -12.50,
                description: 'Lanche na escola',
                category: 'Comida',
                date: '2024-08-11',
                type: 'expense',
                balanceAfter: 62.50
              },
              {
                id: 3,
                amount: -8.00,
                description: 'Sorvete com amigos',
                category: 'Comida',
                date: '2024-08-09',
                type: 'expense',
                balanceAfter: 85.00
              },
              {
                id: 4,
                amount: -15.00,
                description: 'Livro de histórias',
                category: 'Educação',
                date: '2024-08-08',
                type: 'expense',
                balanceAfter: 93.00
              },
              {
                id: 5,
                amount: -10,
                description: 'Guardei para Nintendo Switch',
                category: 'Objetivos',
                date: '2024-08-10',
                type: 'goal_deposit',
                balanceAfter: 75.00
              }
            ];
            break;
          case 'semester':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1);
            transactions = [
              {
                id: 1,
                amount: 125,
                description: 'Mesadas do semestre',
                category: 'Allowance',
                date: '2024-08-12',
                type: 'allowance',
                balanceAfter: 287.50
              },
              {
                id: 2,
                amount: -45.50,
                description: 'Gastos com comida',
                category: 'Comida',
                date: '2024-08-11',
                type: 'expense',
                balanceAfter: 242.00
              },
              {
                id: 3,
                amount: -35.00,
                description: 'Livros e materiais',
                category: 'Educação',
                date: '2024-07-15',
                type: 'expense',
                balanceAfter: 207.00
              },
              {
                id: 4,
                amount: -25.00,
                description: 'Poupança para objetivos',
                category: 'Objetivos',
                date: '2024-07-10',
                type: 'goal_deposit',
                balanceAfter: 182.00
              }
            ];
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            transactions = [
              {
                id: 1,
                amount: 300,
                description: 'Mesadas do ano',
                category: 'Allowance',
                date: '2024-08-12',
                type: 'allowance',
                balanceAfter: 687.50
              },
              {
                id: 2,
                amount: -125.00,
                description: 'Gastos com comida',
                category: 'Comida',
                date: '2024-08-11',
                type: 'expense',
                balanceAfter: 562.50
              },
              {
                id: 3,
                amount: -85.00,
                description: 'Educação e livros',
                category: 'Educação',
                date: '2024-06-15',
                type: 'expense',
                balanceAfter: 477.50
              },
              {
                id: 4,
                amount: -60.00,
                description: 'Poupança para objetivos',
                category: 'Objetivos',
                date: '2024-05-10',
                type: 'goal_deposit',
                balanceAfter: 417.50
              }
            ];
            break;
          default:
            transactions = [];
        }

        // Calculate category spending
        const expenses = transactions.filter(t => t.amount < 0);
        const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const categoryTotals: { [key: string]: { total: number; count: number; color: string } } = {};
        
        expenses.forEach(transaction => {
          if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = { 
              total: 0, 
              count: 0, 
              color: transaction.category === 'Comida' ? '#f59e0b' :
                     transaction.category === 'Educação' ? '#3b82f6' :
                     transaction.category === 'Objetivos' ? '#a855f7' : '#6b7280'
            };
          }
          categoryTotals[transaction.category].total += Math.abs(transaction.amount);
          categoryTotals[transaction.category].count += 1;
        });

        const categoryData: CategorySpending[] = Object.entries(categoryTotals).map(([category, data]) => ({
          category,
          totalSpent: data.total,
          transactions: data.count,
          percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
          color: data.color
        }));

        return { transactions, categoryData };
      };

      const { transactions: mockTransactions, categoryData: mockCategoryData } = generateDataForPeriod(period);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
      setCategoryData(mockCategoryData);
    } catch (error) {
      console.error('Fetch spending error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${Math.abs(amount).toFixed(2)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'allowance': return '💰';
      case 'expense': return '🛒';
      case 'goal_deposit': return '🎯';
      case 'gift': return '🎁';
      default: return '💳';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'allowance': return 'Mesada';
      case 'expense': return 'Gasto';
      case 'goal_deposit': return 'Objetivo';
      case 'gift': return 'Presente';
      default: return 'Transação';
    }
  };

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.totalSpent, 0);
  const totalEarned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #2563eb', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#2563eb'}}>Carregando seus gastos...</p>
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
          <div style={{flex: 1}}>
            <h1 style={titleStyle}>📊 Meus Gastos</h1>
            <p style={subtitleStyle}>Acompanhe como você gasta seu dinheiro</p>
          </div>
        </div>

        {error && (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', color: '#dc2626'}}>
              <p>{error}</p>
              <button onClick={fetchSpendingData} style={btnStyle}>
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
          <div style={{...cardStyle, border: '2px solid #fecaca'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem'}}>
              💸 Total Gasto
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626'}}>
              R$ {totalSpent.toFixed(2)}
            </p>
            <p style={{fontSize: '0.75rem', color: '#7f1d1d'}}>{getPeriodLabel(period)}</p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bbf7d0'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem'}}>
              💰 Total Recebido
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>
              R$ {totalEarned.toFixed(2)}
            </p>
            <p style={{fontSize: '0.75rem', color: '#14532d'}}>{getPeriodLabel(period)}</p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bfdbfe'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem'}}>
              🧾 Transações
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb'}}>
              {transactions.length}
            </p>
            <p style={{fontSize: '0.75rem', color: '#1e3a8a'}}>{getPeriodLabel(period)}</p>
          </div>
        </div>

        {/* Period Selector */}
        <div style={{...cardStyle, marginBottom: '1.5rem'}}>
          <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            📅 Selecionar Período
          </h3>
          <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            {['month', 'semester', 'year'].map((periodOption) => (
              <button
                key={periodOption}
                onClick={() => setPeriod(periodOption)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid',
                  borderColor: period === periodOption ? '#a855f7' : '#d1d5db',
                  background: period === periodOption ? '#a855f7' : 'white',
                  color: period === periodOption ? 'white' : '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  if (period !== periodOption) {
                    e.currentTarget.style.borderColor = '#a855f7';
                    e.currentTarget.style.color = '#a855f7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (period !== periodOption) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                {periodOption === 'month' ? '📅 Este Mês' :
                 periodOption === 'semester' ? '📊 Este Semestre' :
                 '📈 Este Ano'}
              </button>
            ))}
          </div>
        </div>

        {/* Historical Comparison */}
        <div style={{...cardStyle, marginBottom: '1.5rem'}}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            📈 Evolução dos Gastos
          </h3>
          <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem'}}>
            Comparação dos últimos 4 {period === 'month' ? 'meses' : period === 'semester' ? 'semestres' : 'anos'}
          </p>
          
          {/* Total Historical */}
          <div style={{marginBottom: '2rem'}}>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem'}}>
              💰 Total Geral
            </h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
              {(() => {
                const getHistoricalData = () => {
                  switch (period) {
                    case 'month':
                      return [
                        { label: 'Ago 2024', amount: totalSpent, isCurrent: true },
                        { label: 'Jul 2024', amount: 38.75, isCurrent: false },
                        { label: 'Jun 2024', amount: 52.30, isCurrent: false },
                        { label: 'Mai 2024', amount: 29.80, isCurrent: false }
                      ];
                    case 'semester':
                      return [
                        { label: '2º Sem 2024', amount: totalSpent, isCurrent: true },
                        { label: '1º Sem 2024', amount: 89.25, isCurrent: false },
                        { label: '2º Sem 2023', amount: 124.60, isCurrent: false },
                        { label: '1º Sem 2023', amount: 67.40, isCurrent: false }
                      ];
                    case 'year':
                      return [
                        { label: '2024', amount: totalSpent, isCurrent: true },
                        { label: '2023', amount: 195.50, isCurrent: false },
                        { label: '2022', amount: 167.30, isCurrent: false },
                        { label: '2021', amount: 143.80, isCurrent: false }
                      ];
                    default:
                      return [];
                  }
                };

                return getHistoricalData().map((data, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: data.isCurrent ? '#a855f7' : '#e5e7eb',
                    background: data.isCurrent ? '#faf5ff' : '#f9fafb'
                  }}>
                    <p style={{fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem'}}>{data.label}</p>
                    <p style={{
                      fontSize: '1.125rem', 
                      fontWeight: 'bold', 
                      color: data.isCurrent ? '#a855f7' : '#374151'
                    }}>
                      R$ {data.amount.toFixed(2)}
                    </p>
                    {data.isCurrent && (
                      <p style={{fontSize: '0.6rem', color: '#a855f7', marginTop: '0.25rem'}}>ATUAL</p>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Category Historical */}
          <div>
            <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem'}}>
              📊 Por Categoria
            </h4>
            {(() => {
              const getCategoryHistoricalData = () => {
                // Filter out non-spending categories and get all actual spending categories
                const spendingCategories = categoryData.filter(cat => 
                  cat.category !== 'Objetivos' && 
                  cat.category !== 'Allowance' && 
                  cat.category !== 'Bônus'
                );

                const historicalData: { [key: string]: any[] } = {};

                spendingCategories.forEach(category => {
                  switch (period) {
                    case 'month':
                      historicalData[category.category] = [
                        { label: 'Ago 2024', amount: category.totalSpent, isCurrent: true },
                        { label: 'Jul 2024', amount: generateHistoricalAmount(category.totalSpent, 0.8), isCurrent: false },
                        { label: 'Jun 2024', amount: generateHistoricalAmount(category.totalSpent, 1.2), isCurrent: false },
                        { label: 'Mai 2024', amount: generateHistoricalAmount(category.totalSpent, 0.6), isCurrent: false }
                      ];
                      break;
                    case 'semester':
                      historicalData[category.category] = [
                        { label: '2º Sem 2024', amount: category.totalSpent, isCurrent: true },
                        { label: '1º Sem 2024', amount: generateHistoricalAmount(category.totalSpent, 0.85), isCurrent: false },
                        { label: '2º Sem 2023', amount: generateHistoricalAmount(category.totalSpent, 1.3), isCurrent: false },
                        { label: '1º Sem 2023', amount: generateHistoricalAmount(category.totalSpent, 0.7), isCurrent: false }
                      ];
                      break;
                    case 'year':
                      historicalData[category.category] = [
                        { label: '2024', amount: category.totalSpent, isCurrent: true },
                        { label: '2023', amount: generateHistoricalAmount(category.totalSpent, 0.9), isCurrent: false },
                        { label: '2022', amount: generateHistoricalAmount(category.totalSpent, 0.8), isCurrent: false },
                        { label: '2021', amount: generateHistoricalAmount(category.totalSpent, 0.75), isCurrent: false }
                      ];
                      break;
                  }
                });

                return historicalData;
              };

              // Helper function to generate realistic historical amounts
              const generateHistoricalAmount = (currentAmount: number, factor: number) => {
                const variation = (Math.random() - 0.5) * 0.2; // ±10% random variation
                return Math.max(0, currentAmount * factor * (1 + variation));
              };

              const categoryHistoricalData = getCategoryHistoricalData();
              
              // Get colors dynamically from category data
              const categoryColors: { [key: string]: string } = {};
              categoryData.forEach(category => {
                if (category.category !== 'Objetivos' && 
                    category.category !== 'Allowance' && 
                    category.category !== 'Bônus') {
                  categoryColors[category.category] = category.color;
                }
              });

              return Object.entries(categoryHistoricalData).map(([categoryName, data]) => (
                <div key={categoryName} style={{marginBottom: '1.5rem'}}>
                  <h5 style={{
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: categoryColors[categoryName as keyof typeof categoryColors], 
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: categoryColors[categoryName as keyof typeof categoryColors]
                    }}></div>
                    {categoryName}
                  </h5>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem'}}>
                    {data.map((item, index) => (
                      <div key={index} style={{
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid',
                        borderColor: item.isCurrent ? categoryColors[categoryName as keyof typeof categoryColors] : '#e5e7eb',
                        background: item.isCurrent ? `${categoryColors[categoryName as keyof typeof categoryColors]}15` : '#f9fafb',
                        textAlign: 'center'
                      }}>
                        <p style={{fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem'}}>{item.label}</p>
                        <p style={{
                          fontSize: '0.95rem', 
                          fontWeight: 'bold', 
                          color: item.isCurrent ? categoryColors[categoryName as keyof typeof categoryColors] : '#374151'
                        }}>
                          R$ {item.amount.toFixed(2)}
                        </p>
                        {item.isCurrent && (
                          <p style={{fontSize: '0.55rem', color: categoryColors[categoryName as keyof typeof categoryColors], marginTop: '0.25rem'}}>ATUAL</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Spending by Category */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            📈 Gastos por Categoria
          </h2>
          
          {categoryData.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {categoryData.map((category, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: '#f9fafb'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <div style={{flex: 1}}>
                      <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem'}}>{category.category}</h3>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{category.transactions} transações</p>
                    </div>
                    <div style={{textAlign: 'right', minWidth: '120px'}}>
                      <p style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem'}}>
                        R$ {category.totalSpent.toFixed(2)}
                      </p>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem'}}>
                        <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                          do total R$ {totalSpent.toFixed(2)}
                        </span>
                        <span style={{...badgeStyle(category.color), fontSize: '0.75rem'}}>
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={progressBarStyle}>
                    <div style={progressFillStyle(category.percentage, category.color)}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📊</div>
              <p style={{color: '#6b7280'}}>Nenhum gasto por categoria ainda</p>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            📋 Histórico de Transações
          </h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {transactions.map(transaction => (
              <div key={transaction.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: transaction.amount > 0 ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${transaction.amount > 0 ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '0.5rem'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{
                    fontSize: '1.5rem',
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: transaction.amount > 0 ? '#dcfce7' : '#fee2e2'
                  }}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p style={{fontWeight: '500', fontSize: '0.875rem', color: '#374151'}}>
                      {transaction.description}
                    </p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280'}}>
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span style={{...badgeStyle('#6b7280'), fontSize: '0.6rem'}}>
                        {getTransactionLabel(transaction.type)}
                      </span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: transaction.amount > 0 ? '#16a34a' : '#dc2626'
                  }}>
                    {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    Saldo: R$ {transaction.balanceAfter.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}