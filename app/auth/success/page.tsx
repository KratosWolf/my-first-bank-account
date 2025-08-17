'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Força um hard redirect após login bem-sucedido
    // Isso evita problemas de estado corrupto
    setTimeout(() => {
      window.location.href = '/parent/dashboard';
    }, 1000);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        textAlign: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
          ✅ Login realizado com sucesso!
        </h1>
        <p style={{ color: '#6b7280' }}>
          Redirecionando para o dashboard...
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '1rem auto'
        }}></div>
      </div>
    </div>
  );
}