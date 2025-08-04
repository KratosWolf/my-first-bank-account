'use client';

import { useAuthContext } from '@/contexts/AuthContext';
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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso! 👋');
      router.push('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout.');
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Meu Primeiro Banco
              </h1>
              <p className="text-gray-600">Olá, {user.name}! 👋</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
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
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo ao seu banco! 🏦
                  </h2>
                  <p className="text-purple-100">
                    Aqui você pode aprender sobre dinheiro de forma divertida e
                    segura!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">R$ 0,00</div>
                  <div className="text-purple-100">Saldo atual</div>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Minha Conta</CardTitle>
                <CardDescription>
                  Veja seu saldo e histórico de transações
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Pedidos</CardTitle>
                <CardDescription>Peça dinheiro aos seus pais</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Família</CardTitle>
                <CardDescription>Gerencie contas da família</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Conquistas</CardTitle>
                <CardDescription>Ganhe badges e prêmios</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Aprender</CardTitle>
                <CardDescription>Dicas sobre dinheiro</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Configurações</CardTitle>
                <CardDescription>Personalize sua experiência</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full" disabled>
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
          <p className="text-sm">
            🚧 Funcionalidades em desenvolvimento. Configure o Firebase para
            funcionalidades completas!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
