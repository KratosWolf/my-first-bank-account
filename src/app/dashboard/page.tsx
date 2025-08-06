'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PiggyBank,
  Coins,
  TrendingUp,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso! 👋');
      router.push('/login');
    } catch {
      toast.error('Erro ao fazer logout.');
    }
  };

  if (!user) {
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

      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Meu Primeiro Banco
                </h1>
                <p className="text-gray-600 text-lg">Olá, {user.name}! 👋</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
              
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-3">
                      Bem-vindo ao seu banco! 🏦
                    </h2>
                    <p className="text-purple-100 text-lg">
                      Aqui você pode aprender sobre dinheiro de forma divertida e
                      segura!
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">R$ 0,00</div>
                    <div className="text-purple-100 text-lg">Saldo atual</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Conta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Coins className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Minha Conta</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Veja seu saldo e histórico de transações
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pedidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Pedidos</CardTitle>
                  <CardDescription className="text-gray-600 text-base">Peça dinheiro aos seus pais</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Família */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-400 via-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Família</CardTitle>
                  <CardDescription className="text-gray-600 text-base">Gerencie contas da família</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Conquistas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <PiggyBank className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Conquistas</CardTitle>
                  <CardDescription className="text-gray-600 text-base">Ganhe badges e prêmios</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Aprender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Aprender</CardTitle>
                  <CardDescription className="text-gray-600 text-base">Dicas sobre dinheiro</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Configurações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Settings className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Configurações</CardTitle>
                  <CardDescription className="text-gray-600 text-base">Personalize sua experiência</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 rounded-xl" disabled>
                    Em breve! 🚧
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-gray-600"
          >
            <p className="text-base">
              🚧 Funcionalidades em desenvolvimento. Configure o Firebase para
              funcionalidades completas!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
