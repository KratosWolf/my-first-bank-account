/**
 * Página de Empréstimos - Visão da Criança
 * Task 2.13 - Interface para criança ver empréstimos ativos e pagar parcelas
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { LoanCard, LoanCardData } from '../src/components/LoanCard';
import { InstallmentList } from '../src/components/InstallmentList';
import { PayInstallmentModal } from '../src/components/PayInstallmentModal';
import {
  LoanService,
  Loan,
  LoanDetails,
  LoanInstallment,
} from '../src/lib/services/loanService';

export default function ChildLoansPage() {
  const router = useRouter();
  const { childId, loanId: selectedLoanIdFromQuery } = router.query;

  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanDetails, setSelectedLoanDetails] =
    useState<LoanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [childName, setChildName] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<LoanInstallment | null>(null);
  const [isPayingInstallment, setIsPayingInstallment] = useState(false);

  // Carregar empréstimos ao montar componente
  useEffect(() => {
    if (childId && typeof childId === 'string') {
      loadLoans(childId);
      loadChildName(childId);
    }
  }, [childId]);

  // Auto-selecionar empréstimo se loanId fornecido na URL
  useEffect(() => {
    if (
      selectedLoanIdFromQuery &&
      typeof selectedLoanIdFromQuery === 'string' &&
      !selectedLoanDetails
    ) {
      loadLoanDetails(selectedLoanIdFromQuery);
    }
  }, [selectedLoanIdFromQuery, selectedLoanDetails]);

  const loadLoans = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await LoanService.getLoansByChild(id);
      // Ordenar: ativos primeiro, depois por data decrescente
      const sorted = data.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setLoans(sorted);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildName = async (id: string) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
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

  const loadLoanDetails = async (loanId: string) => {
    try {
      setIsLoadingDetails(true);
      const details = await LoanService.getLoanDetails(loanId);
      setSelectedLoanDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes do empréstimo:', error);
      alert('❌ Erro ao carregar detalhes. Tente novamente.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleLoanClick = (loan: Loan) => {
    loadLoanDetails(loan.id);
  };

  const handleBackToList = () => {
    setSelectedLoanDetails(null);
    if (childId && typeof childId === 'string') {
      loadLoans(childId); // Recarregar lista para mostrar mudanças
    }
  };

  const handlePayInstallment = (installment: LoanInstallment) => {
    setSelectedInstallment(installment);
    setShowPayModal(true);
  };

  const handleConfirmPayment = async (
    paidFrom: 'allowance' | 'manual' | 'gift'
  ) => {
    if (!selectedInstallment) return;

    try {
      setIsPayingInstallment(true);

      const success = await LoanService.payInstallment(
        selectedInstallment.id,
        paidFrom
      );

      if (!success) {
        alert('❌ Erro ao pagar parcela. Tente novamente.');
        return;
      }

      // Recarregar detalhes do empréstimo
      if (selectedLoanDetails) {
        await loadLoanDetails(selectedLoanDetails.id);
      }

      // Fechar modal
      setShowPayModal(false);
      setSelectedInstallment(null);

      // Verificar se empréstimo foi quitado
      const updatedLoan = await LoanService.getLoanDetails(
        selectedLoanDetails!.id
      );
      if (updatedLoan?.status === 'paid_off') {
        // Celebração! 🎉
        alert(
          `🎉🎉🎉 PARABÉNS! 🎉🎉🎉\n\nVocê quitou seu empréstimo!\n\nIsso mostra que você é muito responsável com seu dinheiro. Continue assim! 🌟\n\nValor total pago: R$ ${updatedLoan.total_amount.toFixed(2)}`
        );
      } else {
        // Feedback normal
        alert(
          `✅ Parcela paga com sucesso!\n\nValor: R$ ${selectedInstallment.amount.toFixed(2)}\nForma de pagamento: ${
            paidFrom === 'allowance'
              ? 'Mesada'
              : paidFrom === 'gift'
                ? 'Presente'
                : 'Outro'
          }\n\nContinue pagando suas parcelas! 💪`
        );
      }
    } catch (error) {
      console.error('Erro ao pagar parcela:', error);
      alert('❌ Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsPayingInstallment(false);
    }
  };

  const handleBack = () => {
    if (selectedLoanDetails) {
      handleBackToList();
    } else {
      router.back();
    }
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💰</div>
          <p className="text-white text-lg">Carregando empréstimos...</p>
        </div>
      </div>
    );
  }

  // Filtrar empréstimos por status
  const activeLoans = loans.filter(l => l.status === 'active');
  const paidOffLoans = loans.filter(l => l.status === 'paid_off');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731]">
      {/* Header */}
      <div className="bg-[#1A4731]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="!px-3 !py-2"
              >
                ← Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>💰</span>
                  {selectedLoanDetails
                    ? 'Detalhes do Empréstimo'
                    : 'Meus Empréstimos'}
                </h1>
                {childName && (
                  <p className="text-sm text-white/60">{childName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Visualização de Lista */}
        {!selectedLoanDetails && (
          <>
            {/* Empty State */}
            {loans.length === 0 ? (
              <Card className="bg-[#1A4731]/60 border border-white/10 text-center py-16 px-8">
                <div className="text-8xl mb-6">🐷</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Nenhum empréstimo ainda
                </h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                  Você ainda não tem empréstimos. Quando seus pais aprovarem um
                  pedido de empréstimo, ele aparecerá aqui!
                </p>
                <Button
                  variant="primary"
                  onClick={() =>
                    router.push(`/child-loan-requests?childId=${childId}`)
                  }
                  className="mx-auto"
                >
                  <span className="mr-2">🏦</span>
                  Fazer Pedido de Empréstimo
                </Button>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Empréstimos Ativos */}
                {activeLoans.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>🟢</span>
                      Empréstimos Ativos ({activeLoans.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeLoans.map(loan => (
                        <LoanCard
                          key={loan.id}
                          loan={loan as LoanCardData}
                          onClick={() => handleLoanClick(loan)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empréstimos Quitados */}
                {paidOffLoans.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>🎉</span>
                      Empréstimos Quitados ({paidOffLoans.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {paidOffLoans.map(loan => (
                        <LoanCard
                          key={loan.id}
                          loan={loan as LoanCardData}
                          onClick={() => handleLoanClick(loan)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Botão para fazer novo pedido */}
                <Card className="bg-[#F5B731]/10 border-2 border-[#F5B731]/30">
                  <div className="p-6 text-center">
                    <div className="text-5xl mb-3">🏦</div>
                    <h3 className="font-bold text-white text-lg mb-2">
                      Precisa de um empréstimo?
                    </h3>
                    <p className="text-white/70 mb-4 text-sm">
                      Converse com seus pais e faça um novo pedido!
                    </p>
                    <Button
                      variant="primary"
                      onClick={() =>
                        router.push(`/child-loan-requests?childId=${childId}`)
                      }
                    >
                      ➕ Novo Pedido de Empréstimo
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Visualização de Detalhes */}
        {selectedLoanDetails && !isLoadingDetails && (
          <div className="space-y-6">
            {/* Resumo do Empréstimo */}
            <Card className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-[#F5B731]/30">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">💰</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Empréstimo Detalhado
                    </h2>
                    <p className="text-white/70 text-sm">
                      Acompanhe suas parcelas e pagamentos
                    </p>
                  </div>
                </div>

                {/* Informações Principais */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Valor Total</p>
                    <p className="text-2xl font-bold text-[#F5B731]">
                      R$ {selectedLoanDetails.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Valor Pago</p>
                    <p className="text-2xl font-bold text-green-400">
                      R$ {selectedLoanDetails.paid_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Parcelas</p>
                    <p className="text-2xl font-bold text-white">
                      {selectedLoanDetails.installment_count}x de R${' '}
                      {selectedLoanDetails.installment_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Falta Pagar</p>
                    <p className="text-2xl font-bold text-white">
                      R${' '}
                      {(
                        selectedLoanDetails.total_amount -
                        selectedLoanDetails.paid_amount
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full bg-white/10 rounded-full h-5 overflow-hidden border border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                  <div
                    className="h-full bg-gradient-to-r from-[#F5B731] to-[#FFD966] rounded-full transition-all duration-1000 shadow-lg relative z-10"
                    style={{
                      width: `${Math.round((selectedLoanDetails.paid_amount / selectedLoanDetails.total_amount) * 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                  </div>
                </div>
                <p className="text-center text-white/80 mt-2 text-sm font-semibold">
                  {Math.round(
                    (selectedLoanDetails.paid_amount /
                      selectedLoanDetails.total_amount) *
                      100
                  )}
                  % pago
                </p>
              </div>
            </Card>

            {/* Lista de Parcelas */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span>
                Parcelas do Empréstimo
              </h2>
              <InstallmentList
                installments={selectedLoanDetails.installments}
                loanStatus={selectedLoanDetails.status}
                onPayInstallment={handlePayInstallment}
                isLoading={isPayingInstallment}
              />
            </div>
          </div>
        )}

        {/* Loading de Detalhes */}
        {isLoadingDetails && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">💰</div>
            <p className="text-white text-lg">Carregando detalhes...</p>
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      <PayInstallmentModal
        isOpen={showPayModal}
        onClose={() => {
          if (!isPayingInstallment) {
            setShowPayModal(false);
            setSelectedInstallment(null);
          }
        }}
        onConfirm={handleConfirmPayment}
        installment={selectedInstallment}
        installmentNumber={selectedInstallment?.installment_number || 0}
        totalInstallments={selectedLoanDetails?.installment_count || 0}
        isLoading={isPayingInstallment}
      />
    </div>
  );
}
