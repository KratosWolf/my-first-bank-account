'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="text-6xl mb-4">
              {isOnline ? '📶' : '📵'}
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {isOnline ? 'Página Não Encontrada' : 'Você está Offline'}
            </CardTitle>
            <CardDescription className="text-base">
              {isOnline 
                ? 'A página que você está procurando não pôde ser carregada.'
                : 'Parece que você perdeu a conexão com a internet. Algumas funcionalidades podem não estar disponíveis.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isOnline && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  💡 Enquanto isso, você pode:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Ver dados já carregados no app</li>
                  <li>• Navegar pelas páginas já visitadas</li>
                  <li>• Planejar suas próximas metas financeiras</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className={`w-full h-12 ${isOnline ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
                disabled={!isOnline}
              >
                {isOnline ? '🔄 Tentar Novamente' : '⏳ Aguardando Conexão...'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full h-12"
              >
                🏠 Voltar ao Início
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>My First Bank Account</strong> funciona melhor com internet, mas algumas funcionalidades estão disponíveis offline.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {isOnline ? 'Conectado' : 'Desconectado'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Install Tip */}
        <Card className="mt-4 bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-purple-900 mb-2">
                Dica: Instale o App!
              </h3>
              <p className="text-sm text-purple-700">
                Adicione o Banco Infantil à sua tela inicial para ter acesso mais rápido e uma experiência similar a um app nativo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}