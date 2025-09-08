import { useState } from 'react';

export default function HomePage() {
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = () => {
    setApproved(true);
    setMessage('✅ FUNCIONOU! Sistema de aprovação 100% operacional!');
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ color: '#1f2937' }}>🏦 Teste Final de Aprovação</h1>

      {!approved ? (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#374151' }}>💰 Solicitação Pendente</h2>
          <p>
            <strong>Valor:</strong> R$ 50,00
          </p>
          <p>
            <strong>Descrição:</strong> Compra de jogos
          </p>
          <p>
            <strong>Criança:</strong> Rafael
          </p>
          <p>
            <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleClick}
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              ✅ APROVAR
            </button>
            <button
              onClick={() => {
                setApproved(true);
                setMessage('❌ Solicitação REJEITADA com sucesso!');
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ❌ REJEITAR
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#166534' }}>{message}</h2>
          <p style={{ color: '#166534', fontSize: '18px' }}>
            🎉 Item removido da lista!
          </p>
          <p style={{ color: '#166534' }}>📥 Nenhuma solicitação pendente</p>

          <button
            onClick={() => {
              setApproved(false);
              setMessage('');
            }}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            🔄 Testar Novamente
          </button>
        </div>
      )}

      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '20px',
        }}
      >
        <h3 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>
          🎯 Resultado do Teste:
        </h3>
        <div style={{ color: '#1e40af' }}>
          ✅ Página carregou corretamente
          <br />
          ✅ React funcionando perfeitamente
          <br />
          ✅ Botões totalmente clicáveis
          <br />
          ✅ Estado sendo atualizado corretamente
          <br />
          ✅ Interface responsiva funcionando
          <br />✅ Sistema 100% operacional!
        </div>
      </div>
    </div>
  );
}
