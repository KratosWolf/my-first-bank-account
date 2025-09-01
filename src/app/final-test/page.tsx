'use client';

export default function FinalTest() {
  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial',
        backgroundColor: '#f0f0f0',
      }}
    >
      <h1 style={{ color: 'red' }}>🚨 TESTE FINAL - NOVA PÁGINA</h1>

      <p style={{ fontSize: '20px', color: 'blue' }}>
        Esta é uma página COMPLETAMENTE NOVA criada agora mesmo!
      </p>

      <button
        onClick={() => {
          alert('🎉 JavaScript 100% funcionando!');
        }}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '20px 40px',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '18px',
          marginBottom: '20px',
          display: 'block',
        }}
      >
        ✅ TESTE JAVASCRIPT
      </button>

      <button
        onClick={() => {
          // Usar a nova API que criamos
          window.location.href =
            '/api/test-approval?id=FINAL-TEST&action=approve';
        }}
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '20px 40px',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'block',
        }}
      >
        🚀 TESTE API NOVA
      </button>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'yellow',
          borderRadius: '10px',
          border: '3px solid red',
        }}
      >
        <h3>🎯 TESTE DEFINITIVO:</h3>
        <p>
          <strong>1º:</strong> Clique no botão VERDE - deve aparecer alert
        </p>
        <p>
          <strong>2º:</strong> Clique no botão VERMELHO - deve redirecionar com
          sucesso
        </p>
        <p>
          <strong>Se ambos funcionarem = PROBLEMA RESOLVIDO!</strong>
        </p>
      </div>
    </div>
  );
}
