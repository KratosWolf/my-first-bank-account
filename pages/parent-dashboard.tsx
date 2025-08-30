'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { TransactionService } from '@/lib/services/transactions';
import { supabase } from '@/lib/supabase';
import type { Child, Family, Transaction } from '@/lib/supabase';

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadData();
    } else if (status !== 'loading') {
      // If no session and not loading, we can stop the loading state
      setLoading(false);
    }
  }, [session, status]);

  const loadData = async () => {
    try {
      // Get families (in a real app, filter by user ID)
      const { data: familiesData } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (familiesData && familiesData.length > 0) {
        setFamilies(familiesData);
        
        // Get children from first family
        const childrenData = await StorageAdapter.getChildren(familiesData[0].id);
        setChildren(childrenData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state - only show loading if NextAuth is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            🏠
          </div>
          <p className="text-gray-600 font-medium">Carregando dashboard dos pais...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              🏠
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Dashboard dos Pais</h1>
            <p className="text-gray-600 mb-8">Acesse com sua conta Google para gerenciar a educação financeira da família.</p>
            
            <button
              onClick={() => signIn('google', { callbackUrl: '/parent-dashboard' })}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Entrar com Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show parent dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-10 animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-indigo-200 rounded-full opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Parent Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-center sm:text-left flex items-center space-x-4">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-white/50"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                      Dashboard dos Pais
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base">
                      Olá, {session.user?.name} • {children.length} crianças
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                  >
                    👶 Ver Dashboard das Crianças
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-200"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Family Balance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {children.reduce((total, child) => total + child.balance, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Saldo Total da Família</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* Total Children */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {children.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Crianças Cadastradas</div>
              </div>
              <div className="text-3xl">👶</div>
            </div>
          </div>

          {/* Family Goals */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  0
                </div>
                <div className="text-sm text-gray-600 font-medium">Metas Familiares</div>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Children Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Visão Geral das Crianças</h2>
          
          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-3xl">
                👶
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Nenhuma criança cadastrada</h3>
              <p className="text-gray-600 mb-6">Adicione crianças para começar a usar o sistema.</p>
              <a
                href="/test-database"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Adicionar Crianças
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div key={child.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{child.avatar}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-500">Nível {child.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">R$ {child.balance.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{child.xp} XP</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/child-access?id=${child.id}`}
                      className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Ver Dashboard
                    </button>
                    <button className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      ⚙️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions for Parents */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/test-database"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 transform hover:scale-105 border border-blue-200"
            >
              <div className="text-3xl mb-2">👶</div>
              <div className="font-semibold text-blue-900 text-sm text-center">Gerenciar Crianças</div>
            </a>
            
            <a
              href="/transactions-test"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 transform hover:scale-105 border border-green-200"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold text-green-900 text-sm text-center">Transações</div>
            </a>
            
            <a
              href="/chores-management"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-300 transform hover:scale-105 border border-orange-200"
            >
              <div className="text-3xl mb-2">📝</div>
              <div className="font-semibold text-orange-900 text-sm text-center">Tarefas</div>
            </a>

            <a
              href="/goals-test" 
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 transform hover:scale-105 border border-purple-200"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-purple-900 text-sm text-center">Metas Familiares</div>
            </a>
            
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 opacity-75">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold text-gray-700 text-sm text-center">Relatórios</div>
              <div className="text-xs text-gray-500 mt-1">Em breve</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}