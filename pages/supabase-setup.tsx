import { useState } from 'react';
import Link from 'next/link';

export default function SupabaseSetup() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      const newResult = {
        timestamp: new Date().toLocaleTimeString(),
        action,
        success: result.success,
        message: result.message || result.error,
        data: result.family || result.child || result.data,
      };

      setResults(prev => [newResult, ...prev]);

      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toLocaleTimeString(),
        action,
        success: false,
        message: `Erro de rede: ${error}`,
        data: null,
      };

      setResults(prev => [errorResult, ...prev]);
      alert(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            🔧 Configuração do Supabase
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">
              Objetivo: Transformar em app real
            </h2>
            <p className="text-blue-700 text-sm">
              Vamos testar e configurar o Supabase para salvar tudo no banco de
              dados em vez do localStorage. Assim o app funcionará de qualquer
              dispositivo!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => testConnection('test-connection')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '⏳' : '🔗'} Testar Conexão
            </button>

            <button
              onClick={() => testConnection('create-test-family')}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '⏳' : '👨‍👩‍👧‍👦'} Criar Família Teste
            </button>

            <button
              onClick={() => testConnection('create-test-child')}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '⏳' : '👧'} Criar Criança Teste
            </button>
          </div>

          <div className="bg-gray-800 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm">
            <h3 className="text-white mb-2">📋 Resultados dos Testes:</h3>
            {results.length === 0 ? (
              <p className="text-gray-400">Nenhum teste executado ainda...</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">[{result.timestamp}]</span>
                    <span
                      className={
                        result.success ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="text-blue-300">{result.action}</span>
                  </div>
                  <div className="ml-4 text-white">{result.message}</div>
                  {result.data && (
                    <div className="ml-4 text-gray-300 text-xs">
                      Data: {JSON.stringify(result.data, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setResults([])}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🧹 Limpar Resultados
            </button>

            <Link
              href="/demo-parent-view"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors inline-block"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
