'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HybridStorage } from '@/lib/storage/hybrid-storage';

interface FamilyStats {
  totalChildren: number;
  totalSavings: number;
  totalSpent: number;
  totalPoints: number;
  totalBadges: number;
  pendingRequests: number;
  activeGoals: number;
}

interface ChildData {
  id: string;
  name: string;
  balance: number;
  spent: number;
  goals: number;
  pendingRequests: number;
  level: number;
  points: number;
}

interface ParentDashboardData {
  familyStats: FamilyStats;
  children: ChildData[];
}

const dashboardStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
  padding: '1rem'
};

const containerStyle = {
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
  color: '#1e3a8a',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#3730a3',
  fontSize: '1.125rem'
};

const buttonsStyle = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap' as 'wrap'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  background: 'white',
  color: '#374151',
  textDecoration: 'none',
  fontWeight: '500',
  cursor: 'pointer'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
};

const statCardStyle = {
  background: 'white',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const greenCard = { ...statCardStyle, border: '2px solid #bbf7d0' };
const blueCard = { ...statCardStyle, border: '2px solid #bfdbfe' };
const purpleCard = { ...statCardStyle, border: '2px solid #e9d5ff' };
const orangeCard = { ...statCardStyle, border: '2px solid #fed7aa' };

const cardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const greenTitle = { ...cardTitleStyle, color: '#166534' };
const blueTitle = { ...cardTitleStyle, color: '#1e40af' };
const purpleTitle = { ...cardTitleStyle, color: '#6b21a8' };
const orangeTitle = { ...cardTitleStyle, color: '#9a3412' };

const cardValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem'
};

const greenValue = { ...cardValueStyle, color: '#059669' };
const blueValue = { ...cardValueStyle, color: '#2563eb' };
const purpleValue = { ...cardValueStyle, color: '#9333ea' };
const orangeValue = { ...cardValueStyle, color: '#ea580c' };

const cardSubtextStyle = {
  fontSize: '0.875rem'
};

const greenSubtext = { ...cardSubtextStyle, color: '#047857' };
const blueSubtext = { ...cardSubtextStyle, color: '#1d4ed8' };
const purpleSubtext = { ...cardSubtextStyle, color: '#7c3aed' };
const orangeSubtext = { ...cardSubtextStyle, color: '#c2410c' };

const actionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
  margin: '2rem 0'
};

const actionBtnStyle = {
  height: '5rem',
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'white',
  border: '2px solid #e5e7eb',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  color: '#374151',
  fontWeight: '500',
  cursor: 'pointer'
};

const actionEmojiStyle = {
  fontSize: '2rem',
  marginBottom: '0.5rem'
};

export default function ParentDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time synchronization
    const setupRealtimeSync = async () => {
      const { family } = await HybridStorage.getOrCreateFamily();
      const familyId = localStorage.getItem('current_family_id') || 'local-family';
      
      console.log('🔄 Setting up real-time sync for family:', familyId);
      
      // Subscribe to family changes (requests and transactions)
      const unsubscribe = HybridStorage.subscribeToFamilyChanges(familyId, (payload) => {
        console.log('📡 Real-time update received:', payload);
        
        // Refresh dashboard when changes occur
        setTimeout(() => {
          console.log('🔄 Refreshing dashboard due to real-time update...');
          fetchDashboardData();
        }, 500); // Small delay to ensure data is written
      });
      
      return unsubscribe;
    };
    
    // Set up sync and keep fallback polling at a slower rate
    let unsubscribe: (() => void) | null = null;
    setupRealtimeSync().then((unsub) => {
      unsubscribe = unsub;
    });
    
    // Fallback polling every 30 seconds (reduced from 5 seconds since we have real-time)
    const interval = setInterval(() => {
      console.log('🔄 Fallback refresh parent dashboard...');
      fetchDashboardData();
    }, 30000);
    
    return () => {
      clearInterval(interval);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Listen for changes in requests to update pending count
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.includes('child-') && e.key?.includes('-requests')) {
        fetchDashboardData(); // Refresh dashboard when requests change
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also refresh when coming back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Loading parent dashboard data with HybridStorage...');
      
      // Initialize family if needed
      const { family } = await HybridStorage.getOrCreateFamily();
      
      // Get family ID for Supabase queries
      const familyId = localStorage.getItem('current_family_id');
      
      let totalPendingRequests = 0;
      let totalSavings = 0;
      let totalSpent = 0;
      let totalChildren = 0;
      let activeGoals = 0;
      
      // Dynamically find all child IDs (hybrid approach)
      const allKeys = Object.keys(localStorage);
      const childIds = [...new Set([
        ...allKeys.filter(key => key.match(/^child-\d+-requests$/)).map(key => key.match(/^child-(\d+)-/)?.[1]).filter(Boolean),
        ...allKeys.filter(key => key.match(/^child-\d+-transactions$/)).map(key => key.match(/^child-(\d+)-/)?.[1]).filter(Boolean),
        ...allKeys.filter(key => key.match(/^child-\d+-goals$/)).map(key => key.match(/^child-(\d+)-/)?.[1]).filter(Boolean)
      ])];
      
      console.log('📊 Found children IDs:', childIds);
      
      // Calculate stats for each child using HybridStorage
      const childrenData = [];
      
      for (const childId of childIds) {
        totalChildren++;
        
        // Get data using HybridStorage
        const childTransactions = await HybridStorage.getTransactions(childId);
        const childRequests = await HybridStorage.getRequests(childId);
        const childGoals = await HybridStorage.getGoals(childId);
        
        // Calculate balance
        const childBalance = childTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
        totalSavings += childBalance;
        
        // Calculate spending (negative transactions)
        const childSpent = childTransactions
          .filter(t => (t.amount || 0) < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        totalSpent += childSpent;
        
        // Count pending requests
        const pendingCount = childRequests.filter((req: any) => req.status === 'pending').length;
        totalPendingRequests += pendingCount;
        
        // Count active goals
        activeGoals += childGoals.length;
        
        // Add child data
        childrenData.push({
          id: childId,
          name: `Criança ${childId}`,
          balance: childBalance,
          spent: childSpent,
          goals: childGoals.length,
          pendingRequests: pendingCount,
          level: Math.floor(Math.max(childBalance, 0) / 25) + 1,
          points: 340 // Mock for now
        });
        
        console.log(`📈 Child ${childId}: Balance R$ ${childBalance.toFixed(2)}, Pending: ${pendingCount}, Goals: ${childGoals.length}`);
      }

      // If no children data found, add defaults
      if (totalChildren === 0) {
        totalChildren = 1;
        totalSavings = 92.50; // Default for demo child
        totalSpent = 45.50;
        activeGoals = 2;
      }

      // Mock badges and points for family stats
      const totalPoints = totalChildren * 340;
      const totalBadges = totalChildren * 2;

      console.log(`👨‍👩‍👧‍👦 Family totals: Children: ${totalChildren}, Savings: R$ ${totalSavings.toFixed(2)}, Pending: ${totalPendingRequests}`);

      // Create final dashboard data
      const mockData = {
        familyStats: {
          totalChildren,
          totalSavings,
          totalSpent,
          totalPoints,
          totalBadges,
          pendingRequests: totalPendingRequests,
          activeGoals
        },
        children: childrenData
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Parent dashboard fetch error:', error);
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

  const createTestRequests = () => {
    console.log('🧪 Creating test requests...');
    const testRequests = [
      {
        id: Date.now() + 1,
        type: 'purchase',
        amount: 30.50,
        description: 'Teste - testeste',
        category: 'toys',
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        type: 'purchase', 
        amount: 43.30,
        description: 'Teste - teste',
        category: 'toys',
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('child-1-requests', JSON.stringify(testRequests));
    console.log('✅ Test requests created!');
    fetchDashboardData(); // Refresh immediately
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{...dashboardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #3b82f6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#1e40af'}}>Carregando dashboard familiar...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div style={{...dashboardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center'}}>
          <p style={{color: '#dc2626', marginBottom: '1rem'}}>{error || 'Erro ao carregar dados'}</p>
          <button onClick={fetchDashboardData} style={{padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>👨‍👩‍👧‍👦 Dashboard Familiar</h1>
            <p style={subtitleStyle}>Acompanhe a educação financeira das crianças</p>
          </div>
          <div style={buttonsStyle}>
            <button onClick={fetchDashboardData} style={{...btnStyle, border: '1px solid #2563eb', color: '#2563eb'}}>🔄 Atualizar</button>
            <Link href="/analytics" style={{...btnStyle, border: '1px solid #059669', color: '#059669'}}>📊 Analytics</Link>
            <Link href="/gamification" style={{...btnStyle, border: '1px solid #7c3aed', color: '#7c3aed'}}>🏆 Conquistas</Link>
            <Link href="/challenges" style={{...btnStyle, border: '1px solid #dc2626', color: '#dc2626'}}>🎮 Desafios</Link>
            <button onClick={createTestRequests} style={{...btnStyle, border: '1px solid #16a34a', color: '#16a34a'}}>🧪 Teste</button>
            <Link href="/parent/themes" style={btnStyle}>🎨 Temas</Link>
            <Link href="/parent/settings" style={btnStyle}>⚙️ Config</Link>
            <button onClick={handleLogout} style={btnStyle}>Sair</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={statsGridStyle}>
          <div style={greenCard}>
            <div style={greenTitle}>💰 Economia Total</div>
            <div style={greenValue}>{formatCurrency(dashboardData.familyStats.totalSavings)}</div>
            <div style={greenSubtext}>
              {dashboardData.familyStats.totalChildren} {dashboardData.familyStats.totalChildren === 1 ? 'criança' : 'crianças'}
            </div>
          </div>

          <div style={blueCard}>
            <div style={blueTitle}>📊 Gastos do Mês</div>
            <div style={blueValue}>{formatCurrency(dashboardData.familyStats.totalSpent)}</div>
            <div style={blueSubtext}>Total gasto pela família</div>
          </div>

          <div style={purpleCard}>
            <div style={purpleTitle}>⭐ Pontos Familiares</div>
            <div style={purpleValue}>{dashboardData.familyStats.totalPoints}</div>
            <div style={purpleSubtext}>{dashboardData.familyStats.totalBadges} medalhas conquistadas</div>
          </div>

          <div style={orangeCard} onClick={() => router.push('/parent/requests')} onMouseEnter={(e) => e.currentTarget.style.cursor = 'pointer'}>
            <div style={orangeTitle}>📝 Ações Pendentes</div>
            <div style={orangeValue}>{dashboardData.familyStats.pendingRequests}</div>
            <div style={orangeSubtext}>Pedidos aguardando aprovação</div>
          </div>
        </div>

        {/* Individual Children Stats */}
        {dashboardData.children && dashboardData.children.length > 0 && (
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem'}}>
              👶 Saldo Individual das Crianças
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
              {dashboardData.children.map(child => (
                <div key={child.id} style={{
                  ...statCardStyle,
                  border: '2px solid #c7d2fe',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                    <div>
                      <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.25rem'}}>
                        {child.name}
                      </h3>
                      <p style={{fontSize: '0.875rem', color: '#3730a3'}}>
                        Nível {child.level} • {child.points} pontos
                      </p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: child.balance >= 0 ? '#059669' : '#dc2626'}}>
                        {formatCurrency(child.balance)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                        Saldo atual
                      </div>
                    </div>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem'}}>
                    <div style={{textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.375rem'}}>
                      <div style={{fontWeight: 'bold', color: '#dc2626', fontSize: '0.875rem'}}>
                        {formatCurrency(child.spent)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>Gasto</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '0.375rem'}}>
                      <div style={{fontWeight: 'bold', color: '#7c3aed', fontSize: '0.875rem'}}>
                        {child.goals}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>Objetivos</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '0.5rem', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '0.375rem'}}>
                      <div style={{fontWeight: 'bold', color: '#ea580c', fontSize: '0.875rem'}}>
                        {child.pendingRequests}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>Pendentes</div>
                    </div>
                  </div>
                  
                  <div style={{marginTop: '1rem', width: '100%'}}>
                    <Link 
                      href={`/parent/child/${child.id}`}
                      style={{
                        ...btnStyle,
                        width: '100%',
                        background: '#3b82f6',
                        color: 'white',
                        border: '1px solid #3b82f6',
                        fontSize: '0.875rem',
                        display: 'block',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        maxWidth: '100%'
                      }}
                    >
                      👁️ Supervisionar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={actionGridStyle}>
          <Link href="/parent/reports" style={actionBtnStyle}>
            <div style={actionEmojiStyle}>📈</div>
            <span>Relatórios</span>
          </Link>
          <Link href="/parent/analytics" style={actionBtnStyle}>
            <div style={actionEmojiStyle}>📊</div>
            <span>Analytics</span>
          </Link>
          <Link href="/parent/family-goals" style={actionBtnStyle}>
            <div style={actionEmojiStyle}>🏆</div>
            <span>Metas</span>
          </Link>
          <Link href="/family/challenges" style={actionBtnStyle}>
            <div style={actionEmojiStyle}>🏅</div>
            <span>Desafios</span>
          </Link>
        </div>
      </div>
    </div>
  );
}