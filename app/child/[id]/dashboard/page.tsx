'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { HybridStorage } from '@/lib/storage/hybrid-storage';

interface ChildDashboardData {
  child: {
    id: number;
    name: string;
    balance: string;
    level: number;
    points: number;
    avatar: string | null;
  };
  levelProgress: {
    currentLevel: number;
    currentPoints: number;
    pointsForNext: number;
    progressPercent: number;
  };
  goals: Array<{
    id: number;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    progressPercent: number;
    icon: string;
    isCompleted: boolean;
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
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
  }>;
  earnedBadges: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
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
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#86198f',
  textAlign: 'center' as 'center'
};

const subtitleStyle = {
  color: '#a21caf',
  fontSize: '1.125rem',
  textAlign: 'center' as 'center'
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

const outlineBtnStyle = {
  ...btnStyle,
  background: 'white',
  color: '#a855f7',
  border: '1px solid #a855f7'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem'
};

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
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

const progressFillStyle = (percent: number, color: string = '#a855f7') => ({
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

export default function ChildDashboard() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  const [dashboardData, setDashboardData] = useState<ChildDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);

  useEffect(() => {
    if (childId) {
      fetchDashboardData();
    }
  }, [childId]);

  // Listen for storage changes and set up real-time sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.includes(`child-${childId}`) || e.type === 'storage') {
        console.log('🔄 Storage change detected, refreshing child dashboard...');
        setHasUpdates(true);
        // Immediate refresh for transaction changes
        fetchDashboardData();
        setTimeout(() => {
          setHasUpdates(false);
        }, 2000);
      }
    };

    const handleBalanceUpdate = (e) => {
      console.log('💰 Balance update event received:', e.detail);
      if (e.detail.childId == childId) {
        fetchDashboardData();
      }
    };

    // Set up real-time synchronization
    const setupRealtimeSync = async () => {
      const { family } = await HybridStorage.getOrCreateFamily();
      const familyId = localStorage.getItem('current_family_id') || 'local-family';
      
      console.log('🔄 Child: Setting up real-time sync for family:', familyId);
      
      // Subscribe to family changes (especially for this child)
      const unsubscribe = HybridStorage.subscribeToFamilyChanges(familyId, (payload) => {
        console.log('📡 Child: Real-time update received:', payload);
        
        // Check if the update is relevant to this child
        const isRelevant = !payload.key || payload.key.includes(`child-${childId}-`);
        
        if (isRelevant) {
          console.log('🔄 Child: Refreshing dashboard due to real-time update...');
          setHasUpdates(true); // Show "Novidades!" button
          
          // Auto-refresh after a short delay
          setTimeout(() => {
            fetchDashboardData();
          }, 1000);
        }
      });
      
      return unsubscribe;
    };

    // Set up real-time sync
    let unsubscribe: (() => void) | null = null;
    setupRealtimeSync().then((unsub) => {
      unsubscribe = unsub;
    });

    // Listen for storage events from other tabs/windows (backup)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom balance update events (backup)
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    // Also refresh when component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [childId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading dashboard data with HybridStorage...');
      
      // Initialize family if needed
      await HybridStorage.getOrCreateFamily();
      
      // Load data using HybridStorage (Supabase + localStorage fallback)
      const savedGoals = await HybridStorage.getGoals(childId as string);
      const savedRequests = await HybridStorage.getRequests(childId as string);
      const savedTransactions = await HybridStorage.getTransactions(childId as string);
      
      console.log('📊 Loaded data:', { 
        goals: savedGoals.length, 
        requests: savedRequests.length, 
        transactions: savedTransactions.length 
      });
      
      // Validate data
      const validRequests = savedRequests.filter((req: any) => req && (req.id || req.amount));
      const validTransactions = savedTransactions.filter((txn: any) => txn && txn.amount !== undefined);
      
      // Sort transactions by date
      const allTransactions = validTransactions
        .sort((a, b) => new Date(a.timestamp || a.created_at).getTime() - new Date(b.timestamp || b.created_at).getTime());

      // Calculate running balance
      let runningBalance = 0;
      
      const transactionsWithBalance = allTransactions.map((transaction, index) => {
        runningBalance += transaction.amount;
        return {
          ...transaction,
          id: transaction.id || `txn-${Date.now()}-${index}`, // Ensure unique ID
          balanceAfter: runningBalance
        };
      });

      // Current balance is the final running balance
      const currentBalance = runningBalance;
      
      // Simulando dados do dashboard da criança
      const mockData: ChildDashboardData = {
        child: {
          id: parseInt(childId as string),
          name: 'Demo Child',
          balance: currentBalance.toFixed(2),
          level: 4,
          points: 340,
          avatar: null
        },
        levelProgress: {
          currentLevel: 4,
          currentPoints: 340,
          pointsForNext: 160,
          progressPercent: 68
        },
        goals: [
          ...savedGoals.map((goal: any) => ({
            ...goal,
            targetAmount: goal.target_amount || goal.targetAmount,
            currentAmount: goal.current_amount || goal.currentAmount,
            progressPercent: Math.round(((goal.current_amount || goal.currentAmount || 0) / (goal.target_amount || goal.targetAmount || 1)) * 100),
            isCompleted: goal.is_completed || goal.isCompleted || false
          })),
          // Add default goals if none exist
          ...(savedGoals.length === 0 ? [
            {
              id: 1,
              name: 'Nintendo Switch',
              description: 'Quero comprar um Nintendo Switch para jogar com meus amigos',
              targetAmount: 300,
              currentAmount: 125,
              progressPercent: 42,
              icon: '🎮',
              isCompleted: false
            },
            {
              id: 2,
              name: 'Bicicleta Nova',
              description: 'Uma bicicleta para andar no parque',
              targetAmount: 150,
              currentAmount: 89,
              progressPercent: 59,
              icon: '🚲',
              isCompleted: false
            }
          ] : [])
        ],
        recentTransactions: transactionsWithBalance.slice(-5).reverse(),
        pendingRequests: validRequests
          .filter((req: any) => req && req.status) // Show all requests with any status
          .slice(-5) // Show last 5 requests from localStorage
          .map((req: any) => ({
            ...req,
            status: req.status || 'pending' // Ensure status is never undefined
          })),
        earnedBadges: [
          {
            id: 1,
            name: 'Primeiro Poupador',
            description: 'Economizou pela primeira vez',
            icon: '💰',
            earnedAt: '2024-08-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'Meta Cumprida',
            description: 'Completou seu primeiro objetivo',
            icon: '🎯',
            earnedAt: '2024-08-05T00:00:00Z'
          }
        ]
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createTestRequest = async () => {
    console.log('🧪 Creating test purchase request...');
    const testRequest = {
      id: Date.now(),
      type: 'purchase',
      amount: 25.50,
      description: 'Lanche na escola - hambúrguer',
      category: 'food',
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await HybridStorage.addRequest(childId as string, testRequest);
    console.log('✅ Test request created!');
    fetchDashboardData(); // Refresh immediately
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
          <p style={{color: '#86198f'}}>Carregando seu banco...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div style={loadingStyle}>
        <div style={cardStyle}>
          <p style={{color: '#dc2626', marginBottom: '1rem', textAlign: 'center'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchDashboardData} style={primaryBtnStyle}>
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
          <div>
            <h1 style={titleStyle}>🏦 Meu Banco</h1>
            <p style={subtitleStyle}>Olá, {dashboardData.child.name}! 👋</p>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
            <button 
              onClick={() => {
                fetchDashboardData();
                setHasUpdates(false);
              }} 
              style={{
                ...btnStyle, 
                border: `1px solid ${hasUpdates ? '#16a34a' : '#a855f7'}`, 
                color: hasUpdates ? '#16a34a' : '#a855f7',
                background: hasUpdates ? '#f0fdf4' : 'white'
              }}
            >
              {hasUpdates ? '✨ Novidades!' : '🔄 Atualizar'}
            </button>
            <button 
              onClick={createTestRequest} 
              style={{...btnStyle, borderColor: '#16a34a', color: '#16a34a'}}
            >
              🧪 Teste
            </button>
            <button onClick={handleLogout} style={btnStyle}>
              Sair
            </button>
          </div>
        </div>

        {/* Balance + Recent Transactions Card */}
        <div style={{...cardStyle, border: '2px solid #e9d5ff', background: 'linear-gradient(90deg, #fdf4ff, #fce7f3)'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              💰 Meu Saldo
            </h2>
            <span style={{...badgeStyle('#16a34a')}}>
              Nível {dashboardData.child.level}
            </span>
          </div>
          
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1.5rem'}}>
            R$ {dashboardData.child.balance}
          </p>
          
          {/* Level Progress */}
          <div style={{marginBottom: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
              <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#a21caf'}}>
                Progresso para Nível {dashboardData.child.level + 1}
              </span>
              <span style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#a855f7'}}>
                {dashboardData.levelProgress.progressPercent}%
              </span>
            </div>
            <div style={progressBarStyle(dashboardData.levelProgress.progressPercent)}>
              <div style={progressFillStyle(dashboardData.levelProgress.progressPercent, '#a855f7')}></div>
            </div>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
              <span style={{color: '#2563eb', fontWeight: '600'}}>{dashboardData.child.points} pontos</span> • 
              Faltam <span style={{color: '#a855f7', fontWeight: '500'}}>{dashboardData.levelProgress.pointsForNext}</span> para o próximo nível
            </p>
          </div>

          {/* Recent Transactions Section */}
          <div style={{borderTop: '1px solid #e9d5ff', paddingTop: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af'}}>
                📊 Extrato Recente
              </h3>
              <button 
                onClick={() => router.push(`/child/${childId}/spending`)}
                style={{...outlineBtnStyle, fontSize: '0.75rem', padding: '0.5rem 1rem', color: '#1e40af', borderColor: '#1e40af'}}
              >
                Ver Extrato Completo
              </button>
            </div>
            <p style={{color: '#2563eb', marginBottom: '1rem', fontSize: '0.875rem'}}>Suas últimas movimentações</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {dashboardData.recentTransactions.slice(0, 3).map(transaction => (
                <div key={transaction.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: transaction.amount > 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${transaction.amount > 0 ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '0.5rem'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{
                      fontSize: '1.25rem',
                      width: '2rem',
                      height: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: transaction.amount > 0 ? '#dcfce7' : '#fee2e2'
                    }}>
                      {transaction.type === 'allowance' ? '💰' : 
                       transaction.type === 'purchase' ? '🛒' :
                       transaction.type === 'goal_deposit' ? '🎯' :
                       transaction.type === 'bonus' ? '⭐' : '💳'}
                    </div>
                    <div>
                      <p style={{fontWeight: '500', fontSize: '0.875rem', color: '#374151'}}>
                        {transaction.description}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        {new Date(transaction.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      color: transaction.amount > 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p style={{
                      fontSize: '0.7rem',
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

        {/* Achievements Summary */}
        <div style={{...cardStyle, border: '2px solid #fed7aa'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#9a3412'}}>
              🏆 Conquistas
            </h2>
            <button 
              onClick={() => router.push(`/child/${childId}/achievements`)}
              style={{...outlineBtnStyle, fontSize: '0.75rem', padding: '0.5rem 1rem', color: '#9a3412', borderColor: '#9a3412'}}
            >
              Ver Todas
            </button>
          </div>
          <p style={{color: '#c2410c', marginBottom: '1.5rem'}}>Seu progresso e medalhas</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              textAlign: 'center'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem'}}>
                ⭐ Pontos
              </h3>
              <p style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.25rem'}}>
                {dashboardData.child.points}
              </p>
              <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Total acumulado</p>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #fde047',
              background: '#fefce8',
              textAlign: 'center'
            }}>
              <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#a16207', marginBottom: '0.5rem'}}>
                🏅 Medalhas
              </h3>
              <p style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#eab308', marginBottom: '0.25rem'}}>
                {dashboardData.earnedBadges.length}
              </p>
              <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Conquistadas</p>
            </div>
          </div>
        </div>


        {/* Pending Requests */}
        <div style={{...cardStyle, border: '2px solid #fde047'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#a16207'}}>
              📋 Solicitações
            </h2>
            <button 
              onClick={() => router.push(`/child/${childId}/requests`)}
              style={{...outlineBtnStyle, fontSize: '0.75rem', padding: '0.5rem 1rem', color: '#a16207', borderColor: '#a16207'}}
            >
              Ver Todas
            </button>
          </div>
          <p style={{color: '#ca8a04', marginBottom: '1.5rem'}}>Seus pedidos para usar o dinheiro</p>
          
          {dashboardData.pendingRequests.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {dashboardData.pendingRequests.map(request => (
                <div key={request.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: request.status === 'approved' ? '#f0fdf4' : 
                             request.status === 'rejected' ? '#fef2f2' : '#fefce8',
                  border: `1px solid ${request.status === 'approved' ? '#bbf7d0' : 
                                      request.status === 'rejected' ? '#fecaca' : '#fde047'}`,
                  borderRadius: '0.5rem'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{
                      fontSize: '1.25rem',
                      width: '2rem',
                      height: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: request.status === 'approved' ? '#dcfce7' : 
                                 request.status === 'rejected' ? '#fee2e2' : '#fef3c7'
                    }}>
                      {request.status === 'approved' ? '✅' : 
                       request.status === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <div>
                      <p style={{fontWeight: '500', fontSize: '0.875rem', color: '#374151'}}>
                        {request.description}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        R$ {request.amount.toFixed(2)} • {new Date(request.timestamp).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span style={{...badgeStyle(
                      request.status === 'approved' ? '#16a34a' : 
                      request.status === 'rejected' ? '#dc2626' : '#eab308'
                    )}}>
                      {(() => {
                        const status = String(request.status || 'pending').toLowerCase().trim();
                        if (status === 'approved') return '✅ Aprovado';
                        if (status === 'rejected') return '❌ Rejeitado';
                        if (status === 'pending') return '⏳ Pendente';
                        return `❓ ${status}`;
                      })()}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                style={{...primaryBtnStyle, width: '100%', height: '2.5rem', fontSize: '0.875rem', marginTop: '0.5rem'}} 
                onClick={() => router.push(`/child/${childId}/purchase-request`)}
              >
                💳 Usar Meu Dinheiro
              </button>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <div style={{fontSize: '3rem', marginBottom: '0.75rem'}}>📋</div>
              <p style={{fontSize: '1rem', color: '#6b7280', marginBottom: '1rem'}}>Nenhuma solicitação ainda</p>
              <button 
                style={{...primaryBtnStyle, height: '2.5rem', fontSize: '0.875rem', padding: '0 1rem'}}
                onClick={() => router.push(`/child/${childId}/purchase-request`)}
              >
                💳 Usar Meu Dinheiro
              </button>
            </div>
          )}
        </div>

        {/* Quick Goals Preview */}
        <div style={{...cardStyle, border: '2px solid #e9d5ff'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f'}}>
              🎯 Meus Objetivos
            </h2>
            <button 
              onClick={() => router.push(`/child/${childId}/goals`)}
              style={{...outlineBtnStyle, fontSize: '0.75rem', padding: '0.5rem 1rem'}}
            >
              Ver Todos
            </button>
          </div>
          
          {dashboardData.goals.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {dashboardData.goals.slice(0, 2).map(goal => (
                <div key={goal.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid #e9d5ff',
                  borderRadius: '0.5rem',
                  background: '#faf5ff'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <span style={{fontSize: '1.5rem'}}>{goal.icon}</span>
                    <div>
                      <p style={{fontWeight: '500', fontSize: '0.875rem'}}>{goal.name}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#a855f7'}}>
                      {goal.progressPercent}%
                    </p>
                  </div>
                </div>
              ))}
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <button 
                  onClick={() => router.push(`/child/${childId}/goals/new`)}
                  style={{...primaryBtnStyle, width: '100%', height: '2.5rem', fontSize: '0.875rem'}}
                >
                  + Novo Objetivo
                </button>
                {dashboardData.goals.length > 0 && (
                  <button 
                    onClick={() => router.push(`/child/${childId}/goals`)}
                    style={{...outlineBtnStyle, width: '100%', height: '2.5rem', fontSize: '0.875rem'}}
                  >
                    💰 Depositar nos Objetivos
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '1rem'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🎯</div>
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>Nenhum objetivo ainda</p>
              <button 
                style={{...primaryBtnStyle, height: '2.5rem', fontSize: '0.875rem', padding: '0 1rem'}}
                onClick={() => router.push(`/child/${childId}/goals/new`)}
              >
                + Criar Primeiro Objetivo
              </button>
            </div>
          )}
        </div>


        {/* Reports Section */}
        <div style={{...cardStyle, border: '2px solid #e5e7eb'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151'}}>
              📊 Relatórios
            </h2>
            <button 
              onClick={() => router.push(`/child/${childId}/spending`)}
              style={{...outlineBtnStyle, fontSize: '0.75rem', padding: '0.5rem 1rem'}}
            >
              Ver Todos
            </button>
          </div>
          <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>Acompanhe seus dados financeiros</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            {/* Gastos Este Mês */}
            <div 
              onClick={() => router.push(`/child/${childId}/spending`)}
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #fecaca',
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.1)';
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#dc2626'}}>📉 Gastos</h3>
                <div style={{
                  fontSize: '0.7rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: '#dc2626', 
                  color: 'white'
                }}>
                  +18% ↑
                </div>
              </div>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.25rem'}}>
                R$ 45.50
              </p>
              <p style={{fontSize: '0.75rem', color: '#7f1d1d'}}>Este mês vs R$ 38.75 anterior</p>
            </div>

            {/* Categoria Top */}
            <div 
              onClick={() => router.push(`/child/${childId}/spending`)}
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #fed7aa',
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.1)';
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#ea580c'}}>🥇 Top Categoria</h3>
                <div style={{fontSize: '1.25rem'}}>🍕</div>
              </div>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c', marginBottom: '0.25rem'}}>
                Comida
              </p>
              <p style={{fontSize: '0.75rem', color: '#9a3412'}}>R$ 20.50 • 45% dos gastos</p>
            </div>

            {/* Categoria em Alta */}
            <div 
              onClick={() => router.push(`/child/${childId}/spending`)}
              style={{
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #ddd6fe',
                background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.1)';
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#7c3aed'}}>📈 Categoria em Alta</h3>
                <div style={{
                  fontSize: '0.7rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: '#f59e0b', 
                  color: 'white'
                }}>
                  +35% ↗️
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <span style={{fontSize: '1.5rem'}}>📚</span>
                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed'}}>Educação</span>
              </div>
              <p style={{fontSize: '0.75rem', color: '#6b46c1'}}>R$ 15.00 vs R$ 11.10 mês anterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}