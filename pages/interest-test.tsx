'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function InterestTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const applyInterest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cron/apply-interest', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-cron-secret-123',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erro ao aplicar juros');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💰 Sistema de Rendimento</h1>
              <p className="text-gray-600">Teste de aplicação automática de juros</p>
            </div>
            <button
              onClick={() => router.push('/system-overview')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">📊</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Como Funciona</h2>
                <p className="text-gray-600">Sistema de juros educativos</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa mensal:</span>
                <span className="font-semibold text-green-600">1% ao mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Regra dos 30 dias:</span>
                <span className="font-semibold text-yellow-600">Só rende dinheiro antigo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo mínimo:</span>
                <span className="font-semibold text-blue-600">R$ 10,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aplicação:</span>
                <span className="font-semibold text-purple-600">Automática (mensal)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Exemplo:</strong> Com R$ 100,00 há 30+ dias na conta, a criança ganha R$ 1,00 por mês!
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ⏰ <strong>Importante:</strong> Dinheiro novo (menos de 30 dias) não rende juros ainda.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">🤖</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Aplicação Automática</h2>
                <p className="text-gray-600">Simular cron job mensal</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Este botão simula o que acontece automaticamente todo dia 1º do mês. 
              Todos os saldos elegíveis recebem juros proporcionais.
            </p>

            <button
              onClick={applyInterest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Aplicando juros...' : '💰 Aplicar Juros Agora'}
            </button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">❌</div>
              <h3 className="text-lg font-bold text-red-800">Erro na aplicação</h3>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold text-green-800">Juros Aplicados!</h3>
                <p className="text-green-600">{result.message}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.summary.total_families}</div>
                <div className="text-sm text-gray-600">Famílias</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{result.summary.total_children}</div>
                <div className="text-sm text-gray-600">Crianças</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">R$ {result.summary.total_interest_applied.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Juros distribuídos</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Detalhes por criança:</h4>
              {result.summary.results.map((child: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">
                      {child.status === 'success' ? '✅' : 
                       child.status === 'skipped' ? '⏩' : '❌'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{child.child_name}</div>
                      <div className="text-sm text-gray-600">
                        {child.status === 'success' && `Novo saldo: R$ ${child.new_balance.toFixed(2)}`}
                        {child.status === 'skipped' && child.reason}
                        {child.status === 'error' && `Erro: ${child.error}`}
                      </div>
                    </div>
                  </div>
                  
                  {child.status === 'success' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +R$ {child.interest_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">juros</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Como configurar em produção</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800">1. Configurar variável de ambiente:</h4>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CRON_SECRET=seu-token-secreto-aqui</code>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800">2. Configurar Vercel Cron (vercel.json):</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "crons": [{
    "path": "/api/cron/apply-interest",
    "schedule": "0 0 1 * *"
  }]
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800">3. Ou usar serviço externo de cron:</h4>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                curl -X POST https://seu-app.vercel.app/api/cron/apply-interest -H "Authorization: Bearer seu-token"
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}