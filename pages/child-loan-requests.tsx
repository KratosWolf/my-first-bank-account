/**
 * Página de Pedidos de Empréstimo - Visão da Criança
 * Task 2.11 - Interface para criança solicitar e acompanhar pedidos
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Modal } from '../src/components/ui/Modal';
import { NewRequestForm } from '../src/components/NewRequestForm';
import {
  PurchaseRequestCard,
  PurchaseRequest,
} from '../src/components/PurchaseRequestCard';
import { LoanService } from '../src/lib/services/loanService';

export default function ChildLoanRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childName, setChildName] = useState('');
  const [childId, setChildId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Proteger página: apenas usuários autenticados podem acessar
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setIsAuthorized(true);
    }
  }, [status, session, router]);

  // Carregar pedidos ao montar componente
  useEffect(() => {
    if (!isAuthorized) return;
    if (!router.isReady) return;

    // Obter childId de três fontes possíveis (em ordem de prioridade):
    const getChildId = async () => {
      // 1. Query param (navegação explícita)
      if (router.query.childId && typeof router.query.childId === 'string') {
        return router.query.childId;
      }

      // 2. Sessão (criança logada)
      const user = session?.user as any;
      if (user?.role === 'child' && user?.childId) {
        return user.childId;
      }

      // 3. Primeiro filho da família (pai visualizando) — via sessão
      if (user?.familyId) {
        const { data: children } = await supabase
          .from('children')
          .select('id')
          .eq('family_id', user.familyId)
          .order('created_at', { ascending: true })
          .limit(1);

        if (children && children.length > 0) {
          return children[0].id;
        }
      }

      // 4. Fallback: buscar familyId via email da sessão
      if (user?.email) {
        const { data: userLink } = await supabase
          .from('user_links')
          .select('family_id, child_id, role')
          .eq('email', user.email)
          .single();

        if (userLink?.child_id) return userLink.child_id;

        if (userLink?.family_id) {
          const { data: children } = await supabase
            .from('children')
            .select('id')
            .eq('family_id', userLink.family_id)
            .order('created_at', { ascending: true })
            .limit(1);

          if (children && children.length > 0) {
            return children[0].id;
          }
        }
      }

      console.warn('⚠️ Nenhum childId disponível');
      return null;
    };

    getChildId().then(id => {
      if (id) {
        setChildId(id);
        loadRequests(id);
        loadChildName(id);
      } else {
        setIsLoading(false);
        setError(
          'Não foi possível identificar a criança. Por favor, volte ao dashboard e tente novamente.'
        );
      }
    });
  }, [isAuthorized, router.isReady, router.query.childId, session]);

  const loadRequests = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await LoanService.getLoanRequests(id);
      // Ordenar: pendentes primeiro, depois por data decrescente
      const sorted = data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setRequests(sorted);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildName = async (id: string) => {
    try {
      const { data } = await supabase
        .from('children')
        .select('name')
        .eq('id', id)
        .single();
      if (data) setChildName(data.name);
    } catch (error) {
      console.error('Erro ao carregar nome da criança:', error);
    }
  };

  const handleNewRequest = async (data: {
    itemName: string;
    amount: number;
    reason: string;
    category: string;
  }) => {
    if (!childId || typeof childId !== 'string') return;

    try {
      setIsSubmitting(true);
      await LoanService.createLoanRequest(
        childId,
        data.itemName,
        data.amount,
        data.reason,
        data.category
      );

      // Recarregar lista
      await loadRequests(childId);

      // Fechar modal
      setShowNewRequestModal(false);

      // Feedback visual
      setSuccessMessage('🎉 Pedido enviado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setError('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestClick = async (request: PurchaseRequest) => {
    // Se pedido foi aprovado, navegar para os detalhes do empréstimo
    if (request.status === 'approved') {
      try {
        // Buscar empréstimo correspondente a este pedido
        const { data: loan } = await supabase
          .from('loans')
          .select('id')
          .eq('purchase_request_id', request.id)
          .maybeSingle();

        if (loan) {
          // Navegar para página de detalhes do empréstimo
          router.push(`/child-loans?childId=${childId}&loanId=${loan.id}`);
        } else {
          // Se não encontrou empréstimo, mostrar mensagem
          setInfoMessage(
            '⚠️ Empréstimo não encontrado. Este pedido foi aprovado, mas o empréstimo ainda não foi criado. Fale com seus pais!'
          );
          setTimeout(() => setInfoMessage(null), 6000);
        }
      } catch (error) {
        console.error('Erro ao buscar empréstimo:', error);
        setError('Erro ao carregar detalhes. Tente novamente.');
      }
    } else if (request.status === 'rejected') {
      // Para pedidos rejeitados, mostrar motivo se houver
      if (request.parent_note) {
        setInfoMessage(
          `❌ Pedido Recusado\n\nMotivo: ${request.parent_note}\n\nConverse com seus pais para entender melhor!`
        );
        setTimeout(() => setInfoMessage(null), 6000);
      }
    }
    // Para pedidos pendentes, não faz nada (aguardando resposta)
  };

  const handleBack = () => {
    router.back();
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏦</div>
          <p className="text-white text-lg">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  // Estado de erro crítico (childId não encontrado)
  if (error && !childId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] flex items-center justify-center p-4">
        <Card className="bg-[#1A4731] border-2 border-red-500/30 max-w-md">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-3">Erro</h2>
            <p className="text-white/80 text-sm mb-6 whitespace-pre-line">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={() => router.back()}
              className="w-full"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Filtrar pedidos por status
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731]">
      {/* Header */}
      <div className="bg-[#1A4731]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="!px-3 !py-2"
              >
                ← Voltar
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>🏦</span>
                  Meus Pedidos
                </h1>
                {childName && (
                  <p className="text-sm text-white/60">{childName}</p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowNewRequestModal(true)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <span>➕</span>
              Novo Pedido
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensagens de Sucesso/Info/Erro */}
        {successMessage && (
          <Card className="bg-green-500/20 border-2 border-green-500/50 mb-6">
            <div className="p-4 flex items-center justify-between">
              <p className="text-white font-medium">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {infoMessage && (
          <Card className="bg-yellow-500/20 border-2 border-yellow-500/50 mb-6">
            <div className="p-4 flex items-center justify-between">
              <p className="text-white font-medium whitespace-pre-line">
                {infoMessage}
              </p>
              <button
                onClick={() => setInfoMessage(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {error && childId && (
          <Card className="bg-red-500/20 border-2 border-red-500/50 mb-6">
            <div className="p-4 flex items-center justify-between">
              <p className="text-white font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {requests.length === 0 ? (
          <Card className="bg-[#1A4731]/60 border border-white/10 text-center py-16 px-8">
            <div className="text-6xl sm:text-8xl mb-6">🐷</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Nenhum pedido ainda
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Você ainda não fez nenhum pedido de empréstimo. Que tal pedir algo
              especial que você está querendo comprar?
            </p>
            <Button
              variant="primary"
              onClick={() => setShowNewRequestModal(true)}
              className="mx-auto"
            >
              <span className="mr-2">✨</span>
              Fazer Meu Primeiro Pedido
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pedidos Pendentes */}
            {pendingRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🟡</span>
                  Aguardando Resposta ({pendingRequests.length})
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {pendingRequests.map(request => (
                    <PurchaseRequestCard
                      key={request.id}
                      request={request}
                      onClick={handleRequestClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pedidos Aprovados */}
            {approvedRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🟢</span>
                  Aprovados ({approvedRequests.length})
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {approvedRequests.map(request => (
                    <PurchaseRequestCard
                      key={request.id}
                      request={request}
                      onClick={handleRequestClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pedidos Recusados */}
            {rejectedRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🔴</span>
                  Recusados ({rejectedRequests.length})
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {rejectedRequests.map(request => (
                    <PurchaseRequestCard
                      key={request.id}
                      request={request}
                      onClick={handleRequestClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Modal de Novo Pedido */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => !isSubmitting && setShowNewRequestModal(false)}
        title="🏦 Fazer Novo Pedido"
      >
        <NewRequestForm
          onSubmit={handleNewRequest}
          onCancel={() => setShowNewRequestModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
