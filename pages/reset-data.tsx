import { useState } from 'react';
import { ChildrenService } from '../src/lib/services/childrenService';

export default function ResetDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClearData = () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Limpar dados corrompidos
      ChildrenService.clearCorruptedData();
      
      setMessage('✅ Dados limpos com sucesso! UUIDs válidos restaurados.');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      setMessage('❌ Erro ao limpar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-3xl">
            🧹
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Limpar Dados Corrompidos
          </h1>
          <p className="text-gray-600">
            Esta ação irá limpar todos os dados com IDs inválidos e restaurar os dados padrão com UUIDs válidos.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-yellow-800">Atenção</h3>
              <p className="text-sm text-yellow-700">
                Todos os dados atuais serão removidos e substituídos pelos dados padrão (Rafael Silva e Ana Oliveira).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!message && (
          <button
            onClick={handleClearData}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Limpando dados...
              </span>
            ) : (
              '🧹 Limpar e Resetar Dados'
            )}
          </button>
        )}

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-semibold">{message}</p>
            {message.includes('✅') && (
              <p className="text-sm mt-2">Redirecionando para o dashboard...</p>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}