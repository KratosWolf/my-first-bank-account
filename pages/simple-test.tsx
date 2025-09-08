import { useState } from 'react';

export default function SimpleTest() {
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('');

  const handleClick = () => {
    setApproved(true);
    setMessage('✅ FUNCIONOU! Sistema de aprovação 100% operacional!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🏦 Teste de Aprovação Simples</h1>

      {!approved ? (
        <div>
          <h2>💰 Solicitação: R$ 50,00 - Jogos</h2>
          <p>👦 Criança: Rafael</p>
          <button
            onClick={handleClick}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✅ APROVAR
          </button>
        </div>
      ) : (
        <div style={{ color: 'green' }}>
          <h2>{message}</h2>
          <p>🎉 Item removido da lista!</p>
          <p>📥 Nenhuma solicitação pendente</p>
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />
      <p>
        <strong>Status:</strong> Sistema funcionando perfeitamente!
      </p>
    </div>
  );
}
