import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;

      // Verificar se o usuário tem role definido na sessão
      if (user.role === 'unauthorized' || user.role === 'error') {
        console.log('⛔ Acesso não autorizado, redirecionando...');
        setIsRedirecting(true);
        router.push('/acesso-negado');
        return;
      }

      // Redirecionar baseado no role
      if (user.role === 'parent') {
        console.log('👨‍👩‍👧 Redirecionando pai/mãe para dashboard...');
        setIsRedirecting(true);
        router.push('/dashboard');
      } else if (user.role === 'child' && user.childId) {
        console.log('👦 Redirecionando criança para perfil...');
        setIsRedirecting(true);
        router.push(`/demo-child-view?childId=${user.childId}`);
      } else if (session) {
        // Fallback: se tem sessão mas não tem role, redirecionar para dashboard
        console.log('🔄 Fallback: redirecionando para dashboard...');
        setIsRedirecting(true);
        router.push('/dashboard');
      }
    }
  }, [session, router]);

  // Loading state
  if (status === 'loading' || isRedirecting) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full">
          <CardBody>
            <div className="text-center">
              {/* Spinner */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
                <svg
                  className="animate-spin h-16 w-16 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>

              <p className="text-lg font-semibold text-text-primary mb-1">
                {isRedirecting ? 'Redirecionando...' : 'Carregando...'}
              </p>
              <p className="text-sm text-text-secondary">Aguarde um momento</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center py-8 md:py-12 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary opacity-5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card variant="elevated" padding="lg" className="backdrop-blur-sm">
          <CardBody>
            {/* Logo/Mascote */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-primary to-primary-light rounded-3xl p-4 mb-4 shadow-lg">
                <span className="text-6xl">🏦</span>
              </div>

              <h1 className="text-3xl font-bold text-text-primary mb-2">
                My First Bank Account
              </h1>

              <p className="text-text-secondary text-base">
                Aprenda sobre dinheiro de forma divertida
              </p>
            </div>

            {/* Features badges */}
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              <Badge variant="success" size="sm">
                ✅ Educativo
              </Badge>
              <Badge variant="primary" size="sm">
                🎮 Gamificado
              </Badge>
              <Badge variant="info" size="sm">
                👨‍👩‍👧 Família
              </Badge>
            </div>

            {/* Login section */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary mb-4">
                  Login Seguro para a Família
                </p>
              </div>

              {/* Google OAuth Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => signIn('google')}
                  className="
                    w-full max-w-sm bg-white hover:bg-gray-50
                    text-gray-700 font-semibold
                    py-4 px-6 rounded-xl
                    flex items-center justify-center gap-3
                    transition-all duration-200
                    shadow-lg hover:shadow-xl
                    border-2 border-gray-100
                    group
                  "
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Entrar com Google
                  </span>
                </button>
              </div>

              {/* Alternative: Login com email (comentado, pode ser usado no futuro) */}
              {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-bg-secondary text-text-secondary">
                    ou
                  </span>
                </div>
              </div>

              <Button variant="secondary" fullWidth size="lg">
                Login com Email
              </Button> */}
            </div>

            {/* Security note */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-text-secondary flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Conexão segura com Google OAuth
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Primeira vez aqui?{' '}
            <span className="text-primary font-semibold">
              Faça login para começar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
