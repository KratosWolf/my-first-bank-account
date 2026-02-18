/**
 * PurchaseRequestCard - Card para exibir pedido de empréstimo individual
 * Task 2.11 - Visual lúdico com badges coloridos para status
 */

import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export interface PurchaseRequest {
  id: string;
  itemName: string;
  amount: number;
  reason?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  response_message?: string;
}

interface PurchaseRequestCardProps {
  request: PurchaseRequest;
  onClick?: (request: PurchaseRequest) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    emoji: '🟡',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
  },
  approved: {
    label: 'Aprovado',
    emoji: '🟢',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
  },
  rejected: {
    label: 'Recusado',
    emoji: '🔴',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  brinquedo: '🧸',
  livro: '📚',
  roupa: '👕',
  eletronico: '📱',
  esporte: '⚽',
  outro: '🎁',
};

export const PurchaseRequestCard: React.FC<PurchaseRequestCardProps> = ({
  request,
  onClick,
}) => {
  const statusConfig = STATUS_CONFIG[request.status];
  const categoryEmoji = CATEGORY_EMOJI[request.category] || '🎁';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card
      className={`
        bg-[#1A4731] border border-white/10 hover:border-[#F5B731]/40
        transition-all duration-200 cursor-pointer
        ${onClick ? 'hover:scale-[1.02] hover:shadow-lg' : ''}
      `}
      onClick={() => onClick?.(request)}
    >
      <div className="p-4 space-y-3">
        {/* Header: Status Badge + Data */}
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
          <span className="text-xs text-white/50">
            {formatDate(request.created_at)}
          </span>
        </div>

        {/* Item Info */}
        <div>
          <div className="flex items-start gap-2 mb-1">
            <span className="text-2xl flex-shrink-0">{categoryEmoji}</span>
            <h3 className="text-white font-semibold text-lg leading-tight">
              {request.itemName}
            </h3>
          </div>
          <p className="text-[#F5B731] text-xl font-bold">
            {formatCurrency(request.amount)}
          </p>
        </div>

        {/* Motivo (se existir) */}
        {request.reason && (
          <div className="bg-[#0D2818]/40 rounded-lg p-3 border border-white/5">
            <p className="text-sm text-white/70 italic">
              &ldquo;{request.reason}&rdquo;
            </p>
          </div>
        )}

        {/* Resposta dos Pais (se recusado ou aprovado com mensagem) */}
        {request.response_message && (
          <div
            className={`
              rounded-lg p-3 border
              ${
                request.status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }
            `}
          >
            <p className="text-xs font-semibold text-white/80 mb-1">
              {request.status === 'rejected' ? '❌ Motivo:' : '✅ Mensagem:'}
            </p>
            <p className="text-sm text-white/70">{request.response_message}</p>
          </div>
        )}

        {/* Footer: Ação sugerida */}
        {request.status === 'approved' && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-[#F5B731] flex items-center gap-1">
              <span>🎉</span>
              <span>Aprovado! Aguarde seus pais criarem o empréstimo.</span>
            </p>
          </div>
        )}
        {request.status === 'pending' && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-white/50 flex items-center gap-1">
              <span>⏳</span>
              <span>Aguardando análise dos seus pais...</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
