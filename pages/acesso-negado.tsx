import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AcessoNegado() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário tiver sessão válida (com role), redirecionar
    const user = session?.user as any;
    if (user?.role === 'parent') {
      router.push('/dashboard');
    } else if (user?.role === 'child') {
      router.push(`/demo-child-view?childId=${user.childId}`);
    }
  }, [session, router]);

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true,
      });
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Fallback: force redirect manually
      window.location.href = '/auth/signin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        {/* Ícone de erro */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          🚫 Acesso Não Autorizado
        </h1>

        {/* Mensagem */}
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Seu email <strong>{session?.user?.email}</strong> não está
            cadastrado nesta família.
          </p>
          <p className="text-sm text-gray-600">
            Entre em contato com o responsável pela família para solicitar
            acesso.
          </p>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            💡 Para obter acesso:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Peça ao responsável da família para adicionar seu email</li>
            <li>2. Verifique se está usando o email correto</li>
            <li>3. Entre novamente após ser adicionado</li>
          </ul>
        </div>

        {/* Botão de logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Sair e Tentar Outro Email
        </button>

        {/* Link para suporte */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Precisa de ajuda?{' '}
            <a
              href="mailto:suporte@myfirstbankaccount.com"
              className="text-blue-600 hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
