'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('parent@example.com');

  const handleParentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        router.push('/parent/dashboard');
      } else {
        const { error } = await response.json();
        setError(error || 'Erro ao fazer login. Tente novamente.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🏦 My First Bank Account</h1>
        <p className={styles.subtitle}>
          Aprenda sobre dinheiro de forma divertida
        </p>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleParentSignIn}>
          <div>
            <label className={styles.label}>Para os Pais</label>
            <input
              type="email"
              placeholder="Email (demo: parent@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Entrando...' : '🔐 Entrar como Pai/Mãe'}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>ou</span>
        </div>

        <button
          type="button"
          className={styles.button}
          style={{ background: '#4285f4', color: 'white', border: 'none', marginBottom: '1rem' }}
          onClick={() => {
            window.location.href = '/api/auth/signin/google';
          }}
        >
          🔐 Entrar com Google
        </button>

        <button
          type="button"
          className={`${styles.button} ${styles.buttonOutline}`}
          style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db' }}
          onClick={() => {
            // Para crianças - PIN 1234
            fetch('/api/auth/child', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pin: '1234' }),
            }).then(response => {
              if (response.ok) {
                response.json().then(data => {
                  router.push(`/child/${data.user.id}/dashboard`);
                });
              }
            });
          }}
        >
          👦 Entrar como Criança (PIN: 1234)
        </button>
        
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p><strong>Demo Credentials:</strong></p>
          <p>Pais: parent@example.com</p>
          <p>Crianças: PIN 1234</p>
        </div>
      </div>
    </div>
  );
}