'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import type { Child } from '@/lib/supabase';

export default function ChildAccess() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      // In a real app, get children from authenticated family
      const testChildren = await StorageAdapter.getChildren('ad3bf4c0-b441-48ae-9c7d-4a2e29237c36');
      setChildren(testChildren);
      
      // If there's an ID in the URL, pre-select that child
      if (router.query.id && typeof router.query.id === 'string') {
        const child = testChildren.find(c => c.id === router.query.id);
        if (child) {
          setSelectedChild(child);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    setAuthenticating(true);
    setError('');

    // Simulate PIN verification (in a real app, this would be properly secured)
    if (pin === selectedChild.pin) {
      // Redirect to child's personalized dashboard
      router.push(`/dashboard?childId=${selectedChild.id}`);
    } else {
      setError('PIN incorreto. Tente novamente.');
      setPin('');
    }
    
    setAuthenticating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl animate-spin">
            👶
          </div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-10 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-10 animate-pulse delay-150"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/20">
            
            {!selectedChild ? (
              // Child Selection Screen
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-3xl">
                  👶
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Quem está usando hoje?</h1>
                <p className="text-gray-600 mb-4">Selecione seu nome para acessar suas atividades.</p>
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    💡 <strong>Para teste:</strong> Debug Child PIN: <code className="bg-white px-1 rounded">9999</code> • Test Child PIN: <code className="bg-white px-1 rounded">1234</code>
                  </p>
                </div>
                
                <div className="space-y-3">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChild(child)}
                      className="w-full p-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 border border-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{child.avatar}</div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-500">Nível {child.level} • R$ {child.balance.toFixed(2)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/parent-dashboard')}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    👨‍👩‍👧‍👦 Acesso dos Pais
                  </button>
                </div>
              </>
            ) : (
              // PIN Entry Screen
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl">
                  {selectedChild.avatar}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Olá, {selectedChild.name}!</h1>
                <p className="text-gray-600 mb-8">Digite seu PIN secreto para acessar suas atividades.</p>
                
                <form onSubmit={handlePinSubmit} className="space-y-6">
                  <div>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Digite seu PIN"
                      maxLength={4}
                      className="w-full text-center text-3xl font-bold py-4 px-6 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-0 outline-none transition-colors bg-white/80"
                      autoFocus
                      disabled={authenticating}
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChild(null);
                        setPin('');
                        setError('');
                      }}
                      className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={pin.length !== 4 || authenticating}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                    >
                      {authenticating ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verificando...</span>
                        </div>
                      ) : (
                        'Entrar'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Esqueceu seu PIN? Peça ajuda aos seus pais.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}