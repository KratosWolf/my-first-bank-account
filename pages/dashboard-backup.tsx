'use client';

import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { TransactionService } from '@/lib/services/transactions';
import { supabase } from '@/lib/supabase';
import type { Child, Family, Transaction } from '@/lib/supabase';

// Import dashboard widgets
import LevelWidget from '@/components/dashboard/LevelWidget';
import GoalsWidget from '@/components/dashboard/GoalsWidget';
import BadgesWidget from '@/components/dashboard/BadgesWidget';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';

export default function Dashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get families
      const { data: familiesData } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (familiesData && familiesData.length > 0) {
        setFamilies(familiesData);
        
        // Get children from first family
        const childrenData = await StorageAdapter.getChildren(familiesData[0].id);
        setChildren(childrenData);
        
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
          
          // Load recent transactions for selected child
          const transactions = await TransactionService.getChildTransactions(childrenData[0].id, 5);
          setRecentTransactions(transactions);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = async (child: Child) => {
    setSelectedChild(child);
    const transactions = await TransactionService.getChildTransactions(child.id, 5);
    setRecentTransactions(transactions);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earning': return '💵';
      case 'allowance': return '💰';
      case 'spending': return '🛒';
      case 'transfer': return '🔄';
      case 'interest': return '📈';
      case 'goal_deposit': return '🎯';
      default: return '💳';
    }
  };

  // Loading state with better skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-300"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-700"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              {/* Header skeleton */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8">
                <div className="h-10 bg-gray-200 rounded-xl w-80 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-60"></div>
              </div>
              
              {/* Grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No families state
  if (families.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              🏠
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Bem-vindo ao Banco da Família!</h1>
            <p className="text-gray-600 mb-8">Comece sua jornada de educação financeira criando sua família.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-blue-900">Defina Metas</h3>
                  <p className="text-blue-700">Crie objetivos financeiros e acompanhe o progresso</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold text-purple-900">Ganhe Badges</h3>
                  <p className="text-purple-700">Complete atividades e ganhe recompensas</p>
                </div>
              </div>
              
              <div className="pt-4">
                <a 
                  href="/test-database"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🚀 Criar Família de Teste
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-3xl">
              👶
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Adicione Crianças</h1>
            <p className="text-gray-600 mb-8">Adicione crianças à sua família para começar a usar as funcionalidades educativas.</p>
            
            <a 
              href="/test-database"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              👶 Adicionar Crianças
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-10 animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-200 rounded-full opacity-10 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Modern Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 flex items-center justify-center sm:justify-start">
                    🏠 Banco da Família
                  </h1>
                  <p className="text-blue-100 text-sm md:text-lg">
                    {families[0]?.parent_name} • {children.length} {children.length === 1 ? 'criança' : 'crianças'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-1 md:mb-2 animate-bounce">🌟</div>
                  <div className="text-xs md:text-sm text-blue-100">Educação Financeira</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                👨‍👩‍👧‍👦 Selecionar Criança:
              </h2>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => handleChildSelect(child)}
                    className={`flex-shrink-0 p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedChild?.id === child.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 text-gray-700 hover:bg-white shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-3xl">{child.avatar}</span>
                      <span className="font-semibold">{child.name}</span>
                      <div className="text-sm opacity-90">
                        {formatCurrency(child.balance)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Financial Overview */}
            <div className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Balance Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div>
                      <div className="text-lg md:text-3xl font-bold text-green-600">
                        {formatCurrency(selectedChild.balance)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 font-medium">Saldo Atual</div>
                    </div>
                    <div className="text-2xl md:text-4xl">💰</div>
                  </div>
                  <div className="bg-green-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((selectedChild.balance / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Total Earned Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div>
                      <div className="text-lg md:text-3xl font-bold text-blue-600">
                        {formatCurrency(selectedChild.total_earned)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 font-medium">Total Ganho</div>
                    </div>
                    <div className="text-2xl md:text-4xl">📈</div>
                  </div>
                  <div className="bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((selectedChild.total_earned / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-red-600">
                        {formatCurrency(selectedChild.total_spent)}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Total Gasto</div>
                    </div>
                    <div className="text-4xl">🛒</div>
                  </div>
                  <div className="bg-red-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((selectedChild.total_spent / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* XP Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedChild.xp}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Pontos XP</div>
                    </div>
                    <div className="text-4xl">⭐</div>
                  </div>
                  <div className="bg-purple-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((selectedChild.xp / (selectedChild.level * 100)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Level Progress */}
              <div className="lg:col-span-4 animate-fadeInLeft" style={{animationDelay: '0.5s'}}>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                  <LevelWidget child={selectedChild} />
                </div>
              </div>
              
              {/* Recent Transactions */}
              <div className="lg:col-span-8 animate-fadeInRight" style={{animationDelay: '0.6s'}}>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    💳 Transações Recentes
                  </h3>
                  
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💳</div>
                      <p className="text-gray-500">Nenhuma transação ainda</p>
                      <p className="text-sm text-gray-400">As movimentações aparecerão aqui</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, index) => (
                        <div 
                          key={transaction.id} 
                          className={`flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-300 ${
                            index === 0 ? 'ring-2 ring-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {transaction.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.category} • {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`font-bold text-lg ${
                            ['earning', 'allowance', 'interest'].includes(transaction.type)
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {['earning', 'allowance', 'interest'].includes(transaction.type) ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover-lift animate-fadeInUp" style={{animationDelay: '0.7s'}}>
                <GoalsWidget childId={selectedChild.id} childName={selectedChild.name} />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover-lift animate-fadeInUp" style={{animationDelay: '0.8s'}}>
                <BadgesWidget childId={selectedChild.id} />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover-lift animate-fadeInUp" style={{animationDelay: '0.9s'}}>
                <LeaderboardWidget familyId={selectedChild.family_id} currentChildId={selectedChild.id} />
              </div>
            </div>
          </>
        )}

        {/* Enhanced Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 hover-lift animate-slideInScale" style={{animationDelay: '1.0s'}}>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center flex items-center justify-center animate-fadeInDown" style={{animationDelay: '1.1s'}}>
            🚀 Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <a 
              href="/goals-test"
              className="group flex flex-col items-center p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 border border-blue-200 animate-fadeInUp" style={{animationDelay: '1.2s'}}
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3 group-hover:animate-bounce">🎯</div>
              <div className="font-bold text-blue-900 text-center text-sm md:text-base">Metas & Sonhos</div>
              <div className="text-xs md:text-sm text-blue-700 text-center mt-1">Definir objetivos</div>
            </a>
            
            <a 
              href="/gamification-test"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-purple-200 animate-fadeInUp" style={{animationDelay: '1.3s'}}
            >
              <div className="text-4xl mb-3 group-hover:animate-bounce">🏆</div>
              <div className="font-bold text-purple-900 text-center">Badges & Níveis</div>
              <div className="text-sm text-purple-700 text-center mt-1">Ver conquistas</div>
            </a>
            
            <a 
              href="/transactions-test"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-green-200 animate-fadeInUp" style={{animationDelay: '1.4s'}}
            >
              <div className="text-4xl mb-3 group-hover:animate-bounce">💰</div>
              <div className="font-bold text-green-900 text-center">Transações</div>
              <div className="text-sm text-green-700 text-center mt-1">Gerenciar dinheiro</div>
            </a>
            
            <a 
              href="/test-database"
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 animate-fadeInUp" style={{animationDelay: '1.5s'}}
            >
              <div className="text-4xl mb-3 group-hover:animate-bounce">🗃️</div>
              <div className="font-bold text-gray-900 text-center">Configurações</div>
              <div className="text-sm text-gray-700 text-center mt-1">Gerenciar dados</div>
            </a>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 text-center animate-fadeInUp" style={{animationDelay: '1.6s'}}>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-lift">
            <p className="text-gray-600 flex items-center justify-center space-x-2">
              <span className="animate-pulse">🏠</span>
              <span className="font-medium">Banco da Família</span>
              <span>•</span>
              <span>Educação Financeira Divertida</span>
              <span className="animate-pulse">🌟</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}