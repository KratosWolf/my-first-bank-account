'use client';

import { useState } from 'react';

interface Child {
  id: string;
  name: string;
  pin: string;
  balance: number;
  level: number;
  points: number;
  avatar: string;
  createdAt: string;
  parentId: string;
}

interface TransactionModalProps {
  child: Child;
  onSave: (amount: number, category: string, description: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { id: 'allowance', label: 'Mesada', color: 'bg-blue-100 text-blue-800' },
  { id: 'chore', label: 'Tarefa', color: 'bg-green-100 text-green-800' },
  { id: 'gift', label: 'Presente', color: 'bg-purple-100 text-purple-800' },
  { id: 'purchase', label: 'Compra', color: 'bg-red-100 text-red-800' },
  { id: 'reward', label: 'Prêmio', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', label: 'Outro', color: 'bg-gray-100 text-gray-800' },
];

export default function TransactionModal({
  child,
  onSave,
  onCancel,
  isSubmitting,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('allowance');
  const [description, setDescription] = useState('');
  const [isAddition, setIsAddition] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount && numAmount > 0) {
      onSave(isAddition ? numAmount : -numAmount, category, description);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transação - {child.avatar} {child.name}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Tipo de transação */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transação
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddition(true)}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  isAddition
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                ➕ Adicionar
              </button>
              <button
                type="button"
                onClick={() => setIsAddition(false)}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  !isAddition
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                ➖ Remover
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Categoria */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    category === cat.id
                      ? cat.color
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Mesada de Janeiro, Limpou o quarto..."
              maxLength={100}
            />
          </div>

          {/* Preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {isAddition ? '✅ Adicionar' : '❌ Remover'}{' '}
              <strong>R$ {amount || '0,00'}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Saldo atual: R$ {child.balance.toFixed(2)} → R${' '}
              {(
                child.balance +
                (isAddition ? 1 : -1) * parseFloat(amount || '0')
              ).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg ${
                isAddition
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50`}
              disabled={isSubmitting || !amount}
            >
              {isSubmitting
                ? 'Processando...'
                : isAddition
                  ? 'Adicionar'
                  : 'Remover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
