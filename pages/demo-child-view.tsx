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
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
      await loadChildData(currentChild.id);

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
      await loadChildData(currentChild.id);

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

  // Função auxiliar para ícones de transação
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'allowance':
      case 'deposit':
      case 'gift':
        return { icon: '💰', color: 'text-primary' };
      case 'purchase':
      case 'spending':
      case 'withdrawal':
        return { icon: '🛒', color: 'text-error' };
      case 'goal_contribution':
        return { icon: '🎯', color: 'text-info' };
      case 'interest':
      case 'goal_interest':
        return { icon: '✨', color: 'text-warning' };
      case 'loan':
        return { icon: '🏦', color: 'text-info' };
      case 'loan_payment':
        return { icon: '💳', color: 'text-error' };
      default:
        return { icon: '💸', color: 'text-text-secondary' };
    }
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
        ? realTransactions.slice(0, 5).map(tx => {
            const txIcon = getTransactionIcon(tx.type);
            return {
              id: tx.id,
              type: tx.type as any,
              amount: tx.amount,
              description: tx.description || tx.category,
              date: new Date(tx.created_at).toLocaleDateString('pt-BR'),
              icon: txIcon.icon,
              color: txIcon.color,
            };
          })
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
          ? 'bg-gradient-to-r from-primary to-primary-light text-bg-primary shadow-lg scale-110'
          : 'text-text-secondary hover:bg-bg-secondary'
      }`}
    >
      <span className="text-xl sm:text-2xl mb-1">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );

  // Verificando autenticação
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <CardBody>
            <div className="text-center">
              <svg
                className="animate-spin h-16 w-16 text-primary mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-lg font-semibold text-text-primary">
                Verificando autenticação...
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Aguarde um momento
              </p>
            </div>
          </CardBody>
        </Card>
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
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <CardBody>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🏦</div>
              <p className="text-xl font-bold text-text-primary mb-2">
                Carregando seu banco...
              </p>
              <p className="text-text-secondary">Conectando com Supabase</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary animate-fadeInUp">
      {/* Header com fundo verde escuro e destaques em amarelo */}
      <div className="bg-gradient-to-br from-[#0D2818] to-[#1A4731] shadow-lg">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl sm:text-5xl">{childData.avatar}</div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Oi, {childData.name}! 👋
                </h1>
                <p className="text-sm text-primary">Seu banco pessoal</p>
              </div>
            </div>
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
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
                className="text-white/70 hover:text-primary mb-2"
              >
                🚪 Sair
              </Button>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                R$ {childData.balance.toFixed(2)}
              </div>
              <div className="text-xs text-white/60">Meu saldo</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-primary/30">
            <div className="flex justify-between items-center mb-2">
              <Badge
                variant="neutral"
                size="sm"
                className="bg-primary/20 text-primary border border-primary/40"
              >
                Nível {childData.level}
              </Badge>
              <span className="text-sm text-white font-semibold">
                {childData.xp} / {childData.xp + childData.xpToNext} XP
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-primary/90 mt-2 font-medium">
              Faltam {childData.xpToNext} XP para o próximo nível! 🚀
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto pb-20">
        {/* Home Tab */}
        {selectedTab === 'home' && (
          <div className="px-4 py-6 space-y-6">
            {/* Balance Card - DESTAQUE PRINCIPAL com gradiente verde vibrante */}
            <Card
              variant="elevated"
              padding="lg"
              className="bg-gradient-to-br from-success to-green-600 text-white shadow-2xl border-4 border-white/20"
            >
              <CardBody>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3 drop-shadow-lg">
                    R$ {childData.balance.toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold text-white/90 mb-6">
                    💰 Meu Dinheiro Disponível
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setSelectedTab('use-money')}
                    className="w-full text-lg font-bold shadow-xl"
                  >
                    ✨ Usar Meu Dinheiro
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Active Loan Alert */}
            {childData.activeLoan && (
              <Card
                variant="outline"
                padding="md"
                className="border-warning border-2 bg-warning/5"
              >
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏦</div>
                    <div className="flex-1">
                      <div className="font-bold text-warning">
                        Empréstimo Ativo
                      </div>
                      <div className="text-sm text-text-primary">
                        R$ {childData.activeLoan.amount.toFixed(2)} -{' '}
                        {childData.activeLoan.reason}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Empréstimo sem juros
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTab('use-money')}
                    >
                      💳 Pagar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Streak Card */}
            <Card
              variant="elevated"
              padding="md"
              className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white shadow-xl border-2 border-primary/30"
            >
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-primary">
                      {childData.currentStreak} dias
                    </div>
                    <div className="text-sm text-white/90 font-medium">
                      Sequência de tarefas! 🔥
                    </div>
                  </div>
                  <div className="text-5xl">🏆</div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      alert('Em breve: Ver suas tarefas pendentes!')
                    }
                    className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40"
                  >
                    Ver Minhas Tarefas
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Interest Card */}
            {childData.balance >= 10 ? (
              <Card
                variant="elevated"
                padding="md"
                className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white shadow-xl border-2 border-primary/30"
              >
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        R$ {(childData.balance * 0.01).toFixed(2)}
                      </div>
                      <div className="text-sm text-white/90">
                        Seu dinheiro está rendendo! 📈
                      </div>
                    </div>
                    <div className="text-4xl">💎</div>
                  </div>
                  <div className="text-xs text-white/80 space-y-1">
                    <p>
                      Com R$ {childData.balance.toFixed(2)} você pode ganhar até
                      <span className="text-primary font-bold">
                        {' '}
                        R$ {(childData.balance * 0.01).toFixed(2)}
                      </span>{' '}
                      por mês
                    </p>
                    <p>⏰ Só rende o dinheiro que está há 30+ dias na conta</p>
                    <p>📊 Taxa: 1% ao mês • Mínimo: R$ 10,00</p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card
                variant="outline"
                padding="md"
                className="border-primary/30 bg-[#1A4731]/20"
              >
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        R$ 10,00
                      </div>
                      <div className="text-sm text-text-secondary">
                        Meta para começar a render! 💰
                      </div>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>
                      Economize mais{' '}
                      <span className="text-primary font-bold">
                        R$ {(10 - childData.balance).toFixed(2)}
                      </span>{' '}
                      para seu dinheiro começar a render 1% ao mês!
                    </p>
                    <p>
                      ⏰ Condição: O dinheiro precisa ficar 30 dias na conta
                    </p>
                    <p>📊 Taxa: 1% ao mês • Mínimo: R$ 10,00</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Pending Requests */}
            {(pendingPurchases.length > 0 || pendingRequests.length > 0) && (
              <Card
                variant="outline"
                padding="md"
                className="border-warning border-2"
              >
                <CardHeader
                  title={`📋 Meus Pedidos (${pendingPurchases.length + pendingRequests.length})`}
                  subtitle="Aguardando aprovação dos pais"
                />
                <CardBody>
                  <div className="space-y-3">
                    {/* Pedidos de compra */}
                    {pendingPurchases.slice(0, 3).map(request => (
                      <div
                        key={request.id}
                        className="bg-bg-secondary rounded-lg p-3 sm:p-4 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🛒</div>
                          <div className="flex-1">
                            <div className="font-semibold text-text-primary">
                              {request.item_name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {request.category} • R${' '}
                              {request.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-text-muted">
                              {new Date(request.created_at).toLocaleDateString(
                                'pt-BR'
                              )}
                            </div>
                          </div>
                          <Badge variant="warning" size="sm">
                            Pendente
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Pedidos de empréstimo */}
                    {pendingRequests
                      .slice(0, 3 - pendingPurchases.slice(0, 3).length)
                      .map(request => (
                        <div
                          key={request.id}
                          className="bg-bg-secondary rounded-lg p-3 sm:p-4 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">💰</div>
                            <div className="flex-1">
                              <div className="font-semibold text-text-primary">
                                {request.reason}
                              </div>
                              <div className="text-sm text-text-secondary">
                                Empréstimo • R$ {request.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-text-muted">
                                {new Date(
                                  request.requestedAt
                                ).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <Badge
                              variant={
                                request.status === 'pending'
                                  ? 'warning'
                                  : request.status === 'completed'
                                    ? 'success'
                                    : 'error'
                              }
                              size="sm"
                            >
                              {request.status === 'pending'
                                ? '⏰'
                                : request.status === 'completed'
                                  ? '✅'
                                  : '❌'}
                            </Badge>
                          </div>
                        </div>
                      ))}

                    {pendingPurchases.length + pendingRequests.length > 3 && (
                      <div className="text-center text-text-secondary text-sm font-medium">
                        +{pendingPurchases.length + pendingRequests.length - 3}{' '}
                        outros pedidos
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <Button
                      variant="primary"
                      fullWidth
                      size="md"
                      onClick={() =>
                        router.push(
                          `/child-loan-requests?childId=${currentChild?.id}`
                        )
                      }
                    >
                      📋 Ver Todos os Pedidos
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Next Allowance */}
            <Card
              variant="default"
              padding="md"
              className="bg-[#1A4731]/20 border-primary/30"
            >
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🗓️</div>
                  <div className="flex-1">
                    <div className="font-bold text-primary">Próxima Mesada</div>
                    <div className="text-sm text-text-primary font-medium">
                      <span className="text-primary font-bold">
                        R$ {childData.weeklyAllowance.toFixed(2)}
                      </span>{' '}
                      em {childData.nextAllowanceDate}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Transactions com ícones coloridos */}
            <Card variant="elevated" padding="none">
              <CardHeader
                title="Últimas Atividades"
                subtitle="Seu histórico recente"
              />
              <CardBody>
                <div className="divide-y divide-border">
                  {childData.recentTransactions.slice(0, 5).map(transaction => (
                    <div
                      key={transaction.id}
                      className="p-4 flex items-center gap-3 hover:bg-bg-secondary transition-colors"
                    >
                      <div className={`text-3xl ${transaction.color}`}>
                        {transaction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-text-primary">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-text-secondary font-medium">
                          {transaction.date}
                        </div>
                      </div>
                      <div
                        className={`font-bold text-lg ${
                          transaction.type === 'allowance' ||
                          transaction.type === 'deposit' ||
                          transaction.type === 'gift' ||
                          transaction.type === 'interest' ||
                          transaction.type === 'loan' ||
                          transaction.type === 'goal_interest'
                            ? 'text-success'
                            : 'text-error'
                        }`}
                      >
                        {transaction.type === 'allowance' ||
                        transaction.type === 'deposit' ||
                        transaction.type === 'gift' ||
                        transaction.type === 'interest' ||
                        transaction.type === 'loan' ||
                        transaction.type === 'goal_interest'
                          ? '+'
                          : '-'}
                        R$ {Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Use Money Tab */}
        {selectedTab === 'use-money' && (
          <div className="px-4 py-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-text-primary">
                Usar Meu Dinheiro
              </h2>
              <div className="text-2xl text-success font-bold mt-2">
                R$ {childData.balance.toFixed(2)} disponível
              </div>
            </div>

            {/* Allocation Options */}
            <div className="space-y-4">
              {/* Request Loan */}
              <Card
                variant="default"
                padding="lg"
                className="bg-[#1A4731]/20 border-primary/30 border-2"
              >
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🏦</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-lg">
                        Pedir Emprestado
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Empréstimo sem juros dos seus pais
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={requestLoan}
                    >
                      💳 Solicitar Empréstimo
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      size="md"
                      onClick={() =>
                        router.push(
                          `/child-loan-requests?childId=${currentChild?.id}`
                        )
                      }
                    >
                      📋 Ver Meus Pedidos
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Pay Loan */}
              {childData.activeLoan && (
                <Card
                  variant="default"
                  padding="lg"
                  className="bg-warning/10 border-warning border-2"
                >
                  <CardBody>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl">💰</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-warning text-lg">
                          Pagar Empréstimo
                        </h3>
                        <p className="text-sm text-text-secondary">
                          R$ {childData.activeLoan.amount.toFixed(2)} -{' '}
                          {childData.activeLoan.reason}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      fullWidth
                      size="lg"
                      onClick={payLoan}
                    >
                      💳 Pagar Empréstimo
                    </Button>
                  </CardBody>
                </Card>
              )}

              {/* Contribute to Goals */}
              <Card
                variant="default"
                padding="lg"
                className="bg-primary/10 border-primary border-2"
              >
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-lg">
                        Guardar para Sonho
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Contribuir para uma das suas metas
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {childData.goals.map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => contributeToGoal(goal.id, goal.name)}
                        className="w-full bg-bg-secondary hover:bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3 transition-all"
                      >
                        <div className="text-3xl">{goal.icon}</div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-text-primary">
                            {goal.name}
                          </div>
                          <div className="text-xs text-text-secondary font-medium">
                            R$ {goal.current.toFixed(2)} de R${' '}
                            {goal.target.toFixed(2)} (
                            {Math.round((goal.current / goal.target) * 100)}%)
                          </div>
                          <div className="w-full bg-border rounded-full h-2 mt-2">
                            <div
                              className="bg-gradient-to-r from-primary to-success h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-primary font-bold text-xl">→</div>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Buy Something */}
              <Card
                variant="default"
                padding="lg"
                className="bg-success/10 border-success border-2"
              >
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">🛒</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-success text-lg">
                        Comprar Agora
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Escolher algo para comprar
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {availableCategories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => requestPurchase(category.name)}
                        className="bg-bg-secondary hover:bg-bg-card border border-border rounded-xl p-4 text-center transition-all"
                      >
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="text-sm font-bold text-text-primary">
                          {category.name}
                        </div>
                        <div className="text-xs text-text-secondary font-medium mt-1">
                          Pedir aprovação
                        </div>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="text-center mt-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setSelectedTab('home')}
              >
                ← Voltar para Início
              </Button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {selectedTab === 'goals' && (
          <div className="px-4 py-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text-primary">
                Meus Sonhos 🌟
              </h2>
              <Button variant="primary" size="sm" onClick={requestNewGoal}>
                + Novo Sonho
              </Button>
            </div>

            {childData.goals.map(goal => (
              <Card key={goal.id} variant="elevated" padding="lg" hover>
                <CardBody>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{goal.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary text-lg">
                        {goal.name}
                      </h3>
                      <div className="text-sm text-text-secondary font-medium">
                        R$ {goal.current.toFixed(2)} de R${' '}
                        {goal.target.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-border rounded-full h-3 mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-text-secondary font-semibold mb-3">
                    <span>
                      {Math.round((goal.current / goal.target) * 100)}% completo
                    </span>
                    <span>
                      Faltam R$ {(goal.target - goal.current).toFixed(2)}
                    </span>
                  </div>

                  {/* Lógica condicional baseada no status */}
                  {goal.current >= goal.target ? (
                    goal.fulfillment_status === null ||
                    goal.fulfillment_status === undefined ? (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() =>
                          requestGoalFulfillment(goal.id, goal.name)
                        }
                        className="animate-pulse"
                      >
                        🎁 Pedir aos Pais para Realizar
                      </Button>
                    ) : goal.fulfillment_status === 'pending' ? (
                      <div className="w-full bg-warning/10 border-2 border-warning rounded-xl py-3 px-4 text-center">
                        <Badge variant="warning" size="md">
                          ⏳ Aguardando aprovação dos pais...
                        </Badge>
                        <div className="text-xs text-text-secondary mt-2">
                          Seus pais vão decidir em breve!
                        </div>
                      </div>
                    ) : goal.fulfillment_status === 'approved' ? (
                      <div className="w-full bg-success/10 border-2 border-success rounded-xl py-3 px-4 text-center">
                        <div className="text-success font-bold text-lg">
                          ✅ Sonho realizado! 🎉
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Parabéns! Você conseguiu!
                        </div>
                      </div>
                    ) : goal.fulfillment_status === 'rejected' ? (
                      <div className="w-full bg-error/10 border-2 border-error rounded-xl py-3 px-4 text-center">
                        <div className="text-error font-semibold">
                          ❌ Não aprovado pelos pais
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Converse com seus pais sobre isso
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => contributeToGoal(goal.id, goal.name)}
                      >
                        💰 Contribuir para este sonho
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => contributeToGoal(goal.id, goal.name)}
                    >
                      💰 Contribuir para este sonho
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}

            <Card
              variant="outline"
              padding="lg"
              className="border-primary border-2 bg-primary/5"
            >
              <CardBody>
                <div className="text-center">
                  <div className="text-5xl mb-3">✨</div>
                  <h3 className="font-bold text-primary text-lg mb-2">
                    Tem um novo sonho?
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Crie uma nova meta e peça aprovação dos seus pais!
                  </p>
                  <Button variant="primary" onClick={requestNewGoal}>
                    🌟 Criar Novo Sonho
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="px-4 py-6 space-y-4">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Minhas Conquistas 🏆
            </h2>

            {/* Locked Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Achievement 1: First Allowance */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">💰</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Primeira Mesada
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Receba sua primeira mesada semanal
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        EM BREVE
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Achievement 2: First Dream */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">🎁</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Primeiro Sonho Realizado
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Complete e realize seu primeiro sonho
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        EM BREVE
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Achievement 3: Streak */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">🔥</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Sequência de 10 Dias
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Complete tarefas por 10 dias seguidos
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        0/10 dias
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Achievement 4: First Purchase */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">🛒</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Primeira Compra
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Faça seu primeiro pedido de compra aprovado
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        EM BREVE
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Achievement 5: Saver */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">🏦</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Poupador Iniciante
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Economize R$ 50,00 ou mais
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        R$ 0,00 / R$ 50,00
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Achievement 6: Level 5 */}
              <Card
                variant="default"
                padding="md"
                className="relative overflow-hidden bg-[#1A4731]/20 border-2 border-white/10 opacity-60"
              >
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl grayscale">⭐</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white/50 text-lg">
                        🔒 Nível 5 Alcançado
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        Alcance o nível 5 ganhando experiência
                      </p>
                      <div className="mt-2 text-xs text-white/30 font-semibold">
                        Nível 1 / 5
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Info Card */}
            <Card
              variant="elevated"
              padding="md"
              className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/30"
            >
              <CardBody>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-bold text-primary text-lg mb-2">
                    Desbloqueie Conquistas!
                  </h3>
                  <p className="text-white/80 text-sm">
                    Complete tarefas, economize dinheiro e realize seus sonhos
                    para desbloquear troféus incríveis!
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && currentChild && (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Meu Histórico 📋
            </h2>
            <TransactionHistory childId={currentChild.id} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-2">
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
      </div>

      {/* Navigation - Mostrar APENAS para pais visualizando */}
      {session?.user && (session.user as any).role === 'parent' && (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => router.push('/dashboard')}
            >
              👨‍💼 Ver como Pai
            </Button>
            <Button variant="ghost" fullWidth onClick={() => router.push('/')}>
              🏠 Início
            </Button>
          </div>
        </div>
      )}

      {/* Modal Novo Sonho */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            variant="elevated"
            padding="lg"
            className="max-w-xs sm:max-w-md w-full"
          >
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">
                  🌟 Criar Novo Sonho
                </h2>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="text-text-secondary hover:text-text-primary text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Qual é o seu sonho?
                  </label>
                  <input
                    type="text"
                    value={newGoalData.name}
                    onChange={e =>
                      setNewGoalData({ ...newGoalData, name: e.target.value })
                    }
                    placeholder="Ex: Nintendo Switch, Bicicleta nova..."
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Quanto custa?
                  </label>
                  <input
                    type="text"
                    value={newGoalData.amount}
                    onChange={e =>
                      setNewGoalData({ ...newGoalData, amount: e.target.value })
                    }
                    placeholder="Ex: 1299.00"
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Categoria do sonho
                  </label>
                  <select
                    value={newGoalData.category}
                    onChange={e =>
                      setNewGoalData({
                        ...newGoalData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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

              <div className="flex gap-3 mt-6">
                <Button variant="primary" fullWidth onClick={submitNewGoal}>
                  📨 Enviar para Aprovação
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modal Pedir Empréstimo */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            variant="elevated"
            padding="lg"
            className="max-w-xs sm:max-w-md w-full"
          >
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">
                  🏦 Pedir Empréstimo
                </h2>
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="text-text-secondary hover:text-text-primary text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-info/10 border border-info rounded-xl p-4 mb-4">
                <p className="text-sm text-info">
                  💡 Lembre-se: Empréstimos são <strong>sem juros</strong>, mas
                  precisam ser pagos de volta!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Para que você precisa?
                  </label>
                  <input
                    type="text"
                    value={newLoanData.reason}
                    onChange={e =>
                      setNewLoanData({ ...newLoanData, reason: e.target.value })
                    }
                    placeholder="Ex: Comprar material escolar..."
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-info focus:border-info"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Quanto você precisa?
                  </label>
                  <input
                    type="text"
                    value={newLoanData.amount}
                    onChange={e =>
                      setNewLoanData({ ...newLoanData, amount: e.target.value })
                    }
                    placeholder="Ex: 50.00"
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-info focus:border-info"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Categoria do empréstimo
                  </label>
                  <select
                    value={newLoanData.category}
                    onChange={e =>
                      setNewLoanData({
                        ...newLoanData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 min-h-[44px] bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-info focus:border-info"
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

              <div className="flex gap-3 mt-6">
                <Button variant="primary" fullWidth onClick={submitLoanRequest}>
                  📨 Solicitar Empréstimo
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowLoanModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
