'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseRequest {
  id: number;
  type: string;
  amount: number;
  description: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  createdAt?: string;
  parentComment?: string;
  childId?: number;
}

export default function ParentRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  // Styling
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
  
  const primaryBtnStyle = {
    ...btnStyle,
    background: '#16a34a',
    color: 'white',
    border: '1px solid #16a34a'
  };
  
  const dangerBtnStyle = {
    ...btnStyle,
    background: '#dc2626',
    color: 'white',
    border: '1px solid #dc2626'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical' as 'vertical'
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Load requests from all children
      const allRequests: PurchaseRequest[] = [];
      
      // Dynamically find all child IDs that have requests in localStorage
      const allKeys = Object.keys(localStorage);
      const childRequestsKeys = allKeys.filter(key => key.match(/^child-(\d+)-requests$/));
      
      console.log('Found child request keys:', childRequestsKeys);
      
      childRequestsKeys.forEach(key => {
        const match = key.match(/^child-(\d+)-requests$/);
        if (match) {
          const childId = match[1];
          const childRequests = JSON.parse(localStorage.getItem(key) || '[]');
          const childRequestsWithId = childRequests.map((req: any) => ({
            ...req,
            childId: parseInt(childId),
            childName: `Criança ${childId}`
          }));
          console.log(`${key}: ${childRequests.length} total requests`);
          allRequests.push(...childRequestsWithId);
        }
      });
      
      // Sort by timestamp (newest first)
      allRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setRequests(allRequests);
    } catch (error) {
      console.error('Fetch requests error:', error);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: PurchaseRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
    setShowDialog(true);
  };

  const processRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      // Update request status in localStorage
      const childId = selectedRequest.childId;
      const childRequests = JSON.parse(localStorage.getItem(`child-${childId}-requests`) || '[]');
      
      console.log('Processing request:', selectedRequest);
      console.log('Child requests before update:', childRequests);
      
      const updatedRequests = childRequests.map((req: PurchaseRequest) => {
        if (req.id === selectedRequest.id) {
          console.log(`Updating request ${req.id} from ${req.status} to ${actionType}`);
          return {
            ...req,
            status: actionType === 'approve' ? 'approved' : 'rejected',
            parentComment: comment.trim(),
            processedAt: new Date().toISOString()
          };
        }
        return req;
      });
      
      console.log('Child requests after update:', updatedRequests);
      
      localStorage.setItem(`child-${childId}-requests`, JSON.stringify(updatedRequests));
      console.log('Updated requests saved to localStorage');
      
      // Verify the save worked
      const verifyRequests = JSON.parse(localStorage.getItem(`child-${childId}-requests`) || '[]');
      console.log('Verification - requests in localStorage:', verifyRequests);
      
      // Force storage event to notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', {
        key: `child-${childId}-requests`,
        newValue: JSON.stringify(updatedRequests)
      }));
      
      // If approved, create transaction
      console.log('🔍 Checking if should create transaction:', {
        actionType: actionType,
        isApprove: actionType === 'approve',
        actionTypeType: typeof actionType
      });
      
      if (actionType === 'approve') {
        const isAdvance = selectedRequest.type === 'advance' || selectedRequest.isAdvance;
        
        console.log('💰 Creating transaction for approved request:', {
          requestId: selectedRequest.id,
          requestType: selectedRequest.type,
          requestAmount: selectedRequest.amount,
          isAdvance: isAdvance,
          description: selectedRequest.description
        });
        
        const newTransaction = {
          id: Date.now() + Math.random(), // Ensure unique ID
          type: isAdvance ? 'advance_approved' : 'purchase_approved',
          amount: isAdvance ? selectedRequest.amount : -selectedRequest.amount, // Advance adds money, purchase deducts
          description: isAdvance 
            ? `Empréstimo aprovado: R$ ${selectedRequest.amount.toFixed(2)}` 
            : `Compra aprovada: ${selectedRequest.description}`,
          timestamp: new Date().toISOString(),
          isDebt: isAdvance // Mark as debt to be deducted later
        };
        
        console.log('💳 New transaction created:', newTransaction);
        
        const existingTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
        console.log('💾 Existing transactions before adding new one:', existingTransactions);
        
        existingTransactions.push(newTransaction);
        localStorage.setItem(`child-${childId}-transactions`, JSON.stringify(existingTransactions));
        
        console.log('💾 Updated transactions saved to localStorage:', existingTransactions);
        
        // Verify the save worked
        const verifyTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
        console.log('✅ Verification - transactions in localStorage:', verifyTransactions);
        
        // Force storage event to notify other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: `child-${childId}-transactions`,
          newValue: JSON.stringify(existingTransactions),
          oldValue: JSON.stringify(existingTransactions.slice(0, -1))
        }));
        
        // Also dispatch a custom event
        window.dispatchEvent(new CustomEvent('balanceUpdated', {
          detail: { childId, newBalance: 'recalculate' }
        }));
        
        console.log('📡 Storage event dispatched for transactions');
        
        // If it's an advance, also create a debt record
        if (isAdvance) {
          const existingDebts = JSON.parse(localStorage.getItem(`child-${childId}-debts`) || '[]');
          const newDebt = {
            id: Date.now(),
            amount: selectedRequest.amount,
            description: selectedRequest.description,
            createdAt: new Date().toISOString(),
            status: 'pending'
          };
          existingDebts.push(newDebt);
          localStorage.setItem(`child-${childId}-debts`, JSON.stringify(existingDebts));
        }
      }
      
      await fetchRequests(); // Refresh the list
      setShowDialog(false);
      setSelectedRequest(null);
      setComment('');
    } catch (error) {
      console.error('Process request error:', error);
      setError('Erro ao processar pedido');
    } finally {
      setProcessing(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

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
          <p style={{color: '#1e40af'}}>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button
              onClick={() => router.push('/parent/dashboard')}
              style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
            >
              ← Voltar
            </button>
            <div>
              <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem'}}>📋 Pedidos para Usar Dinheiro</h1>
              <p style={{color: '#3730a3', fontSize: '1.125rem'}}>Gerencie os pedidos dos seus filhos</p>
            </div>
          </div>
        </div>

        {error && (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', color: '#dc2626'}}>
              <p style={{marginBottom: '1rem'}}>{error}</p>
              <button onClick={fetchRequests} style={primaryBtnStyle}>
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Pending Requests */}
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#ea580c'}}>
            ⏳ Pedidos Pendentes ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div style={cardStyle}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
                <p style={{color: '#6b7280'}}>Nenhum pedido pendente no momento</p>
              </div>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem'}}>
              {pendingRequests.map(request => {
                const isAdvance = request.type === 'advance' || request.isAdvance;
                return (
                  <div key={request.id} style={{
                    ...cardStyle, 
                    border: `2px solid ${isAdvance ? '#f59e0b' : '#fed7aa'}`,
                    background: isAdvance ? 'linear-gradient(135deg, #fef3c7, #fed7aa)' : 'white'
                  }}>
                    {isAdvance && (
                      <div style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        🏦 PEDIDO DE EMPRÉSTIMO
                      </div>
                    )}
                    
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                        <div style={{flex: 1}}>
                          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem'}}>
                            {request.description}
                          </h3>
                          <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                            Pedido por Criança {request.childId} • {formatDate(request.timestamp)}
                          </p>
                        </div>
                        <div style={{textAlign: 'right', minWidth: '120px'}}>
                          <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: isAdvance ? '#f59e0b' : '#16a34a', marginBottom: '0.5rem'}}>
                            R$ {request.amount.toFixed(2)}
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </div>
                    
                    {isAdvance && (
                      <div style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <p style={{fontSize: '0.875rem', color: '#92400e', fontWeight: '500'}}>
                          ⚠️ Este valor será descontado da próxima mesada da criança
                        </p>
                      </div>
                    )}
                    
                    <div style={{marginBottom: '1rem'}}>
                      {request.category && (
                        <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                          <strong>Categoria:</strong> {request.category}
                        </p>
                      )}
                    </div>
                    
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        onClick={() => handleAction(request, 'approve')}
                        style={{...primaryBtnStyle, flex: 1}}
                      >
                        ✅ Aprovar
                      </button>
                      <button
                        onClick={() => handleAction(request, 'reject')}
                        style={{...dangerBtnStyle, flex: 1}}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#6b7280'}}>
              📋 Histórico ({processedRequests.length})
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {processedRequests.map(request => (
                <div key={request.id} style={{...cardStyle, background: '#f9fafb'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <h3 style={{fontWeight: '500', marginBottom: '0.25rem'}}>{request.description}</h3>
                      <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                        Criança {request.childId} • {formatDate(request.timestamp)}
                      </p>
                      {request.parentComment && (
                        <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                          <strong>Seu comentário:</strong> {request.parentComment}
                        </p>
                      )}
                    </div>
                    <div style={{textAlign: 'right', minWidth: '120px'}}>
                      <div style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>R$ {request.amount.toFixed(2)}</div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Dialog */}
        {showDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: actionType === 'approve' ? '#16a34a' : '#dc2626'}}>
                {actionType === 'approve' ? '✅ Aprovar Pedido' : '❌ Rejeitar Pedido'}
              </h2>
              
              {selectedRequest && (
                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                  <strong>Criança {selectedRequest.childId}</strong> quer usar{' '}
                  <strong>R$ {selectedRequest.amount.toFixed(2)}</strong> para{' '}
                  <strong>{selectedRequest.description}</strong>
                </p>
              )}
              
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                  Comentário {actionType === 'reject' ? '(obrigatório)' : '(opcional)'}
                </label>
                <textarea
                  placeholder={
                    actionType === 'approve' 
                      ? "Ex: Parabéns por poupar! Pode comprar." 
                      : "Ex: Vamos economizar um pouco mais primeiro."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{display: 'flex', gap: '0.75rem'}}>
                <button 
                  onClick={() => setShowDialog(false)}
                  style={{...btnStyle, flex: 1}}
                >
                  Cancelar
                </button>
                <button
                  onClick={processRequest}
                  disabled={processing || (actionType === 'reject' && !comment.trim())}
                  style={{
                    ...(actionType === 'approve' ? primaryBtnStyle : dangerBtnStyle),
                    flex: 1,
                    opacity: (processing || (actionType === 'reject' && !comment.trim())) ? 0.6 : 1,
                    cursor: (processing || (actionType === 'reject' && !comment.trim())) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processando...' : actionType === 'approve' ? 'Aprovar' : 'Rejeitar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}