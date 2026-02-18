/**
 * LoanApprovalModal - Modal para aprovação de pedido de empréstimo
 * Task 2.12 - Pai seleciona parcelas e confirma criação do empréstimo
 */

import React, { useState, useMemo } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface LoanRequest {
  id: string;
  child_id: string;
  child_name: string;
  reason: string;
  amount: number;
  type: 'loan';
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  balance: number;
}

interface LoanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (installmentCount: number) => Promise<void>;
  request: LoanRequest | null;
  child: Child | null;
  isLoading?: boolean;
}

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 6, 12];

export const LoanApprovalModal: React.FC<LoanApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  child,
  isLoading = false,
}) => {
  const [selectedInstallments, setSelectedInstallments] = useState(3);

  // Calcular preview das parcelas
  const preview = useMemo(() => {
    if (!request) return null;

    const installmentAmount = request.amount / selectedInstallments;
    const today = new Date();
    const firstDueDate = new Date(today);
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    const lastDueDate = new Date(today);
    lastDueDate.setMonth(lastDueDate.getMonth() + selectedInstallments);

    return {
      totalAmount: request.amount,
      installmentCount: selectedInstallments,
      installmentAmount: parseFloat(installmentAmount.toFixed(2)),
      firstDueDate: firstDueDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      lastDueDate: lastDueDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  }, [request, selectedInstallments]);

  const handleConfirm = async () => {
    await onConfirm(selectedInstallments);
  };

  if (!request || !child) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : () => {}}
      title="💰 Aprovar Empréstimo"
      size="lg"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      {/* Informações do Pedido */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{child.avatar}</span>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {child.name}
            </h3>
            <p className="text-sm text-text-secondary">
              Saldo atual: R$ {child.balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-bg-card border-l-4 border-primary rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Pedido:</p>
          <p className="font-semibold text-text-primary mb-2">
            {request.reason}
          </p>
          <p className="text-2xl font-bold text-primary">
            R$ {request.amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Seletor de Parcelas */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Número de Parcelas:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {INSTALLMENT_OPTIONS.map(count => (
            <button
              key={count}
              onClick={() => setSelectedInstallments(count)}
              disabled={isLoading}
              className={`
                px-4 py-3 rounded-lg font-semibold text-sm transition-all
                ${
                  selectedInstallments === count
                    ? 'bg-primary text-bg-primary border-2 border-primary shadow-lg scale-105'
                    : 'bg-bg-card text-text-primary border border-border hover:border-primary hover:bg-bg-secondary'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {count}x
            </button>
          ))}
        </div>
      </div>

      {/* Preview das Parcelas */}
      {preview && (
        <div className="bg-gradient-to-br from-[#1A4731] to-[#0D2818] border-2 border-primary/30 rounded-xl p-5 mb-6">
          <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <span>📋</span>
            Preview do Empréstimo
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-white/60 mb-1">Valor Total</p>
              <p className="text-xl font-bold text-primary">
                R$ {preview.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Parcelas</p>
              <p className="text-xl font-bold text-white">
                {preview.installmentCount}x de R${' '}
                {preview.installmentAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-white/60 mb-1">1ª Parcela</p>
              <p className="text-sm font-semibold text-white">
                {preview.firstDueDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Última Parcela</p>
              <p className="text-sm font-semibold text-white">
                {preview.lastDueDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informação Educativa */}
      <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-text-primary flex items-start gap-2">
          <span className="text-lg flex-shrink-0">💡</span>
          <span>
            Ao aprovar, o empréstimo será criado automaticamente com as parcelas
            definidas. A criança poderá acompanhar o pagamento na sua tela.
            <strong className="block mt-1">
              Sem juros! Apenas educacional.
            </strong>
          </span>
        </p>
      </div>

      {/* Botões de Ação */}
      <ModalFooter align="right">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Criando Empréstimo...' : '✅ Confirmar Empréstimo'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
