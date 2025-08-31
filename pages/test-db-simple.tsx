import { useState } from 'react';

export default function TestDBSimple() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erro: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Teste do Supabase</h1>
      <button onClick={testConnection} disabled={loading}>
        {loading ? 'Testando...' : 'Testar Conexão'}
      </button>
      <pre
        style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}
      >
        {result || 'Nenhum teste executado'}
      </pre>
    </div>
  );
}
