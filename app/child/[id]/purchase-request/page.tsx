'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '32rem',
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

const outlineBtnStyle = {
  ...btnStyle,
  background: 'white',
  color: '#a855f7',
  border: '1px solid #a855f7'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const errorStyle = {
  padding: '1rem',
  color: '#dc2626',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '0.375rem',
  marginBottom: '1rem'
};

const formGroupStyle = {
  marginBottom: '1.5rem'
};

const successContainerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const successCardStyle = {
  ...cardStyle,
  width: '100%',
  maxWidth: '28rem',
  textAlign: 'center' as 'center'
};

export default function PurchaseRequestPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [formData, setFormData] = useState({
    item: '',
    amount: '',
    category: '',
    description: '',
    requestType: 'purchase' // 'purchase' or 'advance'
  });
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(200); // Example monthly limit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([
    { value: 'toys', label: '🧸 Brinquedos', color: '#FF6B6B' },
    { value: 'clothes', label: '👕 Roupas', color: '#4ECDC4' },
    { value: 'books', label: '📚 Livros', color: '#45B7D1' },
    { value: 'games', label: '🎮 Jogos', color: '#96CEB4' },
    { value: 'snacks', label: '🍭 Doces', color: '#FECA57' },
    { value: 'others', label: '📦 Outros', color: '#A0A0A0' }
  ]);

  useEffect(() => {
    loadBalanceAndLimits();
    loadCategories();
    
    // Listen for changes in categories
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spendingCategories') {
        console.log('Categories changed, reloading...');
        loadCategories();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [childId]);

  const loadCategories = () => {
    // Load categories from parent settings
    const savedCategories = JSON.parse(localStorage.getItem('spendingCategories') || '[]');
    console.log('Loading categories from localStorage:', savedCategories);
    
    if (savedCategories.length > 0) {
      // Convert parent categories format to child format
      const convertedCategories = savedCategories.map((cat: any) => ({
        value: cat.id,
        label: `${cat.icon} ${cat.name}`,
        color: '#6B7280' // Default color
      }));
      
      // Add "Others" category if not present
      const hasOthers = convertedCategories.some((cat: any) => cat.value === 'others');
      if (!hasOthers) {
        convertedCategories.push({ value: 'others', label: '📦 Outros', color: '#A0A0A0' });
      }
      
      console.log('Converted categories:', convertedCategories);
      setCategories(convertedCategories);
    } else {
      console.log('No saved categories found, using default categories');
    }
  };

  const loadBalanceAndLimits = () => {
    // Calculate current balance
    const savedTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
    const baseTransactions = [
      { amount: 25, timestamp: '2024-08-12T10:00:00Z' },
      { amount: -12.50, timestamp: '2024-08-11T14:30:00Z' },
      { amount: 25, timestamp: '2024-08-05T10:00:00Z' },
      { amount: 5, timestamp: '2024-08-03T18:00:00Z' },
      { amount: 50, timestamp: '2024-08-01T10:00:00Z' }
    ];
    
    const allTransactions = [...baseTransactions, ...savedTransactions];
    const balance = allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    setCurrentBalance(balance);

    // Calculate monthly spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= startOfMonth && transaction.amount < 0;
    });
    
    const totalMonthlySpent = monthlyTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    setMonthlySpent(totalMonthlySpent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestAmount = parseFloat(formData.amount);
      
      // Validation 1: Check if amount is valid
      if (requestAmount <= 0) {
        setError('Por favor, insira um valor maior que zero');
        return;
      }

      // Validation 2: Check if amount exceeds current balance (only for regular purchases)
      if (formData.requestType === 'purchase' && requestAmount > currentBalance) {
        setError(`Você não tem saldo suficiente. Saldo atual: R$ ${currentBalance.toFixed(2)}`);
        return;
      }

      // Validation 3: Check monthly limit
      const newMonthlyTotal = monthlySpent + requestAmount;
      if (newMonthlyTotal > monthlyLimit) {
        const remainingLimit = monthlyLimit - monthlySpent;
        setError(`Este pedido ultrapassaria seu limite mensal. Limite restante: R$ ${remainingLimit.toFixed(2)}`);
        return;
      }

      // Validation 4: Check for reasonable request amounts (above R$ 100 requires special justification)
      if (requestAmount > 100 && (!formData.description || formData.description.length < 20)) {
        setError('Para pedidos acima de R$ 100,00, é necessário explicar melhor o motivo (mínimo 20 caracteres)');
        return;
      }

      // Validation 5: For advances, require strong justification and limit amount
      if (formData.requestType === 'advance') {
        if (!formData.description || formData.description.length < 30) {
          setError('Para pedir dinheiro emprestado, você precisa explicar muito bem o motivo (mínimo 30 caracteres)');
          return;
        }
        if (requestAmount > 50) {
          setError('O valor máximo para empréstimo é R$ 50,00');
          return;
        }
      }

      const newRequest = {
        id: Date.now(),
        type: formData.requestType,
        amount: requestAmount,
        description: formData.requestType === 'advance' 
          ? `EMPRÉSTIMO: ${formData.description}` 
          : `${formData.item}${formData.description ? ` - ${formData.description}` : ''}`,
        category: formData.category || 'others',
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isAdvance: formData.requestType === 'advance'
      };

      // Get existing requests from localStorage
      const existingRequests = JSON.parse(localStorage.getItem(`child-${childId}-requests`) || '[]');
      existingRequests.push(newRequest);
      
      // Save back to localStorage
      localStorage.setItem(`child-${childId}-requests`, JSON.stringify(existingRequests));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/child/${childId}/dashboard`);
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      setError('Erro ao salvar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div style={successContainerStyle}>
        <div style={successCardStyle}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✅</div>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem'}}>
            Pedido Enviado!
          </h2>
          <p style={{color: '#6b7280', marginBottom: '1rem'}}>
            Seu pedido para usar seu dinheiro foi enviado para seus pais. Você receberá uma resposta em breve!
          </p>
          <div style={{fontSize: '0.875rem', color: '#9ca3af'}}>
            Redirecionando em instantes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <div style={headerStyle}>
          <button
            onClick={() => router.push(`/child/${childId}/dashboard`)}
            style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>💳 Usar Meu Dinheiro</h1>
            <p style={subtitleStyle}>Peça para usar seu dinheiro para comprar algo</p>
          </div>
        </div>

        {/* Balance and Limits Info */}
        <div style={{...cardStyle, border: '2px solid #bbf7d0', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)'}}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#166534', marginBottom: '1rem'}}>
            💰 Seu Status Financeiro
          </h3>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
            <div style={{textAlign: 'center'}}>
              <p style={{fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.25rem'}}>Saldo Disponível</p>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d'}}>R$ {currentBalance.toFixed(2)}</p>
            </div>
            
            <div style={{textAlign: 'center'}}>
              <p style={{fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.25rem'}}>Gasto este Mês</p>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: monthlySpent > monthlyLimit * 0.8 ? '#dc2626' : '#15803d'}}>
                R$ {monthlySpent.toFixed(2)}
              </p>
            </div>
            
            <div style={{textAlign: 'center'}}>
              <p style={{fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.25rem'}}>Limite Mensal</p>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d'}}>R$ {monthlyLimit.toFixed(2)}</p>
            </div>
          </div>
          
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
              <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>Uso do Limite Mensal</span>
              <span style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#16a34a'}}>
                {Math.round((monthlySpent / monthlyLimit) * 100)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((monthlySpent / monthlyLimit) * 100, 100)}%`,
                height: '100%',
                background: monthlySpent > monthlyLimit * 0.8 ? '#dc2626' : '#16a34a',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <p style={{fontSize: '0.875rem', color: '#16a34a', textAlign: 'center'}}>
            Você ainda pode gastar R$ {Math.max(0, Math.min(currentBalance, monthlyLimit - monthlySpent)).toFixed(2)} este mês
          </p>
        </div>

        <div style={cardStyle}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem'}}>
              O que você quer comprar?
            </h2>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Preencha as informações abaixo para usar seu dinheiro
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}

            {/* Request Type Selection */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Tipo de Pedido *</label>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <button
                  type="button"
                  onClick={() => handleInputChange('requestType', 'purchase')}
                  style={{
                    ...btnStyle,
                    background: formData.requestType === 'purchase' ? '#a855f7' : 'white',
                    color: formData.requestType === 'purchase' ? 'white' : '#374151',
                    border: `2px solid ${formData.requestType === 'purchase' ? '#a855f7' : '#d1d5db'}`,
                    flex: 1,
                    padding: '1rem'
                  }}
                >
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>💳</div>
                    <div style={{fontWeight: 'bold'}}>Usar Meu Dinheiro</div>
                    <div style={{fontSize: '0.75rem', opacity: 0.8}}>Comprar com seu saldo</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('requestType', 'advance')}
                  style={{
                    ...btnStyle,
                    background: formData.requestType === 'advance' ? '#f59e0b' : 'white',
                    color: formData.requestType === 'advance' ? 'white' : '#374151',
                    border: `2px solid ${formData.requestType === 'advance' ? '#f59e0b' : '#d1d5db'}`,
                    flex: 1,
                    padding: '1rem'
                  }}
                >
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🏦</div>
                    <div style={{fontWeight: 'bold'}}>Pedir Emprestado</div>
                    <div style={{fontSize: '0.75rem', opacity: 0.8}}>Max. R$ 50,00</div>
                  </div>
                </button>
              </div>
            </div>

            {formData.requestType === 'purchase' ? (
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="item">Nome do item *</label>
                <input
                  id="item"
                  placeholder="Ex: Bicicleta vermelha, Livro do Harry Potter..."
                  value={formData.item}
                  onChange={(e) => handleInputChange('item', e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            ) : (
              <div style={{...formGroupStyle, padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '1.25rem'}}>⚠️</span>
                  <h4 style={{fontSize: '1rem', fontWeight: 'bold', color: '#92400e'}}>Pedido de Empréstimo</h4>
                </div>
                <p style={{fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem'}}>
                  Você está pedindo dinheiro emprestado. Lembre-se:
                </p>
                <ul style={{fontSize: '0.875rem', color: '#92400e', paddingLeft: '1rem', margin: 0}}>
                  <li>Esse valor será descontado da sua próxima mesada</li>
                  <li>Máximo de R$ 50,00 por empréstimo</li>
                  <li>Explique muito bem por que precisa desse dinheiro</li>
                </ul>
              </div>
            )}

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="amount">
                {formData.requestType === 'advance' ? 'Valor do Empréstimo (R$) *' : 'Preço (R$) *'}
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                max={formData.requestType === 'advance' ? '50' : undefined}
                placeholder={formData.requestType === 'advance' ? 'Ex: 25.00 (máx. 50.00)' : 'Ex: 25.50'}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="category">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={inputStyle}
              >
                <option value="">Escolha uma categoria</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="description">
                {formData.requestType === 'advance' 
                  ? 'Por que você precisa desse empréstimo? *' 
                  : 'Por que você quer isso?'}
              </label>
              <textarea
                id="description"
                placeholder={formData.requestType === 'advance'
                  ? 'Explique detalhadamente por que você precisa desse dinheiro emprestado (mínimo 30 caracteres)...'
                  : 'Conte para seus pais por que você quer comprar isso...'
                }
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={formData.requestType === 'advance' ? 4 : 3}
                required={formData.requestType === 'advance'}
                style={{...inputStyle, minHeight: formData.requestType === 'advance' ? '100px' : '80px', resize: 'vertical'}}
              />
              {formData.requestType === 'advance' && (
                <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                  {formData.description.length}/30 caracteres (mínimo para empréstimo)
                </p>
              )}
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                type="button"
                onClick={() => router.push(`/child/${childId}/dashboard`)}
                style={{...outlineBtnStyle, flex: 1}}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || (formData.requestType === 'purchase' && !formData.item) || !formData.amount || (formData.requestType === 'advance' && !formData.description)}
                style={{
                  ...primaryBtnStyle, 
                  flex: 1,
                  background: formData.requestType === 'advance' ? '#f59e0b' : '#a855f7',
                  border: `1px solid ${formData.requestType === 'advance' ? '#f59e0b' : '#a855f7'}`,
                  opacity: (loading || (formData.requestType === 'purchase' && !formData.item) || !formData.amount || (formData.requestType === 'advance' && !formData.description)) ? 0.6 : 1,
                  cursor: (loading || (formData.requestType === 'purchase' && !formData.item) || !formData.amount || (formData.requestType === 'advance' && !formData.description)) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading 
                  ? 'Enviando...' 
                  : formData.requestType === 'advance' 
                    ? '🏦 Solicitar Empréstimo' 
                    : '💳 Fazer Pedido'
                }
              </button>
            </div>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            💡 Dicas para um bom pedido
          </h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Seja específico sobre o que você quer</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Explique por que você quer isso</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Verifique se o preço está correto</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280'}}>✅ Seja educado e respeitoso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}