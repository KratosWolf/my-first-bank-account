'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  icon: string;
  isCompleted: boolean;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

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

const successStyle = {
  padding: '1rem',
  color: '#16a34a',
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '0.375rem',
  marginBottom: '1rem'
};

const formGroupStyle = {
  marginBottom: '1.5rem'
};

const progressBarStyle = {
  width: '100%',
  height: '16px',
  background: '#e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden' as 'hidden'
};

const progressFillStyle = (percent: number, color: string = '#a855f7') => ({
  width: `${percent}%`,
  height: '100%',
  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
  borderRadius: '8px',
  transition: 'width 0.3s ease'
});

export default function GoalDepositPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  const goalId = params.goalId;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [childBalance, setChildBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGoalAndBalance();
  }, [goalId]);

  const calculateCurrentBalance = () => {
    // Load all transactions from localStorage
    const savedTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
    
    // Mock base transactions
    const baseTransactions = [
      {
        id: 1,
        type: 'allowance',
        amount: 25,
        description: 'Mesada da semana',
        timestamp: '2024-08-12T10:00:00Z'
      },
      {
        id: 2,
        type: 'purchase',
        amount: -12.50,
        description: 'Lanche na escola',
        timestamp: '2024-08-11T14:30:00Z'
      },
      {
        id: 3,
        type: 'allowance',
        amount: 25,
        description: 'Mesada da semana passada',
        timestamp: '2024-08-05T10:00:00Z'
      },
      {
        id: 4,
        type: 'bonus',
        amount: 5,
        description: 'Bônus por ajudar em casa',
        timestamp: '2024-08-03T18:00:00Z'
      },
      {
        id: 5,
        type: 'allowance',
        amount: 50,
        description: 'Mesada inicial',
        timestamp: '2024-08-01T10:00:00Z'
      }
    ];

    // Combine all transactions and calculate total balance
    const allTransactions = [...baseTransactions, ...savedTransactions];
    const totalBalance = allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return totalBalance;
  };

  const fetchGoalAndBalance = async () => {
    setLoading(true);
    try {
      // Load goals from localStorage
      const savedGoals = JSON.parse(localStorage.getItem(`child-${childId}-goals`) || '[]');
      
      // Mock goals for demo
      const mockGoals = [
        {
          id: 1,
          name: 'Nintendo Switch',
          description: 'Quero comprar um Nintendo Switch para jogar com meus amigos!',
          targetAmount: 300,
          currentAmount: 125,
          category: 'Eletrônicos',
          icon: '🎮',
          isCompleted: false,
          progressPercent: 42,
          createdAt: '2024-08-01T00:00:00Z',
          updatedAt: '2024-08-12T00:00:00Z'
        },
        {
          id: 2,
          name: 'Bicicleta Nova',
          description: 'Uma bicicleta rosa para andar no parque com minha família',
          targetAmount: 150,
          currentAmount: 89,
          category: 'Esportes',
          icon: '🚲',
          isCompleted: false,
          progressPercent: 59,
          createdAt: '2024-07-15T00:00:00Z',
          updatedAt: '2024-08-10T00:00:00Z'
        }
      ];

      const allGoals = [...savedGoals, ...mockGoals];
      const foundGoal = allGoals.find(g => g.id.toString() === goalId);
      
      if (foundGoal) {
        setGoal(foundGoal);
      } else {
        setError('Objetivo não encontrado');
      }

      // Calculate and set current balance
      const currentBalance = calculateCurrentBalance();
      setChildBalance(currentBalance);
      
    } catch (error) {
      console.error('Fetch goal error:', error);
      setError('Erro ao carregar objetivo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(depositAmount);
      
      if (amount <= 0) {
        setError('Por favor, insira um valor maior que zero');
        return;
      }

      if (amount > childBalance) {
        setError('Você não tem saldo suficiente');
        return;
      }

      if (!goal) {
        setError('Objetivo não encontrado');
        return;
      }

      const newCurrentAmount = goal.currentAmount + amount;
      const newProgressPercent = Math.min(Math.round((newCurrentAmount / goal.targetAmount) * 100), 100);
      const isCompleted = newCurrentAmount >= goal.targetAmount;

      // Update goal
      const updatedGoal = {
        ...goal,
        currentAmount: newCurrentAmount,
        progressPercent: newProgressPercent,
        isCompleted,
        updatedAt: new Date().toISOString(),
        completedAt: isCompleted ? new Date().toISOString() : goal.completedAt
      };

      // Update localStorage
      const savedGoals = JSON.parse(localStorage.getItem(`child-${childId}-goals`) || '[]');
      const updatedGoals = savedGoals.map((g: Goal) => 
        g.id === goal.id ? updatedGoal : g
      );
      localStorage.setItem(`child-${childId}-goals`, JSON.stringify(updatedGoals));

      // Create transaction record
      const newTransaction = {
        id: Date.now(),
        type: 'goal_deposit',
        amount: -amount,
        description: `Depósito para objetivo: ${goal.name}`,
        timestamp: new Date().toISOString()
      };

      // Save transaction to localStorage
      const existingTransactions = JSON.parse(localStorage.getItem(`child-${childId}-transactions`) || '[]');
      existingTransactions.push(newTransaction);
      localStorage.setItem(`child-${childId}-transactions`, JSON.stringify(existingTransactions));

      // Update child balance by recalculating
      const newBalance = calculateCurrentBalance() - amount;
      setChildBalance(newBalance);

      // Update local goal state
      setGoal(updatedGoal);
      setDepositAmount('');

      // Show success message
      if (isCompleted) {
        setSuccess(`🎉 Parabéns! Você completou seu objetivo "${goal.name}"!`);
      } else {
        setSuccess(`💰 Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Deposit error:', error);
      setError('Erro ao realizar depósito');
    } finally {
      setSubmitting(false);
    }
  };

  const suggestedAmounts = [5, 10, 20, 50];
  const maxAmount = Math.min(childBalance, goal ? goal.targetAmount - goal.currentAmount : 0);

  if (loading) {
    return (
      <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #a855f7', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#a855f7'}}>Carregando objetivo...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div style={containerStyle}>
        <div style={maxWidthStyle}>
          <div style={cardStyle}>
            <div style={{textAlign: 'center'}}>
              <p style={{color: '#dc2626', marginBottom: '1rem'}}>Objetivo não encontrado</p>
              <button
                onClick={() => router.push(`/child/${childId}/goals`)}
                style={primaryBtnStyle}
              >
                Voltar aos Objetivos
              </button>
            </div>
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
            onClick={() => router.push(`/child/${childId}/goals`)}
            style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>💰 Depositar Dinheiro</h1>
            <p style={subtitleStyle}>Adicione dinheiro ao seu objetivo</p>
          </div>
        </div>

        {/* Goal Summary */}
        <div style={{...cardStyle, border: '2px solid #e9d5ff', background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
            <span style={{fontSize: '3rem'}}>{goal.icon}</span>
            <div style={{flex: 1}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', marginBottom: '0.25rem'}}>
                {goal.name}
              </h2>
              <p style={{fontSize: '0.875rem', color: '#a855f7'}}>
                {goal.category}
              </p>
            </div>
          </div>

          <div style={{marginBottom: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
              <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>Progresso</span>
              <span style={{fontSize: '0.875rem', fontWeight: 'bold', color: '#a855f7'}}>
                {goal.progressPercent}%
              </span>
            </div>
            <div style={progressBarStyle}>
              <div style={progressFillStyle(goal.progressPercent, '#a855f7')}></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                R$ {goal.currentAmount.toFixed(2)}
              </span>
              <span style={{fontSize: '0.875rem', color: '#6b7280'}}>
                Meta: R$ {goal.targetAmount.toFixed(2)}
              </span>
            </div>
            <p style={{fontSize: '0.875rem', color: '#a855f7', textAlign: 'center', marginTop: '0.5rem'}}>
              Faltam R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)} para completar
            </p>
          </div>
        </div>

        {/* Balance Info */}
        <div style={{...cardStyle, border: '2px solid #bbf7d0', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.25rem'}}>
                💰 Seu Saldo Disponível
              </h3>
              <p style={{fontSize: '0.875rem', color: '#16a34a'}}>
                Quanto você pode depositar
              </p>
            </div>
            <div style={{textAlign: 'right'}}>
              <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>
                R$ {childBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Form */}
        <div style={cardStyle}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            Quanto você quer depositar?
          </h3>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {success && (
            <div style={successStyle}>
              {success}
            </div>
          )}

          <form onSubmit={handleDeposit}>
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="amount">Valor do Depósito (R$)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                style={inputStyle}
              />
              <p style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                Máximo: R$ {maxAmount.toFixed(2)}
              </p>
            </div>

            {/* Suggested Amounts */}
            <div style={{marginBottom: '1.5rem'}}>
              <p style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem'}}>
                Valores sugeridos:
              </p>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem'}}>
                {suggestedAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDepositAmount(amount.toString())}
                    disabled={amount > maxAmount}
                    style={{
                      ...outlineBtnStyle,
                      fontSize: '0.875rem',
                      padding: '0.5rem',
                      opacity: amount > maxAmount ? 0.5 : 1,
                      cursor: amount > maxAmount ? 'not-allowed' : 'pointer'
                    }}
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button
                type="button"
                onClick={() => router.push(`/child/${childId}/goals`)}
                style={{...outlineBtnStyle, flex: 1}}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !depositAmount || parseFloat(depositAmount || '0') <= 0}
                style={{
                  ...primaryBtnStyle,
                  flex: 1,
                  opacity: (submitting || !depositAmount || parseFloat(depositAmount || '0') <= 0) ? 0.6 : 1,
                  cursor: (submitting || !depositAmount || parseFloat(depositAmount || '0') <= 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Depositando...' : 'Fazer Depósito'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div style={cardStyle}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            💡 Dicas para poupar
          </h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Deposite regularmente, mesmo valores pequenos</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Guarde uma parte da sua mesada</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>✅ Evite gastos desnecessários</li>
            <li style={{fontSize: '0.875rem', color: '#6b7280'}}>✅ Comemore cada depósito feito!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}