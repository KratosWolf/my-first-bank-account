/**
 * InstallmentList - Lista de parcelas do empréstimo (visão criança)
 * Task 2.13 - Exibe parcelas com status, datas e permite pagamento
 */

import React from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { LoanInstallment } from '../lib/services/loanService';

interface InstallmentListProps {
  installments: LoanInstallment[];
  loanStatus: 'active' | 'paid_off' | 'cancelled';
  onPayInstallment?: (installment: LoanInstallment) => void;
  isLoading?: boolean;
}

const PAID_FROM_LABELS = {
  allowance: '💰 Mesada',
  manual: '💳 Pagamento manual',
  gift: '🎁 Presente',
};

const getInstallmentStatus = (
  installment: LoanInstallment
): {
  badge: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} => {
  if (installment.status === 'paid') {
    return {
      badge: 'Paga',
      emoji: '🟢',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/30',
    };
  }

  // Verificar se está atrasada
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(installment.due_date);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return {
      badge: 'Atrasada',
      emoji: '🔴',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
    };
  }

  return {
    badge: 'Pendente',
    emoji: '🟡',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
  };
};

export const InstallmentList: React.FC<InstallmentListProps> = ({
  installments,
  loanStatus,
  onPayInstallment,
  isLoading = false,
}) => {
  // Encontrar próxima parcela pendente para botão de pagar
  const nextPendingInstallment = installments.find(
    inst => inst.status === 'pending'
  );

  return (
    <div className="space-y-3">
      {installments.map((installment, index) => {
        const statusConfig = getInstallmentStatus(installment);
        const isNextToPay = nextPendingInstallment?.id === installment.id;

        return (
          <div
            key={installment.id}
            className={`
              bg-[#1A4731] border rounded-lg p-4
              ${isNextToPay ? 'border-[#F5B731] border-2 shadow-lg' : 'border-white/10'}
              transition-all duration-200
            `}
          >
            {/* Header: Número da parcela + Badge de status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{statusConfig.emoji}</span>
                <div>
                  <h4 className="text-white font-bold">
                    Parcela {installment.installment_number} de{' '}
                    {installments.length}
                  </h4>
                  <Badge
                    className={`
                      ${statusConfig.bgColor} ${statusConfig.textColor}
                      ${statusConfig.borderColor} border px-2 py-0.5 text-xs font-medium mt-1
                    `}
                  >
                    {statusConfig.badge}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#F5B731] text-xl font-bold">
                  R$ {installment.amount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Informações da Parcela */}
            <div className="bg-[#0D2818]/40 rounded-lg p-3 border border-white/5 space-y-2">
              {/* Data de Vencimento */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">📅 Vencimento:</span>
                <span className="text-white font-semibold">
                  {new Date(installment.due_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Informações de Pagamento (se paga) */}
              {installment.status === 'paid' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">✅ Pago em:</span>
                    <span className="text-green-400 font-semibold">
                      {installment.paid_date
                        ? new Date(installment.paid_date).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : 'Data não registrada'}
                    </span>
                  </div>
                  {installment.paid_from && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">💳 Forma:</span>
                      <span className="text-[#F5B731] font-semibold">
                        {PAID_FROM_LABELS[installment.paid_from] ||
                          installment.paid_from}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Botão de Pagar (apenas para próxima parcela pendente) */}
            {isNextToPay &&
              loanStatus === 'active' &&
              onPayInstallment &&
              !isLoading && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => onPayInstallment(installment)}
                    className="animate-pulse"
                  >
                    💳 Pagar Esta Parcela
                  </Button>
                  <p className="text-xs text-center text-white/50 mt-2">
                    👆 Próxima parcela a vencer
                  </p>
                </div>
              )}

            {/* Indicador de parcela quitada */}
            {installment.status === 'paid' && (
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                  <span className="text-green-400 text-sm font-semibold">
                    ✅ Parcela Quitada
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Mensagem se não houver parcelas */}
      {installments.length === 0 && (
        <div className="bg-[#1A4731]/60 border border-white/10 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🤷</div>
          <p className="text-white/70">Nenhuma parcela encontrada</p>
        </div>
      )}

      {/* Info educativa */}
      {loanStatus === 'active' && nextPendingInstallment && (
        <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-4 mt-4">
          <p className="text-sm text-white flex items-start gap-2">
            <span className="text-lg flex-shrink-0">💡</span>
            <span>
              <strong className="text-[#F5B731]">Dica:</strong> Pague suas
              parcelas em dia para manter um bom histórico! Você pode pagar com
              sua mesada ou dinheiro que ganhar. 😊
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
