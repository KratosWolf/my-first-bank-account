import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 Index - Status:', status, 'Session:', session);

    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      console.log('⛔ Usuário não autenticado, redirecionando para login...');
      router.push('/auth/signin');
      return;
    }

    // If authenticated, redirect based on role
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;

      console.log('🔍 Index - User Data:', {
        email: user.email,
        name: user.name,
        role: user.role,
        childId: user.childId,
      });

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
        console.log(
          `👦 Redirecionando criança para perfil: /demo-child-view?childId=${user.childId}`
        );
        router.push(`/demo-child-view?childId=${user.childId}`);
      } else {
        // Fallback: if has session but no role, redirect to dashboard
        console.log('🔄 Fallback: redirecionando para dashboard...', {
          hasRole: !!user.role,
          hasChildId: !!user.childId,
        });
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] to-[#1A4731] flex items-center justify-center">
      <div className="bg-[#1A4731CC] rounded-2xl shadow-2xl p-8 text-center border-2 border-primary/30">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-white">Carregando...</p>
      </div>
    </div>
  );
}
