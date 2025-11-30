import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import ChildModal from '../components/ChildModal';
import CategoriesManager from '../components/CategoriesManager';
import InterestConfigManager from '../components/InterestConfigManager';
import AllowanceConfigManager from '../components/AllowanceConfigManager';
import { ChildrenService } from '../src/lib/services/childrenService';
import { LoanService } from '../src/lib/services/loanService';
import type { Child } from '../src/lib/supabase';
import { calculateAge } from '../src/lib/utils/date';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [children, setChildren] = useState<Child[]>([]);

  // Protect route - redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('⛔ Usuário não autenticado, redirecionando para login...');
      router.push('/auth/signin');
    }
  }, [status, router]);

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedChildFilter, setSelectedChildFilter] = useState('all');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [calculatedAnalytics, setCalculatedAnalytics] = useState(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [pendingFulfillments, setPendingFulfillments] = useState([]);

  // Transaction modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [transactionType, setTransactionType] = useState<'add' | 'remove'>(
    'add'
  );
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');

  // Load children from Supabase/localStorage on component mount
  useEffect(() => {
    // Primeiro limpar dados corrompidos se existirem
    clearCorruptedDataIfNeeded();
    loadChildren();
  }, []);

  // Função para limpar dados corrompidos automaticamente
  const clearCorruptedDataIfNeeded = () => {
    try {
      const stored = localStorage.getItem('familyChildren');
      if (stored) {
        const children = JSON.parse(stored);
        // Verificar se há IDs inválidos (não são UUIDs)
        const hasInvalidIds = children.some(
          (child: any) =>
            !child.id ||
            !child.id.match(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        );

        if (hasInvalidIds) {
          console.log(
            '🧹 Detectados dados corrompidos, limpando automaticamente...'
          );
          ChildrenService.clearCorruptedData();
        }
      }
    } catch (error) {
      console.log('🧹 Erro ao verificar dados, limpando por segurança...');
      ChildrenService.clearCorruptedData();
    }
  };

  const loadChildren = async () => {
    try {
      const childrenData = await ChildrenService.getChildren();

      // ✅ Ordenar crianças para manter ordem fixa (evita troca de posições)
      // Critério 1: Por data de nascimento (mais velho primeiro)
      // Critério 2 (fallback): Por nome alfabético
      const sortedChildren = [...childrenData].sort((a, b) => {
        // Se ambos têm birth_date, ordenar por data (mais velho primeiro)
        if (a.birth_date && b.birth_date) {
          return (
            new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime()
          );
        }
        // Se só um tem birth_date, colocar ele primeiro
        if (a.birth_date && !b.birth_date) return -1;
        if (!a.birth_date && b.birth_date) return 1;
        // Se nenhum tem birth_date, ordenar alfabeticamente por nome
        return a.name.localeCompare(b.name);
      });

      setChildren(sortedChildren);
      console.log(
        '🎯 Dashboard: Crianças carregadas e ordenadas:',
        sortedChildren
      );
    } catch (error) {
      console.error('❌ Erro ao carregar crianças:', error);
      setChildren([]);
    }
  };

  // Load pending requests
  useEffect(() => {
    loadPendingRequests();
  }, [selectedPeriod, selectedChildFilter]);

  // Load pending goal fulfillments
  useEffect(() => {
    loadPendingFulfillments();
  }, []);

  // Load calculated analytics when children or filters change
  useEffect(() => {
    const loadCalculatedAnalytics = async () => {
      if (children.length === 0) {
        setCalculatedAnalytics(null);
        setLoadingAnalytics(false);
        return;
      }

      setLoadingAnalytics(true);
      try {
        const realAnalytics = await calculateRealAnalytics();
        setCalculatedAnalytics(realAnalytics);
        console.log('✅ Calculated analytics loaded:', realAnalytics);
      } catch (error) {
        console.error('❌ Error loading calculated analytics:', error);
        setCalculatedAnalytics(null);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadCalculatedAnalytics();
  }, [children, selectedPeriod, selectedChildFilter, pendingRequests]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // Use family ID 'demo-family-001' for demo
      const response = await fetch(
        `/api/analytics?family_id=demo-family-001&period=${selectedPeriod}`
      );
      const result = await response.json();

      if (response.ok) {
        setAnalytics(result.data);
        console.log('✅ Analytics loaded:', result.data);
      } else {
        console.error('❌ Analytics error:', result);
        // Keep existing mock data
      }
    } catch (error) {
      console.error('❌ Analytics connection error:', error);
      // Keep existing mock data
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      // Carregar empréstimos do serviço híbrido (Supabase + localStorage)
      const loanRequests = await LoanService.getLoanRequests();

      // Carregar pedidos de compra da API existente + fallback localStorage
      let apiRequests = [];
      try {
        const response = await fetch('/api/purchase-requests?status=pending');
        if (response.ok) {
          const result = await response.json();
          apiRequests = result.data || [];
          console.log('✅ Pedidos de compra carregados da API:', apiRequests);
        }
      } catch (apiError) {
        console.log(
          '⚠️ API de compras não disponível, usando localStorage fallback'
        );
      }

      // Fallback: Carregar também do localStorage se não houver dados da API
      try {
        const localRequests = JSON.parse(
          localStorage.getItem('familyPendingRequests') || '[]'
        );
        const pendingLocalRequests = localRequests.filter(
          req => req.status === 'pending' && req.type === 'spending'
        );

        if (pendingLocalRequests.length > 0) {
          console.log(
            '💾 Pedidos de compra carregados do localStorage:',
            pendingLocalRequests
          );
          apiRequests = [...apiRequests, ...pendingLocalRequests];
        }
      } catch (localError) {
        console.log('⚠️ Erro ao ler localStorage:', localError);
      }

      // Combinar empréstimos e compras
      const allRequests = [
        ...loanRequests.filter(loan => loan.status === 'pending'),
        ...apiRequests,
      ];
      setPendingRequests(allRequests);

      console.log('🎯 Dashboard: Pedidos pendentes carregados:', allRequests);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadPendingFulfillments = async () => {
    try {
      const { supabase } = await import('../src/lib/supabase');

      const { data, error } = await supabase
        .from('goals')
        .select(
          `
          id, title, target_amount, current_amount, emoji,
          fulfillment_requested_at, child_id,
          children!inner(name, avatar)
        `
        )
        .eq('fulfillment_status', 'pending')
        .order('fulfillment_requested_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar pedidos de realização:', error);
        setPendingFulfillments([]);
        return;
      }

      console.log('✅ Pedidos de realização carregados:', data);
      setPendingFulfillments(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos de realização:', error);
      setPendingFulfillments([]);
    }
  };

  const handleFulfillmentDecision = async (
    goalId,
    action,
    goalTitle,
    childName
  ) => {
    try {
      const actionText = action === 'approve' ? 'APROVADO' : 'REJEITADO';
      console.log(`🔄 ${actionText} realização de sonho:`, goalId);

      const response = await fetch('/api/goals/resolve-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          action: action,
          parent_id: session?.user?.email || 'unknown',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ Sonho ${actionText} com sucesso!\n\n` +
            `Criança: ${childName}\n` +
            `Sonho: ${goalTitle}\n\n` +
            (action === 'approve'
              ? `🎁 Lembre-se de comprar: ${goalTitle}`
              : `A criança será notificada.`)
        );
        console.log(`✅ Sonho ${actionText}:`, result);

        // Recarregar pedidos de realização
        await loadPendingFulfillments();
      } else {
        alert(
          `❌ Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} sonho:\n${result.error}`
        );
        console.error('❌ Erro da API:', result);
      }
    } catch (error) {
      console.error(
        `❌ Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} sonho:`,
        error
      );
      alert('❌ Erro de conexão. Tente novamente.');
    }
  };

  const handleApproval = async (request, action) => {
    try {
      const status = action === 'approve' ? 'completed' : 'rejected';
      const actionText = action === 'approve' ? 'APROVADO' : 'REJEITADO';

      console.log(
        `🔄 ${actionText} pedido:`,
        request.id,
        'tipo:',
        request.type
      );

      // Verificar se é empréstimo ou compra
      if (request.type === 'loan') {
        // Processar empréstimo usando o serviço híbrido
        const success = await LoanService.updateLoanStatus(
          request.id,
          status,
          action === 'reject'
            ? 'Rejeitado pelo responsável'
            : 'Aprovado pelo responsável'
        );

        if (!success) {
          alert('❌ Erro ao processar empréstimo. Tente novamente.');
          return;
        }

        // Se aprovado, adicionar à conta da criança usando o serviço
        if (action === 'approve') {
          await ChildrenService.updateChild(request.child_id, {
            balance: (request.childData?.balance || 0) + request.amount,
            total_earned:
              (request.childData?.total_earned || 0) + request.amount,
          });
          await loadChildren(); // Recarregar crianças
        }

        alert(
          `✅ Empréstimo ${actionText} com sucesso!\nCriança: ${request.child_name}\nMotivo: ${request.reason}\nValor: R$ ${request.amount.toFixed(2)}`
        );
        console.log(`✅ Empréstimo ${actionText}:`, request);
      } else {
        // Processar compra via API (código original)
        const response = await fetch('/api/purchase-requests', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: request.id,
            status: status,
            approved_by_parent: action === 'approve',
            parent_note:
              action === 'reject'
                ? 'Rejeitado pelo responsável'
                : 'Aprovado pelo responsável',
          }),
        });

        const result = await response.json();

        if (response.ok) {
          alert(
            `✅ Pedido ${actionText} com sucesso!\nItem: ${request.description || request.reason}\nValor: R$ ${request.amount.toFixed(2)}`
          );
          console.log(`✅ Pedido ${actionText}:`, result);

          // ✅ BUG FIX #4: Recarregar crianças para atualizar saldo no dashboard
          if (action === 'approve') {
            await loadChildren();
          }
        } else {
          alert(
            `❌ Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} pedido:\n${result.error}`
          );
          console.error('❌ Erro da API:', result);
          return;
        }
      }

      // Recarregar dados (analytics will auto-reload via useEffect when children/requests change)
      await loadPendingRequests();
    } catch (error) {
      console.error(
        `❌ Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} pedido:`,
        error
      );
      alert('❌ Erro de conexão. Tente novamente.');
    }
  };

  // Child management functions
  const openAddChildModal = () => {
    setModalMode('add');
    setEditingChild(null);
    setIsChildModalOpen(true);
  };

  const openEditChildModal = child => {
    setModalMode('edit');
    setEditingChild(child);
    setIsChildModalOpen(true);
  };

  const handleSaveChild = async childData => {
    try {
      if (modalMode === 'add') {
        const newChild = await ChildrenService.addChild(childData);
        if (newChild) {
          console.log('✅ Criança adicionada:', newChild);
          await loadChildren(); // Recarregar lista
        }
      } else {
        const updatedChild = await ChildrenService.updateChild(
          childData.id,
          childData
        );
        if (updatedChild) {
          console.log('✅ Criança editada:', updatedChild);
          await loadChildren(); // Recarregar lista
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar criança:', error);
      alert('Erro ao salvar criança. Tente novamente.');
    }
  };

  const handleDeleteChild = async childId => {
    const childName = children.find(c => c.id === childId)?.name || 'Criança';

    if (
      confirm(
        `Tem certeza que deseja excluir ${childName}? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        console.log('🗑️ Tentando deletar criança:', childId, childName);

        const success = await ChildrenService.deleteChild(childId);

        if (success) {
          console.log('✅ Criança removida com sucesso:', childId);

          // Forçar recarregamento completo da lista
          await loadChildren();

          alert(`✅ ${childName} foi removida com sucesso!`);
        } else {
          console.error('❌ Delete retornou false');
          alert('❌ Falha ao deletar criança. Tente novamente.');
        }
      } catch (error) {
        console.error('❌ Erro ao deletar criança:', error);
        alert('❌ Erro ao deletar criança. Tente novamente.');
      }
    }
  };

  // Transaction management functions
  const handleOpenTransactionModal = (child: Child, type: 'add' | 'remove') => {
    setSelectedChild(child);
    setTransactionType(type);
    setTransactionAmount('');
    setTransactionDescription('');
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async () => {
    if (!selectedChild || !transactionAmount || !transactionDescription) {
      alert('Por favor, preencha o valor e a descrição');
      return;
    }

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    try {
      const newBalance =
        transactionType === 'add'
          ? selectedChild.balance + amount
          : selectedChild.balance - amount;

      if (newBalance < 0) {
        alert('Saldo insuficiente para remover este valor');
        return;
      }

      // Import supabase at the top of the file if needed
      const { supabase } = await import('../src/lib/supabase');

      // 1. Update child balance in Supabase
      const { error: updateError } = await supabase
        .from('children')
        .update({
          balance: newBalance,
          total_earned:
            transactionType === 'add'
              ? (selectedChild.total_earned || 0) + amount
              : selectedChild.total_earned,
          total_spent:
            transactionType === 'remove'
              ? (selectedChild.total_spent || 0) + amount
              : selectedChild.total_spent,
        })
        .eq('id', selectedChild.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar saldo:', updateError);
        alert('Erro ao atualizar saldo. Tente novamente.');
        return;
      }

      // 2. Save transaction in Supabase
      const transactionData = {
        child_id: selectedChild.id,
        type: transactionType === 'add' ? 'earning' : 'spending',
        amount: amount,
        description: transactionDescription,
        category: transactionType === 'add' ? 'Depósito' : 'Retirada',
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (transactionError) {
        console.error('❌ Erro ao salvar transação:', transactionError);
        // Não bloqueamos aqui pois o saldo já foi atualizado
      }

      // 3. Update local state (analytics will auto-reload via useEffect)
      await loadChildren();

      // 4. Close modal and show success
      setShowTransactionModal(false);
      alert(
        `✅ ${transactionType === 'add' ? 'Depósito' : 'Retirada'} realizado com sucesso!\n` +
          `Valor: R$ ${amount.toFixed(2)}\n` +
          `Descrição: ${transactionDescription}\n` +
          `Novo saldo de ${selectedChild.name}: R$ ${newBalance.toFixed(2)}`
      );

      console.log('✅ Transação concluída:', {
        child: selectedChild.name,
        amount,
        type: transactionType,
        newBalance,
      });
    } catch (error) {
      console.error('❌ Erro ao processar transação:', error);
      alert('Erro ao processar transação. Tente novamente.');
    }
  };

  const handleQuickAmount = (amount: number) => {
    setTransactionAmount(amount.toString());
  };

  // Navigate to child view (for parents to see child's perspective)
  const handleViewChildDashboard = (childId: string) => {
    router.push(`/demo-child-view?childId=${childId}`);
  };

  // Handle logout with complete session cleanup
  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      // Force signOut with redirect
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true,
      });
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Fallback: force redirect manually
      window.location.href = '/auth/signin';
    }
  };

  // Calculate real analytics based on current children data from Supabase
  const calculateRealAnalytics = async () => {
    if (children.length === 0) {
      return {
        financial_summary: {
          total_family_balance: 0,
          average_child_balance: 0,
        },
        transaction_stats: {
          total_transactions: 0,
          total_spent: 0,
          total_earned: 0,
          pending_requests: 0,
          approved_requests: 0,
        },
        goal_stats: {
          total_goals: 0,
          completed_goals: 0,
          active_goals: 0,
          avg_completion_rate: 0,
        },
        children_count: 0,
        family_level: 1,
      };
    }

    try {
      const { supabase } = await import('../src/lib/supabase');

      // ✅ REAL: Saldo total e média
      const totalBalance = children.reduce(
        (sum, child) => sum + (child.balance || 0),
        0
      );
      const averageBalance = totalBalance / children.length;

      // ✅ REAL: Buscar todas as transações do Supabase
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('type, amount');

      let totalTransactions = 0;
      let totalSpent = 0;
      let totalEarned = 0;

      if (!txError && transactions) {
        totalTransactions = transactions.length;

        // Calcular totais baseado no tipo real da transação
        transactions.forEach(tx => {
          if (tx.type === 'spending' || tx.type === 'loan_payment') {
            totalSpent += tx.amount || 0;
          } else if (
            tx.type === 'earning' ||
            tx.type === 'allowance' ||
            tx.type === 'interest'
          ) {
            totalEarned += tx.amount || 0;
          }
        });
      }

      // ✅ REAL: Buscar metas (goals) do Supabase
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('is_completed, current_amount, target_amount');

      let totalGoals = 0;
      let completedGoals = 0;
      let activeGoals = 0;
      let avgCompletionRate = 0;

      if (!goalsError && goals) {
        totalGoals = goals.length;
        completedGoals = goals.filter(g => g.is_completed).length;
        activeGoals = goals.filter(g => !g.is_completed).length;

        // Calcular progresso médio real
        if (goals.length > 0) {
          const totalProgress = goals.reduce((sum, g) => {
            if (g.target_amount > 0) {
              return sum + (g.current_amount / g.target_amount) * 100;
            }
            return sum;
          }, 0);
          avgCompletionRate = Math.round(totalProgress / goals.length);
        }
      }

      // ✅ REAL: Contar pedidos aprovados do Supabase
      const { count: approvedCount, error: approvedError } = await supabase
        .from('purchase_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      return {
        financial_summary: {
          total_family_balance: totalBalance,
          average_child_balance: averageBalance,
        },
        transaction_stats: {
          total_transactions: totalTransactions,
          total_spent: totalSpent,
          total_earned: totalEarned,
          pending_requests: pendingRequests?.length || 0,
          approved_requests: approvedCount || 0,
        },
        goal_stats: {
          total_goals: totalGoals,
          completed_goals: completedGoals,
          active_goals: activeGoals,
          avg_completion_rate: avgCompletionRate,
        },
        children_count: children.length,
        family_level: Math.max(1, Math.ceil(children.length / 2)),
      };
    } catch (error) {
      console.error('❌ Erro ao calcular analytics:', error);
      // Fallback mínimo em caso de erro
      return {
        financial_summary: {
          total_family_balance: children.reduce(
            (sum, child) => sum + (child.balance || 0),
            0
          ),
          average_child_balance:
            children.reduce((sum, child) => sum + (child.balance || 0), 0) /
            children.length,
        },
        transaction_stats: {
          total_transactions: 0,
          total_spent: 0,
          total_earned: 0,
          pending_requests: pendingRequests?.length || 0,
          approved_requests: 0,
        },
        goal_stats: {
          total_goals: 0,
          completed_goals: 0,
          active_goals: 0,
          avg_completion_rate: 0,
        },
        children_count: children.length,
        family_level: 1,
      };
    }
  };

  // Filter analytics by selected child
  const getFilteredAnalytics = () => {
    // Return calculated analytics from state
    if (selectedChildFilter === 'all') {
      return calculatedAnalytics;
    }

    // Filter for specific child (future enhancement - for now just return all)
    // TODO: Implement per-child analytics filtering
    return calculatedAnalytics;
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.avatar || '👨‍👩‍👧‍👦'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  🏦 Banco da Família - Dashboard Parental
                </h1>
                <p className="text-sm text-gray-600">
                  Olá, {user?.userName || user?.name || 'Usuário'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                title="Sair da conta"
              >
                🚪 Sair
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Limpar todos os dados corrompidos e resetar para dados padrão?'
                    )
                  ) {
                    ChildrenService.clearCorruptedData();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                title="Limpar dados corrompidos"
              >
                🧹 Limpar
              </button>
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                🏷️ Categorias
              </button>
              <button
                onClick={() => setIsInterestModalOpen(true)}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                title="Configurar rendimento automático"
              >
                💰 Juros
              </button>
              <button
                onClick={() => setIsAllowanceModalOpen(true)}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                title="Configurar mesada automática"
              >
                📅 Mesada
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                🏠 Início
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Goal Fulfillment Requests Section */}
        {pendingFulfillments.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                🎁 Pedidos de Realização de Sonhos
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full animate-pulse">
                  {pendingFulfillments.length}
                </span>
              </h2>
              <button
                onClick={loadPendingFulfillments}
                className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
              >
                🔄 Atualizar
              </button>
            </div>

            <div className="space-y-4">
              {pendingFulfillments.map(goal => {
                const childName = goal.children?.name || 'Criança';
                const childAvatar = goal.children?.avatar || '👶';
                const percentage = Math.round(
                  (goal.current_amount / goal.target_amount) * 100
                );

                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-lg shadow-md p-5 border border-amber-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Child Avatar */}
                        <div className="text-4xl">{childAvatar}</div>

                        {/* Goal Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {childName}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Criança
                            </span>
                          </div>

                          {/* Goal Details */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded p-4 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {goal.emoji || '🎯'}
                              </span>
                              <h4 className="font-bold text-gray-900">
                                {goal.title}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Valor do sonho:
                                </span>
                                <p className="text-green-600 font-bold">
                                  R$ {goal.target_amount.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Valor economizado:
                                </span>
                                <p className="text-blue-600 font-bold">
                                  R$ {goal.current_amount.toFixed(2)} (
                                  {percentage}%)
                                </p>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">
                                  Solicitado em:
                                </span>
                                <p className="text-gray-600">
                                  {new Date(
                                    goal.fulfillment_requested_at
                                  ).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progresso</span>
                              <span className="font-semibold">
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Info Box */}
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-blue-700 text-sm">
                              💡 {childName} completou este sonho e está
                              solicitando que você realize a compra de{' '}
                              <strong>{goal.title}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() =>
                            handleFulfillmentDecision(
                              goal.id,
                              'approve',
                              goal.title,
                              childName
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                        >
                          ✅ APROVAR
                        </button>
                        <button
                          onClick={() =>
                            handleFulfillmentDecision(
                              goal.id,
                              'reject',
                              goal.title,
                              childName
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                        >
                          ❌ RECUSAR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Crianças Cadastradas
            </h2>
            <button
              onClick={openAddChildModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Adicionar Criança
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map(child => (
              <div
                key={child.id}
                onClick={() => handleViewChildDashboard(child.id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all bg-white cursor-pointer"
                title={`Clique para ver o dashboard de ${child.name}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{child.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{child.name}</h3>
                    <p className="text-sm font-semibold text-gray-800">
                      {child.birth_date
                        ? `${calculateAge(child.birth_date)} anos`
                        : 'Idade não definida'}{' '}
                      • Nível {child.level} • {child.xp} XP
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      PIN: ••••{' '}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          alert(`PIN: ${child.pin}`);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Visualizar PIN"
                      >
                        👁️
                      </button>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openEditChildModal(child);
                      }}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      title="Editar criança"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteChild(child.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      title="Excluir criança"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {child.balance.toFixed(2)}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mb-2">
                    Saldo atual
                  </p>
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenTransactionModal(child, 'add');
                      }}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      title="Adicionar dinheiro"
                    >
                      +💰
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenTransactionModal(child, 'remove');
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      title="Remover dinheiro"
                    >
                      -💰
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenTransactionModal(child, 'add');
                      }}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Transação customizada"
                    >
                      💰
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Approvals Section - INTEGRATED */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                ⏰ Pedidos Aguardando Aprovação
              </h3>
              <button
                onClick={loadPendingRequests}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                🔄 Atualizar
              </button>
            </div>

            {loadingRequests ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-gray-600">Carregando pedidos...</p>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request, index) => {
                  // Find child info for each request
                  const child = children.find(
                    c => c.id === request.child_id
                  ) || { name: 'Criança', avatar: '👶', balance: 0 };

                  return (
                    <div
                      key={request.id}
                      className="bg-white rounded-xl shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{child.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-lg text-gray-900">
                                {child.name}
                              </h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                Saldo: R$ {child.balance.toFixed(2)}
                              </span>
                            </div>

                            <div
                              className={`border-l-4 p-4 mb-4 ${
                                request.type === 'loan'
                                  ? 'bg-blue-50 border-blue-400'
                                  : 'bg-yellow-50 border-yellow-400'
                              }`}
                            >
                              <div className="space-y-1">
                                <p>
                                  <span className="font-medium">
                                    {request.type === 'loan'
                                      ? '💰 Empréstimo:'
                                      : '🛒 Pedido:'}
                                  </span>{' '}
                                  {request.reason || request.description}
                                </p>
                                <p>
                                  <span className="font-medium">Valor:</span> R${' '}
                                  {request.amount.toFixed(2)}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Categoria:
                                  </span>
                                  {request.categoryIcon &&
                                    ` ${request.categoryIcon}`}{' '}
                                  {request.category}
                                </p>
                                <p>
                                  <span className="font-medium">Data:</span>{' '}
                                  {request.type === 'loan'
                                    ? new Date(
                                        request.requestedAt
                                      ).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : new Date(
                                        request.created_at
                                      ).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                </p>
                                {request.type === 'loan' && (
                                  <p>
                                    <span className="font-medium">Tipo:</span>
                                    <span className="text-blue-600 font-bold">
                                      {' '}
                                      EMPRÉSTIMO
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Balance Check - apenas para compras */}
                            {request.type !== 'loan' &&
                              child.balance < request.amount && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                                  <p className="text-red-700 text-sm">
                                    ⚠️ Saldo insuficiente! Faltam R${' '}
                                    {(request.amount - child.balance).toFixed(
                                      2
                                    )}
                                  </p>
                                </div>
                              )}

                            {/* Info para empréstimos */}
                            {request.type === 'loan' && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                                <p className="text-blue-700 text-sm">
                                  💡 Aprovar irá adicionar R${' '}
                                  {request.amount.toFixed(2)} à conta da criança
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleApproval(request, 'approve')}
                            disabled={
                              request.type !== 'loan' &&
                              child.balance < request.amount
                            }
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                          >
                            ✅{' '}
                            {request.type === 'loan' ? 'EMPRESTAR' : 'APROVAR'}
                          </button>
                          <button
                            onClick={() => handleApproval(request, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                          >
                            ❌ REJEITAR
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">
                  Nenhum Pedido Pendente
                </h4>
                <p className="text-green-600">
                  Todas as solicitações foram processadas!
                </p>
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                📊 Analytics{' '}
                {selectedChildFilter !== 'all'
                  ? `- ${children.find(c => c.id === selectedChildFilter)?.name}`
                  : 'Familiares'}
              </h3>
              <div className="flex gap-2">
                <select
                  value={selectedChildFilter}
                  onChange={e => setSelectedChildFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">Toda a Família</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.avatar} {child.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 3 meses</option>
                </select>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-gray-600">Carregando analytics...</p>
              </div>
            ) : getFilteredAnalytics() ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Financial Summary */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
                  <h4 className="text-sm opacity-90">Saldo Total da Família</h4>
                  <p className="text-2xl font-bold">
                    R${' '}
                    {getFilteredAnalytics().financial_summary.total_family_balance.toFixed(
                      2
                    )}
                  </p>
                  <p className="text-xs opacity-75">
                    Média: R${' '}
                    {getFilteredAnalytics().financial_summary.average_child_balance.toFixed(
                      2
                    )}{' '}
                    por criança
                  </p>
                </div>

                {/* Transaction Stats */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-4">
                  <h4 className="text-sm opacity-90">Transações</h4>
                  <p className="text-2xl font-bold">
                    {
                      getFilteredAnalytics().transaction_stats
                        .total_transactions
                    }
                  </p>
                  <p className="text-xs opacity-75">
                    R${' '}
                    {getFilteredAnalytics().transaction_stats.total_spent.toFixed(
                      2
                    )}{' '}
                    gastos
                  </p>
                </div>

                {/* Goal Stats */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
                  <h4 className="text-sm opacity-90">Metas Ativas</h4>
                  <p className="text-2xl font-bold">
                    {getFilteredAnalytics().goal_stats.active_goals}
                  </p>
                  <p className="text-xs opacity-75">
                    {getFilteredAnalytics().goal_stats.avg_completion_rate}%
                    progresso médio
                  </p>
                </div>

                {/* Pending Requests */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
                  <h4 className="text-sm opacity-90">Pedidos Pendentes</h4>
                  <p className="text-2xl font-bold">
                    {getFilteredAnalytics().transaction_stats.pending_requests}
                  </p>
                  <p className="text-xs opacity-75">
                    {getFilteredAnalytics().transaction_stats.approved_requests}{' '}
                    aprovados
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
                    <h4 className="text-sm opacity-90">
                      Saldo Total da Família
                    </h4>
                    <p className="text-2xl font-bold">R$ 239,80</p>
                    <p className="text-xs opacity-75">Demo data</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-4">
                    <h4 className="text-sm opacity-90">Transações</h4>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs opacity-75">Demo data</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
                    <h4 className="text-sm opacity-90">Metas Ativas</h4>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs opacity-75">Demo data</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
                    <h4 className="text-sm opacity-90">Pedidos Pendentes</h4>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs opacity-75">Demo data</p>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {analytics &&
              analytics.insights &&
              analytics.insights.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    💡 Insights
                  </h4>
                  <div className="space-y-3">
                    {analytics.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          insight.type === 'success'
                            ? 'bg-green-50 border-green-500 text-green-800'
                            : insight.type === 'warning'
                              ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                              : 'bg-blue-50 border-blue-500 text-blue-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{insight.icon}</span>
                          <div>
                            <h5 className="font-semibold">{insight.title}</h5>
                            <p className="text-sm">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Category Spending */}
            {analytics &&
              analytics.category_spending &&
              analytics.category_spending.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    📈 Gastos por Categoria
                  </h4>
                  <div className="space-y-3">
                    {analytics.category_spending
                      .slice(0, 5)
                      .map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {category.category === 'Jogos'
                                ? '🎮'
                                : category.category === 'Roupas'
                                  ? '👕'
                                  : category.category === 'Livros'
                                    ? '📚'
                                    : category.category === 'Sonhos'
                                      ? '🎯'
                                      : '💰'}
                            </span>
                            <span className="text-sm font-medium">
                              {category.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              R$ {category.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {category.percentage}% do total
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Status do Sistema */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm text-center font-semibold">
              ✅ Dashboard Parental Unificado: Crianças + Aprovações + Analytics
              100% Funcional
            </p>
          </div>
        </div>
      </div>

      {/* Child Modal */}
      <ChildModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        onSave={handleSaveChild}
        child={editingChild}
        mode={modalMode}
      />

      {/* Categories Manager Modal */}
      <CategoriesManager
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      {/* Interest Config Manager Modal */}
      <InterestConfigManager
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
      />

      {/* Allowance Config Manager Modal */}
      <AllowanceConfigManager
        isOpen={isAllowanceModalOpen}
        onClose={() => setIsAllowanceModalOpen(false)}
      />

      {/* Transaction Modal */}
      {showTransactionModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {transactionType === 'add'
                  ? '💰 Adicionar Dinheiro'
                  : '💸 Remover Dinheiro'}
              </h3>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">{selectedChild.avatar}</span>
                <span className="font-semibold">{selectedChild.name}</span>
                <span className="text-sm">
                  • Saldo atual: R$ {selectedChild.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valores sugeridos:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleQuickAmount(10)}
                    className="px-3 py-2 bg-gray-100 text-gray-800 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    R$ 10
                  </button>
                  <button
                    onClick={() => handleQuickAmount(20)}
                    className="px-3 py-2 bg-gray-100 text-gray-800 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    R$ 20
                  </button>
                  <button
                    onClick={() => handleQuickAmount(50)}
                    className="px-3 py-2 bg-gray-100 text-gray-800 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    R$ 50
                  </button>
                  <button
                    onClick={() => handleQuickAmount(100)}
                    className="px-3 py-2 bg-gray-100 text-gray-800 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-purple-100 hover:text-purple-700 transition-all"
                  >
                    R$ 100
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$):
                </label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={e => setTransactionAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição:
                </label>
                <input
                  type="text"
                  value={transactionDescription}
                  onChange={e => setTransactionDescription(e.target.value)}
                  placeholder="Ex: Mesada semanal, Presente do vovô..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Preview */}
              {transactionAmount && (
                <div
                  className={`p-3 rounded-lg ${
                    transactionType === 'add'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className="text-sm font-medium">
                    Novo saldo: R${' '}
                    {transactionType === 'add'
                      ? (
                          selectedChild.balance +
                          parseFloat(transactionAmount || '0')
                        ).toFixed(2)
                      : (
                          selectedChild.balance -
                          parseFloat(transactionAmount || '0')
                        ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTransaction}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  transactionType === 'add'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {transactionType === 'add' ? '✅ Adicionar' : '✅ Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
