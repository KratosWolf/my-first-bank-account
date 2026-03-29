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
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoanApprovalModal } from '../src/components/LoanApprovalModal';
import { RejectionModal } from '../src/components/RejectionModal';

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

  // Loan approval/rejection modal states (Task 2.12)
  const [showLoanApprovalModal, setShowLoanApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedRequestChild, setSelectedRequestChild] =
    useState<Child | null>(null);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);

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
      const familyId = (session?.user as any)?.familyId;
      if (!familyId) {
        console.error('❌ familyId não encontrado na sessão');
        return;
      }
      const childrenData = await ChildrenService.getChildren(familyId);

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
      const familyId = (session?.user as any)?.familyId;
      if (!familyId) return;
      const response = await fetch(
        `/api/analytics?family_id=${familyId}&period=${selectedPeriod}`
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

  /**
   * handleApproval - TASK 2.12 - Abrir modais de aprovação/recusa
   * Ao invés de processar diretamente, abre modal específico
   */
  const handleApproval = (request, action) => {
    // Encontrar informações da criança
    const child = children.find(c => c.id === request.child_id) || {
      id: request.child_id,
      name: request.child_name || 'Criança',
      avatar: '👶',
      balance: 0,
    };

    setSelectedRequest(request);
    setSelectedRequestChild(child);

    if (action === 'approve') {
      // Se for empréstimo, abrir modal de aprovação
      if (request.type === 'loan') {
        setShowLoanApprovalModal(true);
      } else {
        // Para compras, aprovar direto (comportamento original)
        handleLegacyApproval(request, child, 'approve');
      }
    } else {
      // Para recusar, sempre abrir modal de motivo
      setShowRejectionModal(true);
    }
  };

  /**
   * handleLoanApprovalConfirm - TASK 2.12 - Criar empréstimo + atualizar pedido
   * Chamado quando pai confirma aprovação no modal
   */
  const handleLoanApprovalConfirm = async (installmentCount: number) => {
    if (!selectedRequest || !selectedRequestChild) return;

    try {
      setIsProcessingRequest(true);

      console.log('🔄 Criando empréstimo:', {
        childId: selectedRequest.child_id,
        amount: selectedRequest.amount,
        installments: installmentCount,
      });

      // 1. Criar empréstimo com parcelas usando LoanService
      const loan = await LoanService.createLoan(
        selectedRequest.child_id,
        selectedRequest.id, // purchase_request_id
        selectedRequest.amount,
        installmentCount
      );

      if (!loan) {
        alert('❌ Erro ao criar empréstimo. Tente novamente.');
        setIsProcessingRequest(false);
        return;
      }

      console.log('✅ Empréstimo criado com sucesso:', loan);

      // 2. Atualizar status do pedido para 'approved'
      const success = await LoanService.updateLoanStatus(
        selectedRequest.id,
        'completed', // status no purchase_requests
        'Empréstimo aprovado e criado com sucesso'
      );

      if (!success) {
        console.warn('⚠️ Empréstimo criado, mas erro ao atualizar pedido');
      }

      // 3. Recarregar dados
      await loadPendingRequests();
      await loadChildren();

      // 4. Fechar modal e mostrar sucesso
      setShowLoanApprovalModal(false);
      alert(
        `✅ Empréstimo aprovado e criado com sucesso!\n\n` +
          `Criança: ${selectedRequestChild.name}\n` +
          `Item: ${selectedRequest.reason}\n` +
          `Valor total: R$ ${selectedRequest.amount.toFixed(2)}\n` +
          `Parcelas: ${installmentCount}x de R$ ${(selectedRequest.amount / installmentCount).toFixed(2)}\n\n` +
          `🎯 A criança já pode acompanhar o empréstimo!`
      );

      console.log('✅ Empréstimo aprovado:', selectedRequest.id);
    } catch (error) {
      console.error('❌ Erro ao processar aprovação de empréstimo:', error);
      alert('❌ Erro ao processar empréstimo. Tente novamente.');
    } finally {
      setIsProcessingRequest(false);
      setSelectedRequest(null);
      setSelectedRequestChild(null);
    }
  };

  /**
   * handleRejectionConfirm - TASK 2.12 - Recusar pedido com motivo
   * Chamado quando pai confirma recusa no modal
   */
  const handleRejectionConfirm = async (parentNote: string) => {
    if (!selectedRequest) return;

    try {
      setIsProcessingRequest(true);

      const motivo = parentNote || 'Pedido recusado pelo responsável';

      console.log(
        '🔄 Recusando pedido:',
        selectedRequest.id,
        'motivo:',
        motivo
      );

      // Verificar se é empréstimo ou compra
      if (selectedRequest.type === 'loan') {
        // Recusar empréstimo
        const success = await LoanService.updateLoanStatus(
          selectedRequest.id,
          'rejected',
          motivo
        );

        if (!success) {
          alert('❌ Erro ao recusar empréstimo. Tente novamente.');
          setIsProcessingRequest(false);
          return;
        }

        alert(
          `✅ Empréstimo recusado!\n\nCriança: ${selectedRequestChild?.name}\nItem: ${selectedRequest.reason}\n\n` +
            (parentNote ? `💬 Motivo: "${motivo}"` : 'Sem motivo especificado.')
        );
      } else {
        // Recusar compra via API
        const response = await fetch('/api/purchase-requests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: selectedRequest.id,
            status: 'rejected',
            approved_by_parent: false,
            parent_note: motivo,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(`❌ Erro ao recusar pedido:\n${result.error}`);
          setIsProcessingRequest(false);
          return;
        }

        alert(
          `✅ Pedido recusado!\n\nItem: ${selectedRequest.description || selectedRequest.reason}\n\n` +
            (parentNote ? `💬 Motivo: "${motivo}"` : 'Sem motivo especificado.')
        );
      }

      // Recarregar dados
      await loadPendingRequests();

      // Fechar modal
      setShowRejectionModal(false);

      console.log('✅ Pedido recusado:', selectedRequest.id);
    } catch (error) {
      console.error('❌ Erro ao recusar pedido:', error);
      alert('❌ Erro de conexão. Tente novamente.');
    } finally {
      setIsProcessingRequest(false);
      setSelectedRequest(null);
      setSelectedRequestChild(null);
    }
  };

  /**
   * handleLegacyApproval - Manter comportamento original para compras
   * (aprovar diretamente sem modal)
   */
  const handleLegacyApproval = async (request, child, action) => {
    try {
      const response = await fetch('/api/purchase-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          status: 'completed',
          approved_by_parent: true,
          parent_note: 'Aprovado pelo responsável',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ Pedido APROVADO com sucesso!\nItem: ${request.description || request.reason}\nValor: R$ ${request.amount.toFixed(2)}`
        );
        await loadChildren();
        await loadPendingRequests();
      } else {
        alert(`❌ Erro ao aprovar pedido:\n${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao aprovar pedido:', error);
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
      const familyId = (session?.user as any)?.familyId;
      if (modalMode === 'add') {
        const newChild = await ChildrenService.addChild(childData, familyId);
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
      <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] flex items-center justify-center">
        <div className="bg-[#1A4731CC] rounded-2xl shadow-2xl p-8 text-center border-2 border-[#F5B731]/30">
          <div className="w-16 h-16 border-4 border-[#F5B731] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] animate-fadeInUp">
      {/* Header com fundo verde escuro e destaques em amarelo */}
      <div className="bg-gradient-to-br from-[#0D2818] to-[#1A4731] shadow-lg border-b-2 border-[#F5B731]/30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F5B731] to-[#FFD966] rounded-full flex items-center justify-center text-3xl shadow-xl border-2 border-[#F5B731]">
                {user?.avatar || '👨‍👩‍👧‍👦'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  🏦 Banco da Família
                </h1>
                <p className="text-sm text-[#F5B731] font-medium">
                  Olá, {user?.userName || user?.name || 'Usuário'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                🚪 Sair
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCategoriesModalOpen(true)}
              >
                🏷️ Categorias
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsInterestModalOpen(true)}
              >
                💰 Juros
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAllowanceModalOpen(true)}
              >
                📅 Mesada
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (window.location.href = '/')}
              >
                🏠 Início
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Goal Fulfillment Requests Section */}
        {pendingFulfillments.length > 0 && (
          <Card
            variant="elevated"
            padding="lg"
            className="mb-6 border-2 border-primary"
          >
            <CardHeader
              title={`🎁 Pedidos de Realização de Sonhos`}
              subtitle={`${pendingFulfillments.length} sonhos aguardando aprovação`}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={loadPendingFulfillments}
                >
                  🔄 Atualizar
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                {pendingFulfillments.map(goal => {
                  const childName = goal.children?.name || 'Criança';
                  const childAvatar = goal.children?.avatar || '👶';
                  const percentage = Math.round(
                    (goal.current_amount / goal.target_amount) * 100
                  );

                  return (
                    <Card
                      key={goal.id}
                      variant="default"
                      padding="md"
                      className="border border-border"
                    >
                      <CardBody>
                        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Child Avatar */}
                            <div className="text-4xl">{childAvatar}</div>

                            {/* Goal Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-bold text-lg text-text-primary">
                                  {childName}
                                </h3>
                                <Badge variant="info" size="sm">
                                  Criança
                                </Badge>
                              </div>

                              {/* Goal Details */}
                              <div className="bg-bg-secondary border-l-4 border-primary rounded-lg p-4 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">
                                    {goal.emoji || '🎯'}
                                  </span>
                                  <h4 className="font-bold text-text-primary">
                                    {goal.title}
                                  </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-text-secondary">
                                      Valor do sonho:
                                    </span>
                                    <p className="text-success font-bold">
                                      R$ {goal.target_amount.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-text-secondary">
                                      Valor economizado:
                                    </span>
                                    <p className="text-primary font-bold">
                                      R$ {goal.current_amount.toFixed(2)} (
                                      {percentage}%)
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                  <span>Progresso</span>
                                  <span className="font-semibold">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-bg-secondary rounded-full h-2 border border-border">
                                  <div
                                    className="bg-gradient-to-r from-success to-primary h-full rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                            <Button
                              variant="primary"
                              fullWidth
                              onClick={() =>
                                handleFulfillmentDecision(
                                  goal.id,
                                  'approve',
                                  goal.title,
                                  childName
                                )
                              }
                            >
                              ✅ APROVAR
                            </Button>
                            <Button
                              variant="danger"
                              fullWidth
                              onClick={() =>
                                handleFulfillmentDecision(
                                  goal.id,
                                  'reject',
                                  goal.title,
                                  childName
                                )
                              }
                            >
                              ❌ RECUSAR
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Children Section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader
            title="Crianças Cadastradas"
            subtitle={`${children.length} ${children.length === 1 ? 'criança' : 'crianças'} no sistema`}
            action={
              <Button variant="primary" onClick={openAddChildModal}>
                + Adicionar Criança
              </Button>
            }
          />
          <CardBody>
            {children.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Nenhuma criança cadastrada
                </h3>
                <p className="text-text-secondary mb-6">
                  Adicione a primeira criança para começar
                </p>
                <Button variant="primary" onClick={openAddChildModal}>
                  + Adicionar Primeira Criança
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map(child => (
                  <Card
                    key={child.id}
                    variant="default"
                    padding="md"
                    hover
                    className="cursor-pointer border border-border"
                    onClick={() => handleViewChildDashboard(child.id)}
                  >
                    <CardBody>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="text-4xl">{child.avatar}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-text-primary">
                            {child.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {child.birth_date
                              ? `${calculateAge(child.birth_date)} anos`
                              : 'Idade não definida'}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="primary" size="sm">
                              Nível {child.level}
                            </Badge>
                            <Badge variant="neutral" size="sm">
                              {child.xp} XP
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              openEditChildModal(child);
                            }}
                            className="px-2 py-1 text-xs bg-bg-secondary text-text-primary rounded hover:bg-primary hover:text-bg-primary transition-colors"
                            title="Editar criança"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteChild(child.id);
                            }}
                            className="px-3 py-2 text-base bg-error text-white rounded hover:bg-red-700 transition-colors"
                            title="Excluir criança"
                          >
                            <span className="text-lg">🗑️</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="text-center mb-3">
                          <p className="text-2xl sm:text-3xl font-bold text-success">
                            R$ {child.balance.toFixed(2)}
                          </p>
                          <p className="text-xs text-text-secondary font-medium">
                            Saldo atual
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenTransactionModal(child, 'add');
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-success text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                            title="Adicionar dinheiro"
                          >
                            +💰
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenTransactionModal(child, 'remove');
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-error text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                            title="Remover dinheiro"
                          >
                            -💰
                          </button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pending Approvals Section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader
            title="⏰ Pedidos Aguardando Aprovação"
            subtitle={`${pendingRequests.length} ${pendingRequests.length === 1 ? 'pedido pendente' : 'pedidos pendentes'}`}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={loadPendingRequests}
              >
                🔄 Atualizar
              </Button>
            }
          />
          <CardBody>
            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-text-secondary">Carregando pedidos...</p>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map(request => {
                  // Find child info for each request
                  const child = children.find(
                    c => c.id === request.child_id
                  ) || { name: 'Criança', avatar: '👶', balance: 0 };

                  return (
                    <Card
                      key={request.id}
                      variant="default"
                      padding="md"
                      className="border border-border"
                    >
                      <CardBody>
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-3xl">{child.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <h4 className="font-semibold text-lg text-text-primary">
                                  {child.name}
                                </h4>
                                <Badge variant="info" size="sm">
                                  R$ {child.balance.toFixed(2)}
                                </Badge>
                              </div>

                              <div
                                className={`border-l-4 p-4 mb-3 rounded ${
                                  request.type === 'loan'
                                    ? 'bg-bg-secondary border-primary'
                                    : 'bg-bg-secondary border-warning'
                                }`}
                              >
                                <div className="space-y-1 text-sm">
                                  <p className="text-text-primary">
                                    <span className="font-medium">
                                      {request.type === 'loan'
                                        ? '💰 Empréstimo:'
                                        : '🛒 Pedido:'}
                                    </span>{' '}
                                    {request.reason || request.description}
                                  </p>
                                  <p className="text-text-primary">
                                    <span className="font-medium">Valor:</span>{' '}
                                    R$ {request.amount.toFixed(2)}
                                  </p>
                                  {request.category && (
                                    <p className="text-text-secondary">
                                      {request.categoryIcon &&
                                        `${request.categoryIcon} `}
                                      {request.category}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Balance Check - apenas para compras */}
                              {request.type !== 'loan' &&
                                child.balance < request.amount && (
                                  <div className="bg-error bg-opacity-10 border border-error rounded p-2 mb-3">
                                    <p className="text-error text-sm">
                                      ⚠️ Saldo insuficiente! Faltam R${' '}
                                      {(request.amount - child.balance).toFixed(
                                        2
                                      )}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                            <Button
                              variant="primary"
                              fullWidth
                              onClick={() => handleApproval(request, 'approve')}
                              disabled={
                                request.type !== 'loan' &&
                                child.balance < request.amount
                              }
                            >
                              ✅{' '}
                              {request.type === 'loan'
                                ? 'EMPRESTAR'
                                : 'APROVAR'}
                            </Button>
                            <Button
                              variant="danger"
                              fullWidth
                              onClick={() => handleApproval(request, 'reject')}
                            >
                              ❌ REJEITAR
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <h4 className="text-lg font-semibold text-success mb-1">
                  Nenhum Pedido Pendente
                </h4>
                <p className="text-text-secondary">
                  Todas as solicitações foram processadas!
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Analytics Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title={`📊 Analytics ${selectedChildFilter !== 'all' ? `- ${children.find(c => c.id === selectedChildFilter)?.name}` : 'Familiares'}`}
            action={
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedChildFilter}
                  onChange={e => setSelectedChildFilter(e.target.value)}
                  className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 3 meses</option>
                </select>
              </div>
            }
          />
          <CardBody>
            {loadingAnalytics ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-text-secondary">Carregando analytics...</p>
              </div>
            ) : getFilteredAnalytics() ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white rounded-xl p-6 shadow-lg border-2 border-primary/30">
                  <h4 className="text-sm text-white/80 mb-2">
                    💰 Saldo Total da Família
                  </h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    R${' '}
                    {getFilteredAnalytics().financial_summary.total_family_balance.toFixed(
                      2
                    )}
                  </p>
                  <p className="text-xs text-white/70">
                    Média: R${' '}
                    {getFilteredAnalytics().financial_summary.average_child_balance.toFixed(
                      2
                    )}{' '}
                    por criança
                  </p>
                </div>

                {/* Transaction Stats */}
                <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white rounded-xl p-6 shadow-lg border-2 border-primary/30">
                  <h4 className="text-sm text-white/80 mb-2">📊 Transações</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {
                      getFilteredAnalytics().transaction_stats
                        .total_transactions
                    }
                  </p>
                  <p className="text-xs text-white/70">
                    R${' '}
                    {getFilteredAnalytics().transaction_stats.total_spent.toFixed(
                      2
                    )}{' '}
                    gastos
                  </p>
                </div>

                {/* Goal Stats */}
                <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white rounded-xl p-6 shadow-lg border-2 border-primary/30">
                  <h4 className="text-sm text-white/80 mb-2">
                    🎯 Metas Ativas
                  </h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {getFilteredAnalytics().goal_stats.active_goals}
                  </p>
                  <p className="text-xs text-white/70">
                    {getFilteredAnalytics().goal_stats.avg_completion_rate}%
                    progresso médio
                  </p>
                </div>

                {/* Pending Requests */}
                <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] text-white rounded-xl p-6 shadow-lg border-2 border-primary/30">
                  <h4 className="text-sm text-white/80 mb-2">
                    ⏰ Pedidos Pendentes
                  </h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {getFilteredAnalytics().transaction_stats.pending_requests}
                  </p>
                  <p className="text-xs text-white/70">
                    {getFilteredAnalytics().transaction_stats.approved_requests}{' '}
                    aprovados
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">
                  Nenhum dado disponível ainda
                </p>
              </div>
            )}
          </CardBody>
        </Card>
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
        familyId={(session?.user as any)?.familyId || ''}
      />

      {/* Allowance Config Manager Modal */}
      <AllowanceConfigManager
        isOpen={isAllowanceModalOpen}
        onClose={() => setIsAllowanceModalOpen(false)}
        familyId={(session?.user as any)?.familyId || ''}
      />

      {/* Transaction Modal */}
      {showTransactionModal && selectedChild && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card
            variant="elevated"
            padding="lg"
            className="max-w-md w-full animate-fade-in"
          >
            <CardBody>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {transactionType === 'add'
                    ? '💰 Adicionar Dinheiro'
                    : '💸 Remover Dinheiro'}
                </h3>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-2xl">{selectedChild.avatar}</span>
                  <span className="font-semibold">{selectedChild.name}</span>
                  <span className="text-sm">
                    • Saldo: R$ {selectedChild.balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Valores sugeridos:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className="px-3 py-2 bg-bg-secondary text-text-primary font-semibold text-sm rounded-lg border border-border hover:bg-primary hover:text-bg-primary transition-all"
                      >
                        R$ {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Valor (R$):
                  </label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={e => setTransactionAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descrição:
                  </label>
                  <input
                    type="text"
                    value={transactionDescription}
                    onChange={e => setTransactionDescription(e.target.value)}
                    placeholder="Ex: Mesada semanal, Presente do vovô..."
                    className="w-full px-4 py-2.5 bg-bg-card text-text-primary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Preview */}
                {transactionAmount && (
                  <div
                    className={`p-3 rounded-lg ${
                      transactionType === 'add'
                        ? 'bg-success bg-opacity-10 border border-success'
                        : 'bg-error bg-opacity-10 border border-error'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        transactionType === 'add'
                          ? 'text-success'
                          : 'text-error'
                      }`}
                    >
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
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowTransactionModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant={transactionType === 'add' ? 'primary' : 'danger'}
                  fullWidth
                  onClick={handleSaveTransaction}
                >
                  {transactionType === 'add' ? '✅ Adicionar' : '✅ Remover'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Loan Approval Modal - TASK 2.12 */}
      <LoanApprovalModal
        isOpen={showLoanApprovalModal}
        onClose={() => {
          if (!isProcessingRequest) {
            setShowLoanApprovalModal(false);
            setSelectedRequest(null);
            setSelectedRequestChild(null);
          }
        }}
        onConfirm={handleLoanApprovalConfirm}
        request={selectedRequest}
        child={selectedRequestChild}
        isLoading={isProcessingRequest}
      />

      {/* Rejection Modal - TASK 2.12 */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => {
          if (!isProcessingRequest) {
            setShowRejectionModal(false);
            setSelectedRequest(null);
            setSelectedRequestChild(null);
          }
        }}
        onConfirm={handleRejectionConfirm}
        request={selectedRequest}
        child={selectedRequestChild}
        isLoading={isProcessingRequest}
      />
    </div>
  );
}
