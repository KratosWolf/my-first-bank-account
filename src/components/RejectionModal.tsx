/**
 * RejectionModal - Modal para recusar pedidos (empréstimos ou compras)
 * Task 2.12 - Pai informa motivo (opcional mas encorajado) ao recusar
 */

import React, { useState } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface Request {
  id: string;
  child_id: string;
  child_name?: string;
  reason?: string;
  description?: string;
  amount: number;
  type: 'loan' | 'spending';
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (parentNote: string) => Promise<void>;
  request: Request | null;
  child: Child | null;
  isLoading?: boolean;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  child,
  isLoading = false,
}) => {
  const [parentNote, setParentNote] = useState('');

  const handleConfirm = async () => {
    await onConfirm(parentNote.trim());
    setParentNote(''); // Limpar campo após confirmação
  };

  const handleClose = () => {
    setParentNote(''); // Limpar campo ao fechar
    onClose();
  };

  if (!request || !child) return null;

  const requestTitle = request.reason || request.description || 'Pedido';
  const requestType =
    request.type === 'loan' ? 'empréstimo' : 'pedido de compra';

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? handleClose : () => {}}
      title="❌ Recusar Pedido"
      size="md"
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
              {request.type === 'loan'
                ? '💰 Pedido de Empréstimo'
                : '🛒 Pedido de Compra'}
            </p>
          </div>
        </div>

        <div className="bg-error/10 border-l-4 border-error rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">
            {request.type === 'loan' ? 'Item solicitado:' : 'Pedido:'}
          </p>
          <p className="font-semibold text-text-primary mb-2">{requestTitle}</p>
          <p className="text-xl font-bold text-error">
            R$ {request.amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Campo de Motivo */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Motivo da Recusa (opcional, mas encorajado):
        </label>
        <textarea
          value={parentNote}
          onChange={e => setParentNote(e.target.value)}
          placeholder={`Explique para ${child.name.split(' ')[0]} por que não pode aprovar agora. Isso ajuda na educação financeira!

Exemplo: "Precisamos economizar este mês para outras prioridades da família."`}
          rows={4}
          maxLength={500}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-bg-card text-text-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-error focus:border-error resize-none disabled:opacity-50"
        />
        <p className="text-xs text-text-secondary mt-1">
          {parentNote.length}/500 caracteres
        </p>
      </div>

      {/* Informação Educativa */}
      <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-text-primary flex items-start gap-2">
          <span className="text-lg flex-shrink-0">💡</span>
          <span>
            <strong>Dica:</strong> Explicar o motivo da recusa ajuda a criança a
            entender decisões financeiras e desenvolver consciência sobre
            prioridades e limites.
          </span>
        </p>
      </div>

      {/* Botões de Ação */}
      <ModalFooter align="right">
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Voltar
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Recusando...' : '❌ Confirmar Recusa'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
