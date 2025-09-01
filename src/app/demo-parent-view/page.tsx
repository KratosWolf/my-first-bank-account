'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PurchaseRequest {
  id: string;
  amount: number;
  description: string;
  status: string;
  child_name?: string;
  created_at: string;
}

export default function DemoParentView() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('requires_approval', true);

      if (error) {
        console.error('❌ Erro ao carregar solicitações:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('❌ Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    console.log('🚀 PRODUÇÃO: Processando', { requestId, action });

    try {
      setLoading(true);

      // Usar a API que já funciona
      window.location.href = `/api/approve-request?id=${requestId}&action=${action}`;
    } catch (error) {
      console.error('❌ Erro:', error);
      setMessage('❌ Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const testMode = () => {
    console.log('🧪 MODO TESTE ATIVADO');
    handleApproval('test', 'approve');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🏦 Dashboard Parental
            </h1>
            <div className="text-center py-8">
              <p className="text-xl text-gray-500">
                ⏳ Carregando solicitações...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🏦 Dashboard Parental
          </h1>

          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          {/* Botão de Teste */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
              🧪 Modo Teste
            </h3>
            <p className="text-yellow-700 mb-4">
              Clique para testar se a funcionalidade está funcionando:
            </p>
            <button
              onClick={testMode}
              disabled={loading}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-bold"
            >
              ⚡ TESTE RÁPIDO
            </button>
          </div>

          {/* BOTÃO DE TESTE DIRETO */}
          <div className="mb-8 p-6 bg-yellow-100 border-2 border-yellow-400 rounded-xl">
            <h3 className="text-xl font-bold text-yellow-800 mb-3">
              🧪 TESTE DE APROVAÇÃO
            </h3>
            <p className="text-yellow-700 mb-4">
              Clique para testar se o sistema de aprovação está funcionando:
            </p>
            <button
              onClick={() =>
                (window.location.href =
                  '/api/test-approval?id=TESTE-DASHBOARD&action=approve')
              }
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              ⚡ TESTE APROVAÇÃO
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500 mb-4">
                📥 Nenhuma solicitação pendente
              </p>
              <p className="text-gray-400">
                As solicitações das crianças aparecerão aqui para aprovação
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📋 Solicitações Pendentes ({requests.length})
              </h2>

              {requests.map(request => (
                <div
                  key={request.id}
                  className="bg-gray-50 p-6 rounded-lg border"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">
                        {request.description || 'Pedido de compra'}
                      </h3>
                      <p className="text-gray-600">
                        💰 Valor: R$ {request.amount.toFixed(2)}
                      </p>
                      {request.child_name && (
                        <p className="text-sm text-gray-500">
                          👦 Criança: {request.child_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        🕒{' '}
                        {new Date(request.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        ID: {request.id}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(request.id, 'approve')}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 font-bold"
                      >
                        ✅ APROVAR
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, 'reject')}
                        disabled={loading}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 font-bold"
                      >
                        ❌ NEGAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-900">💡 Como funciona:</h3>
            <ul className="list-disc list-inside text-blue-800 mt-2 space-y-1">
              <li>
                As solicitações das crianças aparecem automaticamente aqui
              </li>
              <li>Clique em APROVAR para liberar a compra</li>
              <li>Clique em NEGAR para rejeitar o pedido</li>
              <li>A criança será notificada da decisão</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
