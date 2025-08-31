'use client';

export default function DebugSimple() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 TESTE BÁSICO - JavaScript</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste 1: Alert Simples</h2>
        <button
          onClick={() => alert('FUNCIONOU! JavaScript básico OK')}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Clique Aqui - Teste Alert
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste 2: Confirmação</h2>
        <button
          onClick={() => {
            if (confirm('Confirma a ação?')) {
              alert('CONFIRMOU!');
            } else {
              alert('CANCELOU!');
            }
          }}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Teste Confirmação
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste 3: Link Direto para API</h2>
        <button
          onClick={() => {
            if (confirm('Testar API direta?')) {
              window.location.href =
                '/api/approve-request?id=test&action=approve';
            }
          }}
          style={{
            backgroundColor: 'orange',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Teste API Link
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste 4: Console Log</h2>
        <button
          onClick={() => {
            console.log('🔍 TESTE: Button clicked!');
            console.log('🔍 TESTE: Window object:', !!window);
            console.log('🔍 TESTE: Document object:', !!document);
            alert('Verifique o console para logs');
          }}
          style={{
            backgroundColor: 'purple',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Teste Console
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
        }}
      >
        <h3>📋 Como usar:</h3>
        <ol>
          <li>Abra o Console do navegador (F12)</li>
          <li>Teste cada botão</li>
          <li>Se TODOS funcionarem → problema é na página principal</li>
          <li>Se NENHUM funcionar → problema no JavaScript geral</li>
          <li>Se ALGUNS funcionarem → problema específico</li>
        </ol>
      </div>
    </div>
  );
}
