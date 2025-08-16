'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface PurchaseRequest {
  id: number;
  type: string;
  amount: number;
  description: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  createdAt?: string;
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

const primaryBtnStyle = {
  ...btnStyle,
  background: '#a855f7',
  color: 'white',
  border: '1px solid #a855f7'
};

const badgeStyle = (color: string) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '1rem',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'white',
  background: color
});

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default function ChildRequestsPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [childId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Load custom requests from localStorage
      const savedRequests = JSON.parse(localStorage.getItem(`child-${childId}-requests`) || '[]');
      
      // Mock existing requests
      const mockRequests: PurchaseRequest[] = [
        {
          id: 1,
          type: 'purchase',
          amount: 15,
          description: 'Quero comprar um livro novo',
          status: 'pending',
          timestamp: '2024-08-12T09:00:00Z'
        },
        {
          id: 2,
          type: 'goal_withdrawal',
          amount: 50,
          description: 'Usar dinheiro do objetivo Nintendo Switch',
          status: 'approved',
          timestamp: '2024-08-11T16:00:00Z'
        },
        {
          id: 3,
          type: 'purchase',
          amount: 8,
          description: 'Sorvete com amigos',
          status: 'rejected',
          timestamp: '2024-08-10T14:00:00Z'
        }
      ];

      // Combine saved and mock requests, with saved requests first
      const allRequests = [...savedRequests, ...mockRequests];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequests(allRequests);
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#16a34a';
      case 'rejected': return '#dc2626';
      case 'pending': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
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
          <p style={{color: '#a855f7'}}>Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

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
            <h1 style={titleStyle}>📋 Minhas Solicitações</h1>
            <p style={subtitleStyle}>Histórico dos seus pedidos para usar o dinheiro</p>
          </div>
          <button
            onClick={() => router.push(`/child/${childId}/purchase-request`)}
            style={primaryBtnStyle}
          >
            💳 Usar Meu Dinheiro
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
          <div style={{...cardStyle, border: '2px solid #fde047'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#a16207', marginBottom: '0.5rem'}}>
              ⏳ Pendentes
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#eab308'}}>
              {pendingRequests.length}
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #bbf7d0'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem'}}>
              ✅ Aprovadas
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>
              {approvedRequests.length}
            </p>
          </div>

          <div style={{...cardStyle, border: '2px solid #fecaca'}}>
            <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.5rem'}}>
              ❌ Rejeitadas
            </h3>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626'}}>
              {rejectedRequests.length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem'}}>
              📝 Todas as Solicitações ({requests.length})
            </h2>
            
            {requests.map(request => (
              <div key={request.id} style={{
                ...cardStyle,
                background: request.status === 'approved' ? '#f0fdf4' : 
                           request.status === 'rejected' ? '#fef2f2' : '#fefce8',
                border: `2px solid ${request.status === 'approved' ? '#bbf7d0' : 
                                   request.status === 'rejected' ? '#fecaca' : '#fde047'}`
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                      <div style={{
                        fontSize: '1.25rem',
                        width: '2.5rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: request.status === 'approved' ? '#dcfce7' : 
                                   request.status === 'rejected' ? '#fee2e2' : '#fef3c7'
                      }}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div style={{flex: 1}}>
                        <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>
                          {request.description}
                        </h3>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                          <span>R$ {request.amount.toFixed(2)}</span>
                          <span>•</span>
                          <span>{formatDate(request.timestamp)}</span>
                          <span>•</span>
                          <span>{formatTime(request.timestamp)}</span>
                          {request.category && (
                            <>
                              <span>•</span>
                              <span>{request.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span style={{...badgeStyle(getStatusColor(request.status))}}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', padding: '3rem'}}>
              <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📋</div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.5rem'}}>
                Nenhuma solicitação ainda
              </h3>
              <p style={{color: '#6b7280', marginBottom: '2rem'}}>
                Quando você quiser usar seu dinheiro, faça uma solicitação aqui!
              </p>
              <button
                onClick={() => router.push(`/child/${childId}/purchase-request`)}
                style={primaryBtnStyle}
              >
                💳 Fazer Primeira Solicitação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}