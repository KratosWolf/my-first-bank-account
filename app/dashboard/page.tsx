'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #3b82f6',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#1e40af' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#1e40af',
            marginBottom: '0.5rem'
          }}>
            🎉 Login com Google realizado com sucesso!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Bem-vindo ao My First Bank Account
          </p>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            Informações do Usuário
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '3px solid #3b82f6'
                }}
              />
            )}
            <div>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.25rem'
              }}>
                {session.user?.name}
              </p>
              <p style={{ color: '#6b7280' }}>
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#065f46',
            marginBottom: '0.5rem',
            fontSize: '1.125rem'
          }}>
            ✅ Google OAuth Funcionando!
          </h3>
          <p style={{ color: '#047857', fontSize: '0.875rem' }}>
            Autenticação implementada com sucesso usando NextAuth v5 e Google Provider.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </div>
  );
}