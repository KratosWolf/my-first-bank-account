'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import type { Child } from '@/lib/supabase';
import ChoreTemplates from '@/components/chores/ChoreTemplates';
import AssignedChoresManager from '@/components/chores/AssignedChoresManager';

export default function ChoresManagement() {
  const { data: session, status } = useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'assigned'>('assigned');

  useEffect(() => {
    if (session) {
      loadData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const loadData = async () => {
    try {
      // For now, use the test family ID
      const familyId = 'ad3bf4c0-b441-48ae-9c7d-4a2e29237c36';
      const childrenData = await StorageAdapter.getChildren(familyId);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
            📝
          </div>
          <p className="text-gray-600 font-medium">Carregando gerenciamento de tarefas...</p>
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
              🔒
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Acesso Restrito</h1>
            <p className="text-gray-600 mb-8">Você precisa estar logado para acessar o gerenciamento de tarefas.</p>
            
            <a
              href="/parent-dashboard"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>←</span>
              <span>Voltar ao Dashboard</span>
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
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-10 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-10 animate-pulse delay-150"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
                  <span className="text-3xl">📝</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Gerenciamento de Tarefas
                  </h1>
                  <p className="text-gray-600">
                    Olá, {session.user?.name} • {children.length} crianças
                  </p>
                </div>
              </div>

              <a
                href="/parent-dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>←</span>
                <span>Dashboard</span>
              </a>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100/50 rounded-xl p-1 mt-6">
              <button
                onClick={() => setActiveTab('assigned')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'assigned'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/70 hover:text-blue-600'
                }`}
              >
                <span>📋</span>
                <span>Tarefas Atribuídas</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'templates'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/70 hover:text-purple-600'
                }`}
              >
                <span>⚙️</span>
                <span>Modelos de Tarefas</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl animate-spin">
                  📝
                </div>
                <p className="text-gray-600 font-medium">Carregando dados...</p>
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👶</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma criança cadastrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Você precisa ter crianças cadastradas para gerenciar tarefas.
                </p>
                <a
                  href="/test-database"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span>👶</span>
                  <span>Cadastrar Crianças</span>
                </a>
              </div>
            ) : (
              <>
                {activeTab === 'assigned' && (
                  <AssignedChoresManager
                    familyId="ad3bf4c0-b441-48ae-9c7d-4a2e29237c36"
                    children={children}
                  />
                )}

                {activeTab === 'templates' && (
                  <ChoreTemplates
                    familyId="ad3bf4c0-b441-48ae-9c7d-4a2e29237c36"
                    children={children}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}