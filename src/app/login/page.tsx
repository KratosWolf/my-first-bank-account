'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/AuthContext';
import { PiggyBank, Shield, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const { signInWithGoogle, user } = useAuthContext();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Login realizado com sucesso! 🎉');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement PIN validation
    toast.success('PIN correto! 🎉');
    router.push('/dashboard');
  };

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
            >
              <PiggyBank className="w-10 h-10 text-white" />
            </motion.div>

            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Meu Primeiro Banco
            </CardTitle>

            <CardDescription className="text-lg text-gray-600">
              Aprenda a gerenciar seu dinheiro de forma divertida e segura! 🏦✨
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="w-4 h-4" />
                <span>Seguro</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Users className="w-4 h-4" />
                <span>Familiar</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>Divertido</span>
              </div>
              <div className="flex items-center space-x-2 text-pink-600">
                <PiggyBank className="w-4 h-4" />
                <span>Educativo</span>
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Entrar com Google
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPinInput(true)}
                variant="outline"
                className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-xl"
              >
                Entrar com PIN
              </Button>
            </div>

            {/* PIN Input */}
            {showPinInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handlePinSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="pin"
                    className="text-sm font-medium text-gray-700"
                  >
                    Digite seu PIN de 4 dígitos
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="text-center text-2xl font-mono tracking-widest"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </motion.form>
            )}

            {/* Info */}
            <div className="text-center text-xs text-gray-500 space-y-2">
              <p>🔒 Seus dados estão seguros</p>
              <p>👨‍👩‍👧‍👦 Aprovado pelos pais</p>
              <p>🎮 Aprenda brincando</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
