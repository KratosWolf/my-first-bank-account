import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      console.log('⛔ Usuário não autenticado, redirecionando para login...');
      router.push('/auth/signin');
      return;
    }

    // If authenticated, redirect based on role
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;

      // Check for unauthorized access
      if (user.role === 'unauthorized' || user.role === 'error') {
        console.log('⛔ Acesso não autorizado, redirecionando...');
        router.push('/acesso-negado');
        return;
      }

      // Redirect based on role
      if (user.role === 'parent') {
        console.log('👨‍👩‍👧 Redirecionando pai/mãe para dashboard...');
        router.push('/dashboard');
      } else if (user.role === 'child' && user.childId) {
        console.log('👦 Redirecionando criança para perfil...');
        router.push(`/demo-child-view?childId=${user.childId}`);
      } else {
        // Fallback: if has session but no role, redirect to dashboard
        console.log('🔄 Fallback: redirecionando para dashboard...');
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-600">Carregando...</p>
      </div>
    </div>
  );
}
