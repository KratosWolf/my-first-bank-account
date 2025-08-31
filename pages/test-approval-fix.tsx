import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestApprovalFix() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('requires_approval', true);

      if (!error && data) {
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    console.log('🚀 TESTE ISOLADO - handleApproval:', { requestId, approved });

    try {
      setLoading(true);
      alert(
        `TESTE ISOLADO: ${approved ? 'Aprovando' : 'Rejeitando'} ${requestId}`
      );

      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by_parent: approved,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      console.log('📄 Resultado:', { data, error });

      if (error) {
        console.error('❌ Erro:', error);
        alert(`❌ Erro: ${error.message}`);
        return;
      }

      alert('✅ Sucesso! Transação atualizada.');

      // Remover da lista
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('❌ Erro geral:', error);
      alert('❌ Erro geral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 TESTE ISOLADO - Sistema de Aprovação
          </h1>

          <div className="mb-4">
            <p className="text-lg text-gray-700">
              Status: {loading ? '⏳ Processando...' : '✅ Pronto'}
            </p>
            <p className="text-lg text-gray-700">
              Pedidos pendentes: <strong>{pendingRequests.length}</strong>
            </p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500">Nenhum pedido pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
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
                        Valor: R$ {request.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">ID: {request.id}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(request.id, true)}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 font-bold"
                      >
                        ✅ APROVAR
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, false)}
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
            <h3 className="font-bold text-blue-900">Como testar:</h3>
            <ol className="list-decimal list-inside text-blue-800 mt-2 space-y-1">
              <li>Abra o Console do navegador (F12)</li>
              <li>Clique em um dos botões de aprovação</li>
              <li>Verifique se aparecem os logs no console</li>
              <li>Verifique se aparecem os alerts</li>
              <li>Se funcionar aqui, o problema é cache na página principal</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
