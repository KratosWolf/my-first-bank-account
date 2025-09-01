'use client';

export default function TestJS() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔧 TESTE JAVASCRIPT PRODUÇÃO - V2.0</h1>

      <button
        onClick={() => alert('JavaScript funcionando!')}
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '18px',
          marginBottom: '20px',
        }}
      >
        CLIQUE AQUI - Teste Alert
      </button>

      <br />

      <button
        onClick={() => {
          console.log('🎯 TESTE PRODUÇÃO: Console log funcionando!');
          alert('Verifique o console (F12)');
        }}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '18px',
          marginBottom: '20px',
        }}
      >
        TESTE CONSOLE
      </button>

      <br />

      <button
        onClick={() => {
          window.location.href = '/api/test-approval?id=test&action=approve';
        }}
        style={{
          backgroundColor: 'orange',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '18px',
          marginRight: '10px',
        }}
      >
        TESTE NOVA API
      </button>

      <br />
      <br />

      <button
        onClick={() => {
          window.location.href = '/api/approve-request?id=test&action=approve';
        }}
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '18px',
        }}
      >
        TESTE API ANTIGA
      </button>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <h3>📋 Teste em Produção:</h3>
        <ol>
          <li>
            <strong>Botão Alert:</strong> Deve aparecer popup
          </li>
          <li>
            <strong>Botão Console:</strong> Deve aparecer popup + log no console
          </li>
          <li>
            <strong>Botão API:</strong> Deve redirecionar com mensagem de
            sucesso
          </li>
        </ol>
        <p>
          <strong>
            Se TODOS funcionarem = JavaScript está OK em produção!
          </strong>
        </p>
      </div>
    </div>
  );
}
