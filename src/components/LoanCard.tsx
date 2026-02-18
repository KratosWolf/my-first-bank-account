/**
 * LoanCard - Card para exibir resumo de empréstimo (visão criança)
 * Task 2.13 - Visual lúdico com progress bar e informações principais
 */

import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import type { Loan } from '../lib/services/loanService';

export interface LoanCardData extends Loan {
  purchase_request_name?: string;
  next_installment_due?: string;
}

interface LoanCardProps {
  loan: LoanCardData;
  onClick?: () => void;
  showPayButton?: boolean;
  onPay?: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: 'Ativo',
    emoji: '🟢',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
  },
  paid_off: {
    label: 'Quitado',
    emoji: '🎉',
    bgColor: 'bg-[#F5B731]/20',
    textColor: 'text-[#F5B731]',
    borderColor: 'border-[#F5B731]/30',
  },
  cancelled: {
    label: 'Cancelado',
    emoji: '❌',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
  },
};

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  onClick,
  showPayButton = false,
  onPay,
}) => {
  const statusConfig = STATUS_CONFIG[loan.status];
  const progressPercent = Math.round(
    (loan.paid_amount / loan.total_amount) * 100
  );
  const remainingAmount = loan.total_amount - loan.paid_amount;

  return (
    <Card
      className={`
        bg-[#1A4731] border border-white/10 hover:border-[#F5B731]/40
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header: Status Badge + Valor Total */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            className={`
              ${statusConfig.bgColor} ${statusConfig.textColor}
              ${statusConfig.borderColor} border px-3 py-1 text-xs font-medium
            `}
          >
            <span className="mr-1">{statusConfig.emoji}</span>
            {statusConfig.label}
          </Badge>
          <div className="text-right">
            <div className="text-[#F5B731] text-xl font-bold">
              R$ {loan.total_amount.toFixed(2)}
            </div>
            <div className="text-xs text-white/50">Valor total</div>
          </div>
        </div>

        {/* Item Info */}
        <div className="bg-[#0D2818]/40 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💰</span>
            <h3 className="text-white font-semibold text-lg leading-tight">
              {loan.purchase_request_name || 'Empréstimo'}
            </h3>
          </div>
          <div className="text-sm text-white/70">
            {loan.installment_count}x de R$ {loan.installment_amount.toFixed(2)}
          </div>
        </div>

        {/* Progress Bar com Shimmer Effect */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Progresso</span>
            <span className="font-semibold text-[#F5B731]">
              {progressPercent}%
            </span>
          </div>
          <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/20">
            {/* Shimmer Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-[#F5B731] to-[#FFD966] rounded-full transition-all duration-1000 shadow-lg relative z-10"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>R$ {loan.paid_amount.toFixed(2)} pago</span>
            <span>
              {loan.status === 'active'
                ? `Faltam R$ ${remainingAmount.toFixed(2)}`
                : 'Completo! 🎉'}
            </span>
          </div>
        </div>

        {/* Próxima Parcela (se ativo) */}
        {loan.status === 'active' && loan.next_installment_due && (
          <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div className="text-xs">
                <div className="text-white/60">Próxima parcela:</div>
                <div className="font-semibold text-white">
                  {new Date(loan.next_installment_due).toLocaleDateString(
                    'pt-BR'
                  )}
                </div>
              </div>
            </div>
            {showPayButton && onPay && (
              <Button
                variant="primary"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onPay();
                }}
                className="!text-xs !px-3 !py-1"
              >
                💳 Pagar
              </Button>
            )}
          </div>
        )}

        {/* Celebração quando quitado */}
        {loan.status === 'paid_off' && (
          <div className="bg-gradient-to-r from-[#F5B731]/20 to-[#FFD966]/20 border-2 border-[#F5B731]/40 rounded-lg p-3 text-center animate-bounce">
            <div className="text-3xl mb-1">🎉</div>
            <div className="text-[#F5B731] font-bold text-sm">
              Empréstimo Quitado!
            </div>
            <div className="text-xs text-white/70 mt-1">
              Parabéns por pagar tudo! 🌟
            </div>
          </div>
        )}

        {/* Call to Action (se clicável) */}
        {onClick && loan.status === 'active' && (
          <div className="pt-2 border-t border-white/5 text-center">
            <span className="text-xs text-[#F5B731] flex items-center justify-center gap-1">
              <span>👆</span>
              <span>Toque para ver detalhes</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
