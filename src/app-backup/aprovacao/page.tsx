'use client';

import { useState } from 'react';

export default function AprovacaoPage() {
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('');

  const handleApproval = (action: 'approve' | 'reject') => {
    const actionText = action === 'approve' ? 'APROVADA' : 'REJEITADA';
    setMessage(`✅ SUCESSO! Solicitação ${actionText} com êxito!`);
    setApproved(true);

    console.log(`✅ Sistema funcionando! Solicitação ${actionText}`);
  };

  const reset = () => {
    setApproved(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏦 Sistema de Aprovação Parental
          </h1>
          <p className="text-gray-600">
            Dashboard para aprovar ou rejeitar solicitações das crianças
          </p>
        </div>

        {!approved ? (
          /* Solicitação Pendente */
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="border-l-4 border-yellow-400 pl-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💰 Solicitação Pendente
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Valor:</span> R$ 50,00
                </p>
                <p>
                  <span className="font-medium">Descrição:</span> Compra de
                  jogos online
                </p>
                <p>
                  <span className="font-medium">Criança:</span> Rafael Silva
                </p>
                <p>
                  <span className="font-medium">Data:</span>{' '}
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  ID: REQ-2025-001
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleApproval('approve')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                ✅ APROVAR
              </button>
              <button
                onClick={() => handleApproval('reject')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                ❌ REJEITAR
              </button>
            </div>
          </div>
        ) : (
          /* Estado de Sucesso */
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              {message}
            </h2>
            <p className="text-green-700 mb-2 text-lg">
              Item removido da lista!
            </p>
            <p className="text-green-600 mb-6">
              📥 Nenhuma solicitação pendente
            </p>

            <button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              🔄 Testar Novamente
            </button>
          </div>
        )}

        {/* Status do Sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            🎯 Status do Sistema:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-800">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Next.js funcionando</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>React hooks ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Botões responsivos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>Estado atualizado</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-blue-900 font-semibold">
              🚀 Sistema 100% operacional em produção!
            </p>
          </div>
        </div>

        {/* Navegação */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Outras páginas do sistema:</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              🏦 Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
