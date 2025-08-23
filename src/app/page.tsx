'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChildLogin from '@/components/ChildLogin';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showChildLogin, setShowChildLogin] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      // Se está logado como pai, vai para dashboard
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (showChildLogin) {
    return <ChildLogin onBack={() => setShowChildLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏦</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Banco da Família
          </h2>
          <p className="text-gray-600 mb-8">
            Educação financeira para toda a família
          </p>
        </div>

        <div className="space-y-4">
          {/* Login para Pais */}
          <a
            href="/auth/signin"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.017 11.215c2.647 0 4.795-2.147 4.795-4.795C16.812 3.777 14.665 1.629 12.017 1.629s-4.795 2.148-4.795 4.791c0 2.648 2.147 4.795 4.795 4.795zM12.017 7.231c-0.699 0-1.266-0.567-1.266-1.266s0.567-1.266 1.266-1.266 1.266 0.567 1.266 1.266S12.716 7.231 12.017 7.231zM20.49 22.371h1.266c0-0.699-0.567-1.266-1.266-1.266H20.49zM3.527 22.371H4.793c0-0.699-0.567-1.266-1.266-1.266H3.527z"
              />
            </svg>
            Entrar como Pai/Mãe
          </a>

          {/* Login para Crianças */}
          <button
            onClick={() => setShowChildLogin(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <span className="text-xl mr-2">👶</span>
            Entrar como Criança
          </button>

          {/* Link direto para dashboard (dev) */}
          {process.env.NODE_ENV === 'development' && (
            <a
              href="/dashboard"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
            >
              [DEV] Ir direto para Dashboard
            </a>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">✅ Sistema funcionando</p>
        </div>
      </div>
    </div>
  );
}
