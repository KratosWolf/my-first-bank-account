/**
 * NewRequestForm - Formulário para criança solicitar empréstimo
 * Task 2.11 - Visual lúdico com paleta verde/amarelo/branco
 */

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NewRequestFormProps {
  onSubmit: (data: {
    itemName: string;
    amount: number;
    reason: string;
    category: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: 'brinquedo', label: '🧸 Brinquedo', emoji: '🧸' },
  { value: 'livro', label: '📚 Livro', emoji: '📚' },
  { value: 'roupa', label: '👕 Roupa', emoji: '👕' },
  { value: 'eletronico', label: '📱 Eletrônico', emoji: '📱' },
  { value: 'esporte', label: '⚽ Esporte', emoji: '⚽' },
  { value: 'outro', label: '🎁 Outro', emoji: '🎁' },
];

export const NewRequestForm: React.FC<NewRequestFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('outro');
  const [errors, setErrors] = useState<{
    itemName?: string;
    amount?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Digite o nome do item';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Digite um valor maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        itemName: itemName.trim(),
        amount: parseFloat(amount),
        reason: reason.trim(),
        category,
      });

      // Limpar form após sucesso
      setItemName('');
      setAmount('');
      setReason('');
      setCategory('outro');
      setErrors({});
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Alert */}
      <div className="bg-[#F5B731]/10 border border-[#F5B731]/30 rounded-lg p-4">
        <p className="text-sm text-white/90 flex items-start gap-2">
          <span className="text-lg">💡</span>
          <span>
            Você pode pedir emprestado para comprar algo especial! Seus pais vão
            analisar o pedido e decidir quantas parcelas você terá.
          </span>
        </p>
      </div>

      {/* Nome do Item */}
      <div>
        <label
          htmlFor="itemName"
          className="block text-sm font-medium text-white mb-2"
        >
          O que você quer? <span className="text-[#F5B731]">*</span>
        </label>
        <Input
          id="itemName"
          type="text"
          placeholder="Ex: Bicicleta nova"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          className={errors.itemName ? 'border-red-500' : ''}
          disabled={isLoading}
          maxLength={100}
        />
        {errors.itemName && (
          <p className="text-red-400 text-sm mt-1">{errors.itemName}</p>
        )}
      </div>

      {/* Valor */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-white mb-2"
        >
          Quanto custa? <span className="text-[#F5B731]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-lg">
            R$
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={`pl-12 ${errors.amount ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
        </div>
        {errors.amount && (
          <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
        )}
      </div>

      {/* Categoria */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-white mb-2"
        >
          Tipo de item
        </label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full bg-[#1A4731] text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5B731] transition-all"
          disabled={isLoading}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Motivo (opcional) */}
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-white mb-2"
        >
          Por que você quer isso? (opcional)
        </label>
        <textarea
          id="reason"
          placeholder="Ex: Para brincar com meus amigos no parque"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full bg-[#1A4731] text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5B731] transition-all resize-none"
          rows={3}
          disabled={isLoading}
          maxLength={300}
        />
        <p className="text-xs text-white/50 mt-1">
          {reason.length}/300 caracteres
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Enviando...
            </>
          ) : (
            <>
              <span className="mr-2">📨</span>
              Fazer Pedido
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
