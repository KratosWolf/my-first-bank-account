'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { LoanService } from '../src/lib/services/loanService';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/services/database';
import { TransactionService } from '@/lib/services/transactions';
import { GoalsService } from '@/lib/services/goals';
import { GamificationService } from '@/lib/services/gamification';
import { CategoriesService } from '@/lib/services/categoriesService';
import { AllowanceService } from '@/lib/services/allowanceService';
import TransactionHistory from '../src/components/TransactionHistory';
import type {
  Child,
  Transaction,
  Goal,
  PurchaseRequest,
  AllowanceConfig,
} from '@/lib/supabase';

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
  const { data: session, status } = useSession();
  const [selectedTab, setSelectedTab] = useState('home');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Proteger página: apenas criança dona do perfil OU pais da família podem acessar
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      console.log('⛔ Usuário não autenticado, redirecionando para login...');
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      const { childId: queryChildId } = router.query;

      // Verificar autorização
      const isChildOwner =
        user.role === 'child' && user.childId === queryChildId;
      const isParent = user.role === 'parent';

      if (isChildOwner || isParent) {
        console.log('✅ Acesso autorizado:', {
          role: user.role,
          isChildOwner,
          isParent,
        });
        setIsAuthorized(true);
      } else {
        console.log('⛔ Acesso negado - usuário não autorizado');
        router.push('/acesso-negado');
      }
    }
  }, [status, session, router]);

  // Estados para dados reais do Supabase
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [realGoals, setRealGoals] = useState<Goal[]>([]);
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<PurchaseRequest[]>(
    []
  );
  const [allowanceConfig, setAllowanceConfig] =
    useState<AllowanceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect para carregar dados reais do Supabase
  useEffect(() => {
    if (isAuthorized && router.query.childId) {
      loadChildData(router.query.childId as string);
    }
  }, [isAuthorized, router.query.childId]);

  const loadChildData = async (childId: string) => {
    setLoading(true);
    try {
      console.log('🔍 Carregando dados da criança do Supabase...', childId);

      // Buscar dados da criança no Supabase
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError || !childData) {
        console.error('❌ Erro ao carregar dados da criança:', childError);
        alert('❌ Erro ao carregar dados da criança. Tente novamente.');
        router.push('/dashboard');
        return;
      }

      console.log('✅ Dados da criança carregados:', childData);
      setCurrentChild(childData);

      // Carregar dados relacionados
      await loadSupabaseGoals(childId);
      await loadSupabaseTransactions(childId);
      await loadPurchaseRequests(childId);
      await loadLoanRequests(childId);
      await loadAllowanceConfig(childId);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllowanceConfig = async (childId: string) => {
    try {
      console.log(
        '💰 Carregando configuração de mesada para criança:',
        childId
      );
      const config = await AllowanceService.getConfigByChildId(childId);

      if (config) {
        console.log('✅ Configuração de mesada carregada:', {
          amount: config.amount,
          frequency: config.frequency,
          next_payment_date: config.next_payment_date,
          is_active: config.is_active,
        });
        setAllowanceConfig(config);
      } else {
        console.log('ℹ️ Nenhuma configuração de mesada encontrada');
        setAllowanceConfig(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração de mesada:', error);
      setAllowanceConfig(null);
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
    let requests: any[] = [];

    // Tentar carregar do Supabase primeiro
    try {
      const { data: supabaseRequests, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('child_id', childId)
        .eq('requires_approval', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(
          '⚠️ Erro no Supabase, usando localStorage fallback:',
          error.message
        );
      } else {
        requests = supabaseRequests || [];
        console.log('✅ Pedidos carregados do Supabase:', requests);
      }
    } catch (error) {
      console.warn('⚠️ Supabase não disponível, usando localStorage fallback');
    }

    // Fallback: Carregar também do localStorage
    try {
      const localRequests = JSON.parse(
        localStorage.getItem('familyPendingRequests') || '[]'
      );
      const childLocalRequests = localRequests.filter(
        (req: any) =>
          req.child_id === childId &&
          req.status === 'pending' &&
          req.type === 'spending'
      );

      if (childLocalRequests.length > 0) {
        console.log(
          '💾 Pedidos adicionais carregados do localStorage:',
          childLocalRequests
        );
        requests = [...requests, ...childLocalRequests];
      }
    } catch (localError) {
      console.warn('⚠️ Erro ao ler localStorage:', localError);
    }

    console.log('🎯 Total de pedidos carregados para criança:', requests);
    setPendingPurchases(requests);
  };

  // Carregar pedidos de empréstimo da tabela purchase_requests
  const loadLoanRequests = async (childId: string) => {
    try {
      console.log('🔍 Carregando pedidos de empréstimo para criança:', childId);
      const loanRequests = await LoanService.getLoanRequests();

      // Filtrar apenas os pedidos desta criança
      const childLoanRequests = loanRequests.filter(
        request => request.child_id === childId
      );

      console.log('✅ Pedidos de empréstimo carregados:', childLoanRequests);
      setPendingRequests(childLoanRequests);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos de empréstimo:', error);
      setPendingRequests([]);
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

  // Categorias dinâmicas do sistema centralizado
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  // Carregar categorias do sistema
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await CategoriesService.getCategories();
        // Converter para o formato esperado pelos componentes
        const formattedCategories = categories.map(cat => ({
          name: cat.name,
          icon: cat.icon,
        }));
        setAvailableCategories(formattedCategories);
        console.log(
          '📂 Categorias carregadas para criança:',
          formattedCategories
        );
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        setAvailableCategories([]);
      }
    };

    loadCategories();
  }, []);

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

  const contributeToGoal = async (goalId: string, goalName: string) => {
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

    if (!currentChild) {
      alert('❌ Erro: Dados da criança não encontrados.');
      return;
    }

    try {
      console.log('💰 Contribuindo para meta via API:', {
        goal_id: goalId,
        child_id: currentChild.id,
        amount,
        goalName,
      });

      const response = await fetch('/api/goal-contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          child_id: currentChild.id,
          amount: amount,
          description: `Contribuição para ${goalName}`,
          contribution_type: 'manual',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro da API:', result);
        alert(`❌ Erro ao contribuir:\n${result.error}`);
        return;
      }

      console.log('✅ Contribuição realizada via API:', result);

      // Update local state
      if (currentChild) {
        setCurrentChild({
          ...currentChild,
          balance: result.data.new_child_balance,
        });
      }

      // Reload data to show updated goals
      await loadChildData();

      if (result.data.goal_completed) {
        alert(
          `🎉 PARABÉNS! Você completou seu sonho "${goalName}"!\n\nContribuição: R$ ${amount.toFixed(2)}\nNovo saldo: R$ ${result.data.new_child_balance.toFixed(2)}\n\n✅ Meta alcançada! 🎯`
        );
      } else {
        alert(
          `✅ R$ ${amount.toFixed(2)} guardado para ${goalName}!\nNovo saldo: R$ ${result.data.new_child_balance.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error('❌ Erro interno:', error);
      alert(
        '❌ Erro interno ao contribuir. Verifique sua conexão e tente novamente.'
      );
    }
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

    console.log('💰 Criando pedido via API:', {
      child_id: currentChild.id,
      itemName,
      category,
      amount,
    });

    try {
      // Usar nova API para criar pedido
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: currentChild.id,
          item_name: itemName,
          amount: amount,
          category: category,
          type: 'spending',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro da API:', result);
        alert(`❌ Erro ao enviar pedido:\n${result.error}\n\nTente novamente.`);
        return;
      }

      console.log('✅ Pedido criado via API:', result);

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
      console.log('🎯 Criando nova meta via API:', {
        child_id: currentChild.id,
        title: newGoalData.name,
        target_amount: amount,
        category: newGoalData.category,
      });

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: currentChild.id,
          title: newGoalData.name,
          description: `Meta criada pela criança: ${newGoalData.name}`,
          target_amount: amount,
          category: newGoalData.category.toLowerCase(),
          priority: 'medium',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro da API:', result);
        alert(`❌ Erro ao criar meta:\n${result.error}`);
        return;
      }

      console.log('✅ Meta criada via API:', result);

      setShowGoalModal(false);

      // Reload data to show new goal
      await loadChildData();

      alert(
        `🎉 Novo sonho criado com sucesso!\n\nSonho: ${newGoalData.name}\nCategoria: ${selectedCategory?.icon} ${newGoalData.category}\nValor: R$ ${amount.toFixed(2)}\n\nVocê já pode começar a guardar dinheiro para ele! 💰`
      );
    } catch (error) {
      console.error('❌ Erro interno:', error);
      alert(
        '❌ Erro interno ao criar meta. Verifique sua conexão e tente novamente.'
      );
    }
  };

  const requestLoan = () => {
    setNewLoanData({ reason: '', amount: '', category: '' });
    setShowLoanModal(true);
  };

  const requestGoalFulfillment = async (goalId: string, goalTitle: string) => {
    if (!currentChild) {
      alert('❌ Erro: Dados da criança não encontrados.');
      return;
    }

    try {
      console.log('🎁 Solicitando realização de sonho via API:', {
        goal_id: goalId,
        child_id: currentChild.id,
        goalTitle,
      });

      const response = await fetch('/api/goals/request-fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          child_id: currentChild.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro da API:', result);
        alert(`❌ Erro ao enviar pedido:\n${result.error}`);
        return;
      }

      console.log('✅ Pedido de realização enviado via API:', result);

      // Reload data to show updated status
      await loadChildData(currentChild.id);

      alert(
        `🎁 Pedido enviado!\n\nSeus pais receberão um aviso para realizar seu sonho "${goalTitle}".\n\nAgora é só esperar! 🎉`
      );
    } catch (error) {
      console.error('❌ Erro interno:', error);
      alert('❌ Erro ao enviar pedido. Tente novamente.');
    }
  };

  const submitLoanRequest = async () => {
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

    // Criar pedido de empréstimo usando o serviço híbrido
    try {
      const newRequest = await LoanService.createLoanRequest({
        type: 'loan',
        child_id: currentChild?.id || 'unknown',
        child_name: currentChild?.name || 'Criança Desconhecida',
        reason: newLoanData.reason,
        category: newLoanData.category,
        categoryIcon: selectedCategory?.icon || '🏦',
        amount,
      });

      if (newRequest) {
        setPendingRequests(prev => [newRequest, ...prev]);
        console.log('✅ Pedido de empréstimo criado:', newRequest);

        // Recarregar pedidos de empréstimo para garantir sincronização
        if (currentChild?.id) {
          await loadLoanRequests(currentChild.id);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar pedido de empréstimo:', error);
    }
    setShowLoanModal(false);

    alert(
      `📨 Pedido de empréstimo enviado!\n\nMotivo: ${newLoanData.reason}\nCategoria: ${selectedCategory?.icon} ${newLoanData.category}\nValor: R$ ${amount.toFixed(2)}\n\nSeus pais vão analisar! 😊`
    );
  };

  // Calcular descrição da próxima mesada
  const getAllowanceDescription = () => {
    if (!allowanceConfig || !allowanceConfig.is_active) {
      return { amount: 0, description: 'Não configurado' };
    }

    const amount = allowanceConfig.amount || 0;
    const nextDate = allowanceConfig.next_payment_date
      ? new Date(allowanceConfig.next_payment_date).toLocaleDateString('pt-BR')
      : 'Data não definida';

    const frequencyText =
      AllowanceService.getFrequencyDescription(allowanceConfig);

    return {
      amount,
      description: `${nextDate} (${frequencyText})`,
    };
  };

  const allowanceInfo = getAllowanceDescription();

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
    weeklyAllowance: allowanceInfo.amount,
    nextAllowanceDate: allowanceInfo.description,
    activeLoan: activeLoan,
    achievements: [], // Sem conquistas para conta nova
    goals:
      realGoals.length > 0
        ? realGoals.map(goal => ({
            id: goal.id,
            name: goal.title, // ✅ BUG FIX #6: Supabase field is 'title', not 'name'
            target: goal.target_amount,
            current: goal.current_amount,
            category: goal.category,
            icon: goal.icon || '🎯',
            fulfillment_status: goal.fulfillment_status || null,
            is_completed: goal.is_completed || false,
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

  // Verificando autenticação
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autorizado - será redirecionado
  if (!isAuthorized) {
    return null;
  }

  // Tela de loading dos dados
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👧</div>
          <div className="text-xl font-bold text-gray-700 mb-2">
            Carregando seu banco...
          </div>
          <div className="text-gray-800 font-medium">
            Conectando com Supabase
          </div>
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
                onClick={async () => {
                  try {
                    await signOut({
                      callbackUrl: '/auth/signin',
                      redirect: true,
                    });
                  } catch (error) {
                    console.error('❌ Erro ao fazer logout:', error);
                    window.location.href = '/auth/signin';
                  }
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

            {/* Pending Requests - Dados reais do Supabase + Empréstimos */}
            {(pendingPurchases.length > 0 || pendingRequests.length > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Meus Pedidos (
                  {pendingPurchases.length + pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {/* Mostrar pedidos de compra primeiro */}
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
                          <div className="text-sm text-gray-800 font-medium">
                            Pedido: {request.category} • R${' '}
                            {request.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-orange-700 font-medium">
                            Enviado{' '}
                            {new Date(request.created_at).toLocaleDateString(
                              'pt-BR'
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                            {request.status === 'pending'
                              ? 'Pendente'
                              : request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mostrar pedidos de empréstimo em seguida */}
                  {pendingRequests
                    .slice(0, 3 - pendingPurchases.slice(0, 3).length)
                    .map(request => (
                      <div
                        key={request.id}
                        className="bg-white rounded-lg p-3 border border-orange-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">💰</div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {request.reason}
                            </div>
                            <div className="text-sm text-gray-800 font-medium">
                              Empréstimo: {request.category} • R${' '}
                              {request.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-orange-700 font-medium">
                              Enviado{' '}
                              {new Date(request.requestedAt).toLocaleDateString(
                                'pt-BR'
                              )}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : request.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {request.status === 'pending'
                                ? '⏰ Aguardando'
                                : request.status === 'completed'
                                  ? '✅ Aprovado'
                                  : '❌ Negado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {pendingPurchases.length + pendingRequests.length > 3 && (
                    <div className="text-center text-orange-600 text-sm">
                      +{pendingPurchases.length + pendingRequests.length - 3}{' '}
                      outros pedidos pendentes
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
                      <div className="text-xs text-gray-800 font-medium">
                        {transaction.date}
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        transaction.type === 'received' ||
                        transaction.type === 'earning' ||
                        transaction.type === 'allowance' ||
                        transaction.type === 'interest'
                          ? 'text-green-600'
                          : transaction.type === 'loan'
                            ? 'text-blue-600'
                            : transaction.type === 'loan_payment' ||
                                transaction.type === 'spending'
                              ? 'text-red-500'
                              : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'received' ||
                      transaction.type === 'earning' ||
                      transaction.type === 'allowance' ||
                      transaction.type === 'interest'
                        ? '+'
                        : transaction.type === 'loan'
                          ? '+'
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
                      onClick={() => contributeToGoal(goal.id, goal.name)}
                      className="w-full bg-white border border-purple-200 rounded-lg p-3 flex items-center space-x-3 hover:bg-purple-50 transition-all"
                    >
                      <div className="text-2xl">{goal.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">
                          {goal.name}
                        </div>
                        <div className="text-xs text-gray-800 font-medium">
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
                  {/* Renderizar categorias dinâmicas para gastos */}
                  {availableCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => requestPurchase(category.name)}
                      className="bg-white border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-50 transition-all"
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-800 font-semibold">
                        Pedir aprovação
                      </div>
                    </button>
                  ))}
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

                <div className="flex justify-between text-xs text-gray-800 font-medium mb-3">
                  <span>
                    {Math.round((goal.current / goal.target) * 100)}% completo
                  </span>
                  <span>
                    Faltam R$ {(goal.target - goal.current).toFixed(2)}
                  </span>
                </div>

                {/* Lógica condicional baseada no status do sonho */}
                {goal.current >= goal.target ? (
                  // Sonho completo (100%)
                  goal.fulfillment_status === null ||
                  goal.fulfillment_status === undefined ? (
                    // Ainda não solicitou realização
                    <button
                      onClick={() => requestGoalFulfillment(goal.id, goal.name)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all animate-pulse"
                    >
                      🎁 Pedir aos Pais para Realizar
                    </button>
                  ) : goal.fulfillment_status === 'pending' ? (
                    // Aguardando aprovação dos pais
                    <div className="w-full bg-yellow-50 border-2 border-yellow-400 rounded-lg py-3 px-4 text-center">
                      <div className="text-yellow-700 font-semibold">
                        ⏳ Aguardando aprovação dos pais...
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Seus pais vão decidir em breve!
                      </div>
                    </div>
                  ) : goal.fulfillment_status === 'approved' ? (
                    // Sonho aprovado e realizado!
                    <div className="w-full bg-green-50 border-2 border-green-400 rounded-lg py-3 px-4 text-center">
                      <div className="text-green-700 font-bold text-lg">
                        ✅ Sonho realizado! 🎉
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Parabéns! Você conseguiu!
                      </div>
                    </div>
                  ) : goal.fulfillment_status === 'rejected' ? (
                    // Sonho recusado pelos pais
                    <div className="w-full bg-red-50 border-2 border-red-300 rounded-lg py-3 px-4 text-center">
                      <div className="text-red-700 font-semibold">
                        ❌ Não aprovado pelos pais
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Converse com seus pais sobre isso
                      </div>
                    </div>
                  ) : (
                    // Fallback - status desconhecido
                    <button
                      onClick={() => contributeToGoal(goal.id, goal.name)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                    >
                      💰 Contribuir para este sonho
                    </button>
                  )
                ) : (
                  // Sonho não completo - mostrar botão de contribuir
                  <button
                    onClick={() => contributeToGoal(goal.id, goal.name)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                  >
                    💰 Contribuir para este sonho
                  </button>
                )}
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
        {selectedTab === 'history' && currentChild && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Meu Histórico 📋
            </h2>
            <TransactionHistory childId={currentChild.id} />
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

        {/* Navigation - Mostrar APENAS para pais visualizando */}
        {session?.user && (session.user as any).role === 'parent' && (
          <div className="p-4 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg"
            >
              👨‍💼 Ver como Pai
            </button>

            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600"
            >
              🏠 Voltar ao Início
            </button>
          </div>
        )}
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
                className="text-gray-800 font-medium hover:text-gray-700 text-2xl"
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
                className="text-gray-800 font-medium hover:text-gray-700 text-2xl"
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
