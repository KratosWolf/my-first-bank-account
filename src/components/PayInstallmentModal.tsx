/**
 * PayInstallmentModal - Modal para pagar parcela de empréstimo (visão criança)
 * Task 2.13 - Seleção de origem do pagamento (mesada/manual/presente)
 */

import React, { useState } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import type { LoanInstallment } from '../lib/services/loanService';

interface PayInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paidFrom: 'allowance' | 'manual' | 'gift') => Promise<void>;
  installment: LoanInstallment | null;
  installmentNumber: number;
  totalInstallments: number;
  isLoading?: boolean;
}

const PAYMENT_OPTIONS = [
  {
    value: 'allowance' as const,
    label: 'Mesada',
    emoji: '💰',
    description: 'Usar dinheiro da minha mesada',
    color: 'from-[#F5B731] to-[#FFD966]',
  },
  {
    value: 'gift' as const,
    label: 'Presente',
    emoji: '🎁',
    description: 'Dinheiro que ganhei de presente',
    color: 'from-pink-500 to-pink-400',
  },
  {
    value: 'manual' as const,
    label: 'Outro Dinheiro',
    emoji: '💵',
    description: 'Outro dinheiro que tenho',
    color: 'from-green-500 to-green-400',
  },
];

export const PayInstallmentModal: React.FC<PayInstallmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  installment,
  installmentNumber,
  totalInstallments,
  isLoading = false,
}) => {
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<
    'allowance' | 'manual' | 'gift'
  >('manual');

  const handleConfirm = async () => {
    await onConfirm(selectedPaymentSource);
    // Reset selection after payment
    setSelectedPaymentSource('manual');
  };

  const handleClose = () => {
    setSelectedPaymentSource('manual');
    onClose();
  };

  if (!installment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? handleClose : () => {}}
      title="💳 Pagar Parcela"
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      {/* Informações da Parcela */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-[#F5B731]/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg">
                Parcela {installmentNumber} de {totalInstallments}
              </h3>
              <p className="text-sm text-white/60">
                Vencimento:{' '}
                {new Date(installment.due_date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-[#F5B731]">
                R$ {installment.amount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Origem do Pagamento */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Como você vai pagar? 💭
        </label>
        <div className="space-y-3">
          {PAYMENT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedPaymentSource(option.value)}
              disabled={isLoading}
              className={`
                w-full p-3 sm:p-4 rounded-xl border-2 transition-all
                ${
                  selectedPaymentSource === option.value
                    ? `bg-gradient-to-r ${option.color} text-white border-white shadow-lg scale-105`
                    : 'bg-bg-card text-text-primary border-border hover:border-primary hover:bg-bg-secondary'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{option.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="font-bold">{option.label}</div>
                  <div
                    className={`text-xs ${selectedPaymentSource === option.value ? 'text-white/90' : 'text-text-secondary'}`}
                  >
                    {option.description}
                  </div>
                </div>
                {selectedPaymentSource === option.value && (
                  <div className="text-2xl">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Informação Educativa */}
      <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-text-primary flex items-start gap-2">
          <span className="text-lg flex-shrink-0">💡</span>
          <span>
            <strong className="text-[#F5B731]">Lembre-se:</strong> Pagar suas
            parcelas em dia é muito importante! Isso mostra que você é
            responsável com seu dinheiro. 😊
          </span>
        </p>
      </div>

      {/* Botões de Ação */}
      <ModalFooter align="right">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Voltar
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Pagando...' : '💳 Confirmar Pagamento'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
