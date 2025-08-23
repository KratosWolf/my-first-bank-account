'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TransactionsStorage } from '@/lib/storage/transactions';

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

interface Transaction {
  id: string;
  childId: string;
  amount: number;
  category: string;
  description?: string;
  timestamp: string;
}

export default function ChildDashboard() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    if (childId) {
      loadChildData();
    }
  }, [childId]);

  const checkSession = () => {
    try {
      const session = sessionStorage.getItem('childSession');
      if (!session) {
        router.push('/');
        return;
      }

      const childSession = JSON.parse(session);
      if (childSession.id !== childId) {
        router.push('/');
        return;
      }
    } catch (error) {
      router.push('/');
    }
  };

  const loadChildData = () => {
    try {
      // Load child data
      const saved = localStorage.getItem('banco-familia-children');
      if (saved) {
        const allChildren = JSON.parse(saved);
        const foundChild = allChildren.find((c: Child) => c.id === childId);
        if (foundChild) {
          setChild(foundChild);
        } else {
          router.push('/');
          return;
        }
      }

      // Load transactions
      const childTransactions = TransactionsStorage.getByChild(childId);
      setTransactions(childTransactions.slice(0, 10)); // Last 10 transactions
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('childSession');
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-lg">Carregando sua conta...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Criança não encontrada</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-4xl mr-3">{child.avatar}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Olá, {child.name}! 👋
                </h1>
                <p className="text-sm text-gray-500">
                  Level {child.level} • {child.points} pontos
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-8">
          <div className="text-center">
            <h2 className="text-lg font-medium mb-2">Seu Saldo</h2>
            <div className="text-4xl font-bold mb-2">
              {formatCurrency(child.balance)}
            </div>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="text-purple-100">
                <div className="font-medium">Level</div>
                <div className="text-xl">{child.level}</div>
              </div>
              <div className="text-purple-100">
                <div className="font-medium">Pontos</div>
                <div className="text-xl">{child.points}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold">Metas</div>
            <div className="text-sm opacity-80">Ver seus objetivos</div>
          </button>

          <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors">
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-semibold">Pedir</div>
            <div className="text-sm opacity-80">Solicitar compra</div>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Histórico Recente
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-gray-500">Nenhuma transação ainda</p>
              <p className="text-sm text-gray-400">
                Suas movimentações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`text-2xl mr-3 ${
                        transaction.amount > 0 ? '💰' : '🛒'
                      }`}
                    >
                      {transaction.amount > 0 ? '💰' : '🛒'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
