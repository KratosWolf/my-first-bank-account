'use client';

import {
  Transaction,
  TRANSACTION_CATEGORIES,
} from '@/lib/storage/transactions';

interface Child {
  id: string;
  name: string;
  avatar: string;
}

interface HistoryModalProps {
  transactions: Transaction[];
  children: Child[];
  onClose: () => void;
}

export default function HistoryModal({
  transactions,
  children,
  onClose,
}: HistoryModalProps) {
  const getChildInfo = (childId: string) => {
    return (
      children.find(c => c.id === childId) || {
        name: 'Desconhecido',
        avatar: '❓',
      }
    );
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryInfo = (category: string) => {
    return (
      TRANSACTION_CATEGORIES[category as keyof typeof TRANSACTION_CATEGORIES] ||
      TRANSACTION_CATEGORIES.other
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            📊 Histórico de Transações
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600">Nenhuma transação ainda</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {transactions.map(transaction => {
                const child = getChildInfo(transaction.childId);
                const categoryInfo = getCategoryInfo(transaction.category);
                // Corrigir lógica: usar o campo 'type' ao invés do sinal do amount
                const isIncome = transaction.type === 'earning' ||
                                 transaction.type === 'interest' ||
                                 transaction.type === 'allowance' ||
                                 transaction.type === 'transfer';

                return (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{child.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {child.name}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}
                            >
                              {categoryInfo.icon} {categoryInfo.label}
                            </span>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {transaction.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            isIncome ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isIncome ? 'Recebido' : 'Gasto'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
