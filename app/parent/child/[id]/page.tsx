'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ChildData {
  id: string;
  name: string;
  balance: number;
  level: number;
  points: number;
  goals: Array<{
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
    icon: string;
  }>;
  recentTransactions: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    timestamp: string;
    balanceAfter: number;
  }>;
  pendingRequests: Array<{
    id: number;
    type: string;
    amount: number;
    description: string;
    status: string;
    timestamp: string;
  }>;
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '80rem',
  margin: '0 auto'
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

export default function ParentChildViewPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      // Load child data from localStorage (same logic as child dashboard but for parent view)
      const savedGoals = JSON.parse(localStorage.getItem(`child-${childId}-goals`) || '[]');
      const savedRequests = JSON.parse(localStorage.getItem(`child-${childId}-requests`) || '[]');
      const savedTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
      
      // Base transactions
      const baseTransactions = [
        { id: 1, type: 'allowance', amount: 25, description: 'Mesada da semana', timestamp: '2024-08-12T10:00:00Z', balanceAfter: 0 },
        { id: 2, type: 'purchase', amount: -12.50, description: 'Lanche na escola', timestamp: '2024-08-11T14:30:00Z', balanceAfter: 0 },
        { id: 3, type: 'allowance', amount: 25, description: 'Mesada da semana passada', timestamp: '2024-08-05T10:00:00Z', balanceAfter: 0 },
        { id: 4, type: 'bonus', amount: 5, description: 'Bônus por ajudar em casa', timestamp: '2024-08-03T18:00:00Z', balanceAfter: 0 },
        { id: 5, type: 'allowance', amount: 50, description: 'Mesada inicial', timestamp: '2024-08-01T10:00:00Z', balanceAfter: 0 }
      ];

      // Calculate balance
      const allTransactions = [...baseTransactions, ...savedTransactions]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      let runningBalance = 0;
      const transactionsWithBalance = allTransactions.map(transaction => {
        runningBalance += transaction.amount;
        return { ...transaction, balanceAfter: runningBalance };
      });

      const mockChildData: ChildData = {
        id: String(childId),
        name: `Criança ${childId}`,
        balance: runningBalance,
        level: Math.floor(runningBalance / 25) + 1,
        points: 340,
        goals: [
          ...savedGoals,
          {
            id: 1,
            name: 'Nintendo Switch',
            targetAmount: 300,
            currentAmount: 125,
            progressPercent: 42,
            icon: '🎮'
          },
          {
            id: 2,
            name: 'Bicicleta Nova',
            targetAmount: 150,
            currentAmount: 89,
            progressPercent: 59,
            icon: '🚲'
          }
        ],
        recentTransactions: transactionsWithBalance.slice(-10).reverse(),
        pendingRequests: savedRequests.slice(-10)
      };

      setChildData(mockChildData);
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `R$ ${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badgeStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: 'white',
      display: 'inline-block'
    };
    
    switch (status) {
      case 'pending':
        return <span style={{...badgeStyle, background: '#eab308'}}>⏳ Pendente</span>;
      case 'approved':
        return <span style={{...badgeStyle, background: '#16a34a'}}>✅ Aprovado</span>;
      case 'rejected':
        return <span style={{...badgeStyle, background: '#dc2626'}}>❌ Rejeitado</span>;
      default:
        return <span style={{...badgeStyle, background: '#6b7280'}}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #3b82f6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#1e40af'}}>Carregando dados da criança...</p>
        </div>
      </div>
    );
  }

  if (!childData) {
    return (
      <div style={containerStyle}>
        <div style={maxWidthStyle}>
          <div style={cardStyle}>
            <p style={{color: '#dc2626', textAlign: 'center'}}>Erro ao carregar dados da criança</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Link
              href="/parent/dashboard"
              style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
            >
              ← Voltar
            </Link>
            <div>
              <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem'}}>
                👶 Supervisão: {childData.name}
              </h1>
              <p style={{color: '#3730a3', fontSize: '1.125rem'}}>
                Visão dos pais sobre o progresso financeiro
              </p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '0.75rem'}}>
            <Link 
              href={`/child/${childId}/dashboard`}
              style={{...btnStyle, background: '#8b5cf6', color: 'white', border: '1px solid #8b5cf6'}}
            >
              👁️ Ver como Criança
            </Link>
            <button onClick={fetchChildData} style={{...btnStyle, border: '1px solid #2563eb', color: '#2563eb'}}>
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
          <div style={{...cardStyle, border: '2px solid #bbf7d0'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem'}}>
              💰 Saldo Atual
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem'}}>
              {formatCurrency(childData.balance)}
            </p>
            <p style={{fontSize: '0.875rem', color: '#047857'}}>
              Nível {childData.level} • {childData.points} pontos
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bfdbfe'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem'}}>
              🎯 Objetivos Ativos
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem'}}>
              {childData.goals.length}
            </p>
            <p style={{fontSize: '0.875rem', color: '#1d4ed8'}}>
              Em progresso
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #fed7aa'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#9a3412', marginBottom: '0.5rem'}}>
              📋 Solicitações
            </h3>
            <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.5rem'}}>
              {childData.pendingRequests.filter(req => req.status === 'pending').length}
            </p>
            <p style={{fontSize: '0.875rem', color: '#c2410c'}}>
              Aguardando aprovação
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem'}}>
            📊 Histórico de Transações
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {childData.recentTransactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: transaction.amount > 0 ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${transaction.amount > 0 ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '0.5rem'
              }}>
                <div>
                  <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>{transaction.description}</p>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{formatDate(transaction.timestamp)}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{
                    fontWeight: 'bold',
                    color: transaction.amount > 0 ? '#16a34a' : '#dc2626',
                    marginBottom: '0.25rem'
                  }}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    Saldo: {formatCurrency(transaction.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1rem'}}>
            🎯 Objetivos da Criança
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            {childData.goals.slice(0, 4).map(goal => (
              <div key={goal.id} style={{
                padding: '1rem',
                border: '1px solid #e9d5ff',
                borderRadius: '0.5rem',
                background: '#faf5ff'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem'}}>
                  <span style={{fontSize: '1.5rem'}}>{goal.icon}</span>
                  <div>
                    <h3 style={{fontWeight: '500', marginBottom: '0.25rem'}}>{goal.name}</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${goal.progressPercent}%`,
                    height: '100%',
                    background: '#a855f7',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <p style={{fontSize: '0.875rem', color: '#7c3aed', marginTop: '0.5rem', textAlign: 'right'}}>
                  {goal.progressPercent}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c'}}>
              📋 Solicitações Recentes
            </h2>
            <Link 
              href="/parent/requests"
              style={{...btnStyle, background: '#ea580c', color: 'white', border: '1px solid #ea580c'}}
            >
              Ver Todas
            </Link>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {childData.pendingRequests.slice(-5).map(request => (
              <div key={request.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>{request.description}</p>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    {formatCurrency(request.amount)} • {formatDate(request.timestamp)}
                  </p>
                </div>
                <div style={{textAlign: 'right'}}>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}