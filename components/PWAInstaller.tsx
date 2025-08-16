'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    if (isInStandaloneMode || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show immediately, wait for user to be engaged
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS install instructions if on iOS and not installed
    if (iOS && !isIOSStandalone && !localStorage.getItem('ios-install-dismissed')) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 15000); // Show after 15 seconds on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    } else {
      console.log('User dismissed PWA install');
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    if (isIOS) {
      localStorage.setItem('ios-install-dismissed', 'true');
    } else {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't show anything if app is installed or user doesn't want to see it
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-blue-200 bg-blue-50/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Instalar Banco Kids
                </h3>
                <p className="text-sm text-blue-700">
                  {isIOS 
                    ? 'Adicione à sua tela inicial para uma melhor experiência'
                    : 'Instale o app para acesso rápido e funcionalidades offline'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">Como instalar:</p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Toque no botão <span className="font-mono bg-blue-100 px-1 rounded">⤴️</span> no Safari</li>
                  <li>2. Selecione "Adicionar à Tela Inicial"</li>
                  <li>3. Toque em "Adicionar"</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Agora não
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                📥 Instalar App
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Depois
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 mt-3 text-xs text-blue-600">
            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
            <span>Funciona offline</span>
            <span className="mx-2">•</span>
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            <span>Notificações</span>
            <span className="mx-2">•</span>
            <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
            <span>Acesso rápido</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}