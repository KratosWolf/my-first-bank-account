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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-green-300 to-blue-400 rounded-full opacity-30"
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm relative overflow-hidden">
            {/* Card Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full -translate-y-16 translate-x-16 opacity-30" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full translate-y-12 -translate-x-12 opacity-30" />
            
            <div className="relative z-10">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <PiggyBank className="w-12 h-12 text-white" />
                </motion.div>
                
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Meu Primeiro Banco
                </CardTitle>
                
                <CardDescription className="text-lg text-gray-600">
                  Aprenda a gerenciar seu dinheiro de forma divertida e segura! 🏦✨
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features with Icons */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded-lg"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Seguro</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-2 rounded-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Familiar</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center space-x-2 text-purple-600 bg-purple-50 p-2 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Divertido</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center space-x-2 text-pink-600 bg-pink-50 p-2 rounded-lg"
                  >
                    <PiggyBank className="w-4 h-4" />
                    <span className="font-medium">Educativo</span>
                  </motion.div>
                </div>

                {/* Login Options */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Entrar com Google
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">ou</span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      onClick={() => setShowPinInput(true)}
                      variant="outline"
                      className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold py-4 rounded-xl"
                    >
                      Entrar com PIN
                    </Button>
                  </motion.div>
                </div>

                {/* PIN Input */}
                {showPinInput && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
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

                {/* Info with Icons */}
                <div className="text-center text-xs text-gray-500 space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-3 h-3" />
                    <p>Seus dados estão seguros</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-3 h-3" />
                    <p>Aprovado pelos pais</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-3 h-3" />
                    <p>Aprenda brincando</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
