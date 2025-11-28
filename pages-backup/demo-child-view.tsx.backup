'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/services/database';
import { TransactionService } from '@/lib/services/transactions';
import { GoalsService } from '@/lib/services/goals';
import { GamificationService } from '@/lib/services/gamification';
import type { Child, Transaction, Goal, PurchaseRequest } from '@/lib/supabase';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface Loan {
  id: string;
  amount: number;
  reason: string;
  borrowedAt: string;
  dueDate: string;
  status: 'active' | 'paid';
}

export default function ChildView() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('home');

  // Verificar sessão da criança
  useEffect(() => {
    const checkChildSession = () => {
      const childSession = localStorage.getItem('child-session');
      if (!childSession) {
        router.replace('/');
        return;
      }

      try {
        const session = JSON.parse(childSession);
        // Verificar se a sessão não expirou (24 horas)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const diffHours =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (diffHours > 24) {
          localStorage.removeItem('child-session');
          router.replace('/');
          return;
        }

        console.log('👶 Sessão da criança válida:', session.name);
      } catch (error) {
        localStorage.removeItem('child-session');
        router.replace('/');
      }
    };

    checkChildSession();
  }, [router]);

  // Estados para dados reais do Supabase
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [realGoals, setRealGoals] = useState<Goal[]>([]);
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<PurchaseRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // useEffect para carregar dados reais do Supabase
  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Carregando dados da criança do Supabase...');

      // Obter dados da sessão
      const childSession = localStorage.getItem('child-session');
      if (!childSession) {
        router.replace('/');
        return;
      }

      const sessionData = JSON.parse(childSession);
      console.log('✅ Dados da sessão:', sessionData);
      setCurrentChild(sessionData);

      // Carregar dados relacionados
      await loadSupabaseGoals(sessionData.id);
      await loadSupabaseTransactions(sessionData.id);
      await loadPurchaseRequests(sessionData.id);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupabaseGoals = async (childId: string) => {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('child_id', childId);

    if (error) {
      console.error('❌ Erro ao carregar metas:', error);
      setRealGoals([]);
    } else {
      console.log('✅ Metas carregadas:', goals);
      setRealGoals(goals || []);
    }
  };

  const loadSupabaseTransactions = async (childId: string) => {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao carregar transações:', error);
      setRealTransactions([]);
    } else {
      console.log('✅ Transações carregadas:', transactions);
      setRealTransactions(transactions || []);
    }
  };

  const loadPurchaseRequests = async (childId: string) => {
    const { data: requests, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('child_id', childId)
      .eq('requires_approval', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      setPendingPurchases([]);
    } else {
      console.log('✅ Pedidos carregados:', requests);
      setPendingPurchases(requests || []);
    }
  };

  const updateChildBalance = async (childId: string, newBalance: number) => {
    const { data: updatedChild, error } = await supabase
      .from('children')
      .update({ balance: newBalance })
      .eq('id', childId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar saldo:', error);
      return false;
    }

    // Update current child state
    if (currentChild && currentChild.id === childId) {
      setCurrentChild({ ...currentChild, balance: newBalance });
    }

    console.log('✅ Saldo atualizado no Supabase:', updatedChild);
    return true;
  };

  const createDemoData = () => {
    try {
      // Criar família de demonstração no localStorage
      const family = {
        id: 'family-demo-001',
        family_name: 'Família Demo',
        parent_name: 'Demo Parent',
        parent_email: 'demo@teste.com',
      };
      localStorage.setItem('demo-family', JSON.stringify(family));

      // Criar criança de demonstração no localStorage
      const child = {
        id: 'child-demo-001',
        family_id: family.id,
        name: 'teste',
        age: 7,
        birth_date: '2017-08-30',
        pin: '0000',
        avatar_url: '👧',
        balance: 0.0,
        total_earned: 0.0,
        total_spent: 0.0,
        current_level: 1,
        total_xp: 0,
        current_streak: 0,
      };
      localStorage.setItem('demo-children', JSON.stringify([child]));

      // Criar dados de demo vazios para transações, metas e solicitações
      localStorage.setItem('demo-transactions', JSON.stringify([]));
      localStorage.setItem('demo-goals', JSON.stringify([]));
      localStorage.setItem('demo-purchase-requests', JSON.stringify([]));

      setCurrentChild(child as any);
      loadChildData();
    } catch (error) {
      console.error('Erro ao criar dados de demo:', error);
    }
  };

  // Estados locais para demo (fallback)
  const [currentBalance, setCurrentBalance] = useState(0);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [currentGoals, setCurrentGoals] = useState([
    // Sem metas para conta nova - será preenchido quando a criança criar
  ]);
  const [recentTransactions, setRecentTransactions] = useState([
    // Sem transações para conta nova - será preenchido quando houver atividade real
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    // Será populado quando a criança fizer pedidos
  ]);

  // Estados para modais
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [newGoalData, setNewGoalData] = useState({
    name: '',
    amount: '',
    category: '',
  });
  const [newLoanData, setNewLoanData] = useState({
    reason: '',
    amount: '',
    category: '',
  });

  // Categorias disponíveis
  const availableCategories = [
    { name: 'Jogos', icon: '🎮' },
    { name: 'Roupas', icon: '👕' },
    { name: 'Livros', icon: '📚' },
    { name: 'Esportes', icon: '⚽' },
    { name: 'Eletrônicos', icon: '📱' },
    { name: 'Brinquedos', icon: '🧸' },
    { name: 'Música', icon: '🎵' },
    { name: 'Arte', icon: '🎨' },
    { name: 'Viagem', icon: '✈️' },
    { name: 'Educação', icon: '📖' },
    { name: 'Alimentação', icon: '🍔' },
    { name: 'Emergência', icon: '🚨' },
  ];

  // Funções de alocação de dinheiro
  const payLoan = async () => {
    const currentBalance = currentChild?.balance || 0;
    if (!activeLoan) return;
    const amountStr = prompt(
      `Quanto você quer pagar do empréstimo?\n\nEmpréstimo total: R$ ${activeLoan.amount.toFixed(2)}\nSeu saldo: R$ ${currentBalance.toFixed(2)}`
    );

    if (amountStr === null) return; // Cancelou

    const amount = parseFloat(amountStr.replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      alert('❌ Digite um valor válido!');
      return;
    }

    if (amount > currentBalance) {
      alert('❌ Saldo insuficiente!');
      return;
    }

    if (amount > activeLoan.amount) {
      alert('❌ O valor não pode ser maior que o empréstimo!');
      return;
    }

    // Atualizar saldo no Supabase
    const newBalance = currentBalance - amount;
    if (currentChild) {
      await updateChildBalance(currentChild.id, newBalance);
    }
    setActiveLoan(prev => ({
      ...prev,
      amount: prev.amount - amount,
    }));

    // Se pagou tudo, remove o empréstimo
    if (amount >= activeLoan.amount) {
      setActiveLoan(null);
    }

    setRecentTransactions(prev => [
      {
        id: Date.now().toString(),
        type: 'loan_payment' as const,
        amount: amount,
        description: `Pagamento - ${activeLoan.reason}`,
        date: 'Agora',
        icon: '💳',
      },
      ...prev,
    ]);

    alert(
      `✅ Pagamento realizado! ${amount >= activeLoan.amount ? 'Empréstimo quitado!' : `Restam R$ ${(activeLoan.amount - amount).toFixed(2)}`}\nNovo saldo: R$ ${newBalance.toFixed(2)}`
    );
  };

  const contributeToGoal = async (goalName: string) => {
    const currentBalance = currentChild?.balance || 0;
    const amountStr = prompt(
      `Quanto você quer guardar para "${goalName}"?\n\nSeu saldo: R$ ${currentBalance.toFixed(2)}`
    );

    if (amountStr === null) return; // Cancelou

    const amount = parseFloat(amountStr.replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      alert('❌ Digite um valor válido!');
      return;
    }

    if (amount > currentBalance) {
      alert('❌ Saldo insuficiente!');
      return;
    }

    // Atualizar saldo no Supabase
    const newBalance = currentBalance - amount;
    if (currentChild) {
      await updateChildBalance(currentChild.id, newBalance);
    }
    setRecentTransactions(prev => [
      {
        id: Date.now().toString(),
        type: 'spent' as const,
        amount: amount,
        description: `Contribuição - ${goalName}`,
        date: 'Agora',
        icon: '🎯',
      },
      ...prev,
    ]);

    alert(
      `✅ R$ ${amount.toFixed(2)} guardado para ${goalName}!\nNovo saldo: R$ ${newBalance.toFixed(2)}`
    );
  };

  const requestPurchase = async (category: string) => {
    console.log('🛍️ Iniciando pedido de compra...');
    console.log('👶 Dados da criança atual:', currentChild);

    if (!currentChild) {
      alert('❌ Erro: Dados da criança não encontrados. Faça login novamente.');
      return;
    }

    const currentBalance = currentChild.balance || 0;
    const itemName = prompt(
      `O que você quer comprar na categoria "${category}"?`
    );
    if (!itemName) return;

    const amountStr = prompt(
      `Quanto custa "${itemName}"?\n\nSeu saldo: R$ ${currentBalance.toFixed(2)}`
    );
    if (!amountStr) return;

    const amount = parseFloat(amountStr.replace(',', '.'));

    if (isNaN(amount) || amount <= 0) {
      alert('❌ Digite um valor válido!');
      return;
    }

    console.log('💰 Criando pedido:', {
      child_id: currentChild.id,
      itemName,
      category,
      amount,
    });

    try {
      // Criar pedido de compra como transação pendente no Supabase
      const { data: newRequest, error } = await supabase
        .from('transactions')
        .insert([
          {
            child_id: currentChild.id,
            type: 'spending',
            amount: amount,
            description: `Pedido: ${itemName}`,
            category: category,
            status: 'pending',
            requires_approval: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro detalhado do Supabase:', error);
        alert(
          `❌ Erro ao enviar pedido:\n${error.message}\n\nTente novamente.`
        );
        return;
      }

      console.log('✅ Pedido de compra criado no Supabase:', newRequest);

      // Recarregar lista de pedidos para mostrar atualizada
      if (currentChild) {
        await loadPurchaseRequests(currentChild.id);
      }

      alert(
        `📨 Pedido enviado para seus pais!\n\nItem: ${itemName}\nCategoria: ${category}\nValor: R$ ${amount.toFixed(2)}\n\nVocê pode acompanhar na tela inicial! 😊`
      );
    } catch (error) {
      console.error('❌ Erro interno:', error);
      alert(
        '❌ Erro interno ao enviar pedido. Verifique sua conexão e tente novamente.'
      );
    }
  };

  const requestNewGoal = () => {
    setNewGoalData({ name: '', amount: '', category: '' });
    setShowGoalModal(true);
  };

  const submitNewGoal = async () => {
    const amount = parseFloat(newGoalData.amount.replace(',', '.'));

    if (
      !newGoalData.name ||
      !newGoalData.category ||
      isNaN(amount) ||
      amount <= 0
    ) {
      alert('❌ Preencha todos os campos corretamente!');
      return;
    }

    if (!currentChild) {
      alert('❌ Erro: dados da criança não carregados');
      return;
    }

    const selectedCategory = availableCategories.find(
      cat => cat.name === newGoalData.category
    );

    try {
      // Criar solicitação de meta no Supabase
      const purchaseRequest = await DatabaseService.createPurchaseRequest(
        currentChild.id,
        {
          type: 'goal',
          item_name: newGoalData.name,
          amount: amount,
          category: newGoalData.category,
          description: `Solicitação para criar nova meta: ${newGoalData.name}`,
          status: 'pending',
        }
      );

      if (purchaseRequest) {
        // Atualizar lista local
        setPendingPurchases([...pendingPurchases, purchaseRequest]);
        setShowGoalModal(false);

        alert(
          `📨 Novo sonho enviado para aprovação!\n\nSonho: ${newGoalData.name}\nCategoria: ${selectedCategory?.icon} ${newGoalData.category}\nValor: R$ ${amount.toFixed(2)}\n\nVocê pode acompanhar na tela inicial! 😊`
        );
      }
    } catch (error) {
      console.error('Erro ao criar solicitação de meta:', error);
      alert('❌ Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const requestLoan = () => {
    setNewLoanData({ reason: '', amount: '', category: '' });
    setShowLoanModal(true);
  };

  const submitLoanRequest = () => {
    const amount = parseFloat(newLoanData.amount.replace(',', '.'));

    if (
      !newLoanData.reason ||
      !newLoanData.category ||
      isNaN(amount) ||
      amount <= 0
    ) {
      alert('❌ Preencha todos os campos corretamente!');
      return;
    }

    const selectedCategory = availableCategories.find(
      cat => cat.name === newLoanData.category
    );

    // Adicionar à lista de pedidos pendentes
    const newRequest = {
      id: Date.now().toString(),
      type: 'loan' as const,
      reason: newLoanData.reason,
      category: newLoanData.category,
      categoryIcon: selectedCategory?.icon || '🏦',
      amount,
      requestedAt: 'Agora',
      status: 'pending' as const,
    };

    setPendingRequests(prev => [newRequest, ...prev]);
    setShowLoanModal(false);

    alert(
      `📨 Pedido de empréstimo enviado!\n\nMotivo: ${newLoanData.reason}\nCategoria: ${selectedCategory?.icon} ${newLoanData.category}\nValor: R$ ${amount.toFixed(2)}\n\nSeus pais vão analisar! 😊`
    );
  };

  // Dados híbridos - usa Supabase quando disponível, fallback para mock
  const childData = {
    name: currentChild?.name || 'Criança',
    avatar: currentChild?.avatar || '👧',
    age: currentChild?.age || 8,
    balance: currentChild?.balance || 0,
    level: currentChild?.level || 1,
    xp: currentChild?.xp || 0,
    xpToNext: 100, // Próximo nível em 100 XP para iniciante
    currentStreak: currentChild?.streak_count || 0,
    weeklyAllowance: 0,
    nextAllowanceDate: 'Não configurado',
    activeLoan: activeLoan,
    achievements: [], // Sem conquistas para conta nova
    goals:
      realGoals.length > 0
        ? realGoals.map(goal => ({
            id: goal.id,
            name: goal.name,
            target: goal.target_amount,
            current: goal.current_amount,
            category: goal.category,
            icon: goal.icon || '🎯',
          }))
        : currentGoals,
    recentTransactions:
      realTransactions.length > 0
        ? realTransactions.slice(0, 5).map(tx => ({
            id: tx.id,
            type: tx.type as any,
            amount: tx.amount,
            description: tx.description || tx.category,
            date: new Date(tx.created_at).toLocaleDateString('pt-BR'),
            icon:
              tx.type === 'allowance'
                ? '💰'
                : tx.type === 'purchase'
                  ? '🛒'
                  : tx.type === 'goal_contribution'
                    ? '🎯'
                    : '💸',
          }))
        : recentTransactions,
  };

  const completionPercentage = Math.round(
    (childData.xp / (childData.xp + childData.xpToNext)) * 100
  );

  const TabButton = ({ id, icon, label, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👧</div>
          <div className="text-xl font-bold text-gray-700 mb-2">
            Carregando seu banco...
          </div>
          <div className="text-gray-500">Conectando com Supabase</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{childData.avatar}</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Oi, {childData.name}! 👋</h1>
              <p className="text-pink-100">Seu banco pessoal</p>
            </div>
            <div className="text-right flex flex-col items-end space-y-2">
              <button
                onClick={() => {
                  localStorage.removeItem('child-session');
                  router.push('/');
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                Sair
              </button>
              <div>
                <div className="text-2xl font-bold">
                  R$ {childData.balance.toFixed(2)}
                </div>
                <div className="text-xs text-pink-100">Meu saldo</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 bg-white/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Nível {childData.level}</span>
              <span className="text-sm">
                {childData.xp} / {childData.xp + childData.xpToNext} XP
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-pink-100 mt-1">
              Faltam {childData.xpToNext} XP para o próximo nível! 🚀
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        {/* Home Tab */}
        {selectedTab === 'home' && (
          <div className="px-4 py-6 space-y-6">
            {/* Balance Card - DESTAQUE PRINCIPAL */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 text-white text-center shadow-xl">
              <div className="text-5xl font-bold mb-2">
                R$ {childData.balance.toFixed(2)}
              </div>
              <div className="text-green-100 text-lg">
                Meu Dinheiro Disponível
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedTab('use-money')}
                  className="bg-white text-green-600 font-bold py-3 px-8 rounded-xl hover:bg-green-50 transition-all shadow-lg"
                >
                  💰 Usar Meu Dinheiro
                </button>
              </div>
            </div>

            {/* Active Loan Alert */}
            {childData.activeLoan && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏦</div>
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-800">
                      Empréstimo Ativo
                    </div>
                    <div className="text-sm text-yellow-600">
                      R$ {childData.activeLoan.amount.toFixed(2)} -{' '}
                      {childData.activeLoan.reason}
                    </div>
                    <div className="text-xs text-yellow-500">
                      Empréstimo sem juros
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTab('use-money')}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-600"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            )}

            {/* Streak Card */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {childData.currentStreak} dias
                  </div>
                  <div className="text-orange-100">
                    Sequência de tarefas! 🔥
                  </div>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => alert('Em breve: Ver suas tarefas pendentes!')}
                  className="bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-all"
                >
                  Ver Minhas Tarefas
                </button>
              </div>
            </div>

            {/* Interest Card - Sistema de rendimento ATUALIZADO (1% mensal + regra 30 dias) */}
            {childData.balance >= 10 && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      R$ {(childData.balance * 0.01).toFixed(2)}
                    </div>
                    <div className="text-green-100">
                      Seu dinheiro está rendendo! 📈
                    </div>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
                <div className="mt-3 text-sm opacity-90">
                  Com R$ {childData.balance.toFixed(2)} na conta, você pode
                  ganhar até R$ {(childData.balance * 0.01).toFixed(2)} por mês
                </div>
                <div className="mt-1 text-xs opacity-75">
                  ⏰ Só rende o dinheiro que está há 30+ dias na conta
                </div>
                <div className="mt-1 text-xs opacity-60">
                  📊 Taxa: 1% ao mês • Mínimo: R$ 10,00
                </div>
              </div>
            )}

            {childData.balance < 10 && (
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold">R$ 10,00</div>
                    <div className="text-gray-100">
                      Meta para começar a render! 💰
                    </div>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
                <div className="mt-3 text-sm opacity-90">
                  Economize mais R$ {(10 - childData.balance).toFixed(2)} para
                  seu dinheiro começar a render 1% ao mês!
                </div>
                <div className="mt-1 text-xs opacity-75">
                  ⏰ Condição: O dinheiro precisa ficar 30 dias na conta para
                  render
                </div>
                <div className="mt-1 text-xs opacity-60">
                  📊 Taxa: 1% ao mês • Mínimo: R$ 10,00
                </div>
              </div>
            )}

            {/* Pending Requests - Dados reais do Supabase */}
            {pendingPurchases.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Meus Pedidos ({pendingPurchases.length})
                </h3>
                <div className="space-y-3">
                  {pendingPurchases.slice(0, 3).map(request => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg p-3 border border-orange-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">
                          {request.type === 'purchase'
                            ? '🛒'
                            : request.type === 'goal'
                              ? '⭐'
                              : '🏦'}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {request.item_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.type === 'purchase'
                              ? `Compra: ${request.category}`
                              : request.type === 'goal'
                                ? `Sonho: ${request.category}`
                                : `Empréstimo: ${request.category}`}{' '}
                            • R$ {request.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-orange-600">
                            Enviado{' '}
                            {new Date(request.created_at).toLocaleDateString(
                              'pt-BR'
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : request.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {request.status === 'pending'
                            ? '⏰ Aguardando'
                            : request.status === 'approved'
                              ? '✅ Aprovado'
                              : '❌ Negado'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingPurchases.length > 3 && (
                    <div className="text-center text-orange-600 text-sm">
                      +{pendingPurchases.length - 3} outros pedidos pendentes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Allowance */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🗓️</div>
                <div>
                  <div className="font-semibold text-blue-800">
                    Próxima Mesada
                  </div>
                  <div className="text-sm text-blue-600">
                    R$ {childData.weeklyAllowance.toFixed(2)} na{' '}
                    {childData.nextAllowanceDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900">Últimas Atividades</h3>
              </div>
              <div className="divide-y">
                {childData.recentTransactions.slice(0, 3).map(transaction => (
                  <div
                    key={transaction.id}
                    className="p-4 flex items-center space-x-3"
                  >
                    <div className="text-2xl">{transaction.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.date}
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        transaction.type === 'received'
                          ? 'text-green-600'
                          : transaction.type === 'loan'
                            ? 'text-blue-600'
                            : transaction.type === 'loan_payment'
                              ? 'text-orange-600'
                              : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'received'
                        ? '+'
                        : transaction.type === 'loan'
                          ? '+'
                          : transaction.type === 'loan_payment'
                            ? '-'
                            : '-'}
                      R$ {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Use Money Tab - NOVA ABA */}
        {selectedTab === 'use-money' && (
          <div className="px-4 py-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Usar Meu Dinheiro
              </h2>
              <div className="text-lg text-green-600 font-semibold">
                R$ {childData.balance.toFixed(2)} disponível
              </div>
            </div>

            {/* Allocation Options */}
            <div className="space-y-4">
              {/* Request Loan */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🏦</div>
                  <div>
                    <h3 className="font-bold text-blue-800">
                      Pedir Emprestado
                    </h3>
                    <p className="text-sm text-blue-600">
                      Empréstimo sem juros dos seus pais
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestLoan}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-all"
                >
                  💳 Solicitar Empréstimo
                </button>
              </div>

              {/* Pay Loan */}
              {childData.activeLoan && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">🏦</div>
                    <div>
                      <h3 className="font-bold text-yellow-800">
                        Pagar Empréstimo
                      </h3>
                      <p className="text-sm text-yellow-600">
                        R$ {childData.activeLoan.amount.toFixed(2)} -{' '}
                        {childData.activeLoan.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={payLoan}
                    className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-yellow-600 transition-all"
                  >
                    💰 Pagar Empréstimo
                  </button>
                </div>
              )}

              {/* Contribute to Goals */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="font-bold text-purple-800">
                      Guardar para Sonho
                    </h3>
                    <p className="text-sm text-purple-600">
                      Contribuir para uma das suas metas
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {childData.goals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => contributeToGoal(goal.name)}
                      className="w-full bg-white border border-purple-200 rounded-lg p-3 flex items-center space-x-3 hover:bg-purple-50 transition-all"
                    >
                      <div className="text-2xl">{goal.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">
                          {goal.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          R$ {goal.current.toFixed(2)} de R${' '}
                          {goal.target.toFixed(2)} (
                          {Math.round((goal.current / goal.target) * 100)}%)
                        </div>
                        <div className="w-full bg-purple-100 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-purple-600 font-semibold">→</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buy Something */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🛒</div>
                  <div>
                    <h3 className="font-bold text-blue-800">Comprar Agora</h3>
                    <p className="text-sm text-blue-600">
                      Escolher algo para comprar
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => requestPurchase('Jogos')}
                    className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl mb-1">🎮</div>
                    <div className="text-sm font-semibold text-gray-900">
                      Jogos
                    </div>
                    <div className="text-xs text-gray-500">Pedir aprovação</div>
                  </button>
                  <button
                    onClick={() => requestPurchase('Roupas')}
                    className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl mb-1">👕</div>
                    <div className="text-sm font-semibold text-gray-900">
                      Roupas
                    </div>
                    <div className="text-xs text-gray-500">Pedir aprovação</div>
                  </button>
                  <button
                    onClick={() => requestPurchase('Livros')}
                    className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl mb-1">📚</div>
                    <div className="text-sm font-semibold text-gray-900">
                      Livros
                    </div>
                    <div className="text-xs text-gray-500">Pedir aprovação</div>
                  </button>
                  <button
                    onClick={() => requestPurchase('Esportes')}
                    className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl mb-1">⚽</div>
                    <div className="text-sm font-semibold text-gray-900">
                      Esportes
                    </div>
                    <div className="text-xs text-gray-500">Pedir aprovação</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedTab('home')}
                className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all"
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {selectedTab === 'goals' && (
          <div className="px-4 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Meus Sonhos 🌟
              </h2>
              <button
                onClick={requestNewGoal}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                + Novo Sonho
              </button>
            </div>

            {childData.goals.map(goal => (
              <div key={goal.id} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{goal.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{goal.name}</h3>
                    <div className="text-sm text-gray-600">
                      R$ {goal.current.toFixed(2)} de R${' '}
                      {goal.target.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{
                      width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>
                    {Math.round((goal.current / goal.target) * 100)}% completo
                  </span>
                  <span>
                    Faltam R$ {(goal.target - goal.current).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => contributeToGoal(goal.name)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  💰 Contribuir para este sonho
                </button>
              </div>
            ))}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-purple-800 mb-2">
                Tem um novo sonho?
              </h3>
              <p className="text-sm text-purple-600 mb-4">
                Crie uma nova meta e peça aprovação dos seus pais!
              </p>
              <button
                onClick={requestNewGoal}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
              >
                🌟 Criar Novo Sonho
              </button>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Minhas Conquistas 🏆
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {childData.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white text-center"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-bold text-sm">{achievement.name}</div>
                  <div className="text-xs text-yellow-100">
                    {achievement.earnedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Meu Histórico 📋
            </h2>
            <div className="space-y-3">
              {childData.recentTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl p-4 shadow-lg flex items-center space-x-3"
                >
                  <div className="text-2xl">{transaction.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.date}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${transaction.type === 'received' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {transaction.type === 'received' ? '+' : '-'}R${' '}
                    {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <TabButton
              id="home"
              icon="🏠"
              label="Início"
              isActive={selectedTab === 'home'}
              onClick={setSelectedTab}
            />
            <TabButton
              id="goals"
              icon="🎯"
              label="Sonhos"
              isActive={selectedTab === 'goals'}
              onClick={setSelectedTab}
            />
            <TabButton
              id="achievements"
              icon="🏆"
              label="Conquistas"
              isActive={selectedTab === 'achievements'}
              onClick={setSelectedTab}
            />
            <TabButton
              id="history"
              icon="📋"
              label="Histórico"
              isActive={selectedTab === 'history'}
              onClick={setSelectedTab}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/demo-parent-view')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg"
          >
            👨‍💼 Ver como Pai
          </button>

          <button
            onClick={() => router.push('/system-overview')}
            className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600"
          >
            ← Voltar ao Overview
          </button>
        </div>
      </div>

      {/* Modal Novo Sonho */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                🌟 Criar Novo Sonho
              </h2>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual é o seu sonho?
                </label>
                <input
                  type="text"
                  value={newGoalData.name}
                  onChange={e =>
                    setNewGoalData({ ...newGoalData, name: e.target.value })
                  }
                  placeholder="Ex: Nintendo Switch, Bicicleta nova..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quanto custa?
                </label>
                <input
                  type="text"
                  value={newGoalData.amount}
                  onChange={e =>
                    setNewGoalData({ ...newGoalData, amount: e.target.value })
                  }
                  placeholder="Ex: 1299.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria do sonho
                </label>
                <select
                  value={newGoalData.category}
                  onChange={e =>
                    setNewGoalData({ ...newGoalData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Escolha uma categoria...</option>
                  {availableCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={submitNewGoal}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg"
              >
                📨 Enviar para Aprovação
              </button>
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pedir Empréstimo */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                🏦 Pedir Empréstimo
              </h2>
              <button
                onClick={() => setShowLoanModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                💡 Lembre-se: Empréstimos são <strong>sem juros</strong>, mas
                precisam ser pagos de volta!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Para que você precisa?
                </label>
                <input
                  type="text"
                  value={newLoanData.reason}
                  onChange={e =>
                    setNewLoanData({ ...newLoanData, reason: e.target.value })
                  }
                  placeholder="Ex: Comprar material escolar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quanto você precisa?
                </label>
                <input
                  type="text"
                  value={newLoanData.amount}
                  onChange={e =>
                    setNewLoanData({ ...newLoanData, amount: e.target.value })
                  }
                  placeholder="Ex: 50.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria do empréstimo
                </label>
                <select
                  value={newLoanData.category}
                  onChange={e =>
                    setNewLoanData({ ...newLoanData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Escolha uma categoria...</option>
                  {availableCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={submitLoanRequest}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg"
              >
                📨 Solicitar Empréstimo
              </button>
              <button
                onClick={() => setShowLoanModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
