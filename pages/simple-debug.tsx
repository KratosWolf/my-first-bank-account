export default function SimpleDebug() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔧 TESTE SUPER SIMPLES</h1>
      <p>Se você está vendo isso, a página está funcionando!</p>

      <button
        onClick={() => alert('JavaScript funcionando!')}
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        CLIQUE AQUI - Teste JavaScript
      </button>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => {
            console.log('🔍 TESTE: Console log funcionando!');
            alert('Verifique o console (F12)');
          }}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          TESTE CONSOLE
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        <h3>📋 Instruções:</h3>
        <ol>
          <li>Clique no primeiro botão - deve aparecer um alert</li>
          <li>Clique no segundo botão - deve aparecer alert + console log</li>
          <li>Se AMBOS funcionarem → JavaScript está OK</li>
          <li>Se NENHUM funcionar → problema grave no JavaScript</li>
        </ol>
      </div>
    </div>
  );
}
