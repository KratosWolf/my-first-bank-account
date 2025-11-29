'use client';

import { useState } from 'react';

export default function ApprovalTest() {
  const [result, setResult] = useState('');

  const testApproval = (action: 'approve' | 'reject') => {
    console.log(`🚀 TESTE: ${action} clicado`);

    // Simular o que a função original fazia
    const message = action === 'approve' ? 'APROVADO' : 'REJEITADO';
    setResult(`✅ Teste ${message} - ${new Date().toLocaleTimeString()}`);

    alert(`Teste ${message} funcionou!`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 TESTE DE APROVAÇÃO ISOLADO</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Status: {result || 'Aguardando teste...'}</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Simular Pedido de Aprovação:</h3>
        <div
          style={{
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '15px',
          }}
        >
          <p>
            <strong>Pedido:</strong> Comprar brinquedo - R$ 25,00
          </p>
          <p>
            <strong>Criança:</strong> João
          </p>
        </div>

        <button
          onClick={() => testApproval('approve')}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px',
          }}
        >
          ✅ APROVAR
        </button>

        <button
          onClick={() => testApproval('reject')}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ❌ NEGAR
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#e8f4fd',
          borderRadius: '5px',
        }}
      >
        <h3>📝 Como testar:</h3>
        <ol>
          <li>Abra o Console do navegador (F12)</li>
          <li>Clique em APROVAR ou NEGAR</li>
          <li>Verifique se:</li>
          <ul>
            <li>Aparece log no console</li>
            <li>Aparece alert</li>
            <li>O status muda aqui na página</li>
          </ul>
          <li>Se TUDO funcionar → problema é específico da página principal</li>
          <li>Se NADA funcionar → problema geral de JavaScript</li>
        </ol>
      </div>
    </div>
  );
}
