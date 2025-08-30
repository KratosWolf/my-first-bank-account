import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'parent' | 'child'>('parent');
  const [parentCredentials, setParentCredentials] = useState({
    email: '',
    password: '',
  });
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childPin, setChildPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar lista de crianças
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, avatar')
        .order('name');

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Erro ao carregar crianças:', error);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Por enquanto, vamos usar credenciais hardcoded para você e sua esposa
      const validCredentials = [
        {
          email: 'tifernandes@gmail.com',
          password: 'tiago1211',
          name: 'Tiago',
        },
        { email: 'esposa@familia.com', password: 'familia123', name: 'Esposa' },
      ];

      const validUser = validCredentials.find(
        cred =>
          cred.email === parentCredentials.email &&
          cred.password === parentCredentials.password
      );

      if (!validUser) {
        setError('Email ou senha incorretos');
        setLoading(false);
        return;
      }

      // Salvar dados do pai no localStorage
      localStorage.setItem(
        'parent-session',
        JSON.stringify({
          id: validUser.email,
          name: validUser.name,
          email: validUser.email,
          loginTime: new Date().toISOString(),
        })
      );

      // Redirecionar para dashboard dos pais
      router.push('/demo-parent-view');
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedChildId) {
        setError('Selecione uma criança');
        setLoading(false);
        return;
      }

      // Buscar a criança no banco
      const { data: child, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', selectedChildId)
        .single();

      if (error || !child) {
        setError('Criança não encontrada');
        setLoading(false);
        return;
      }

      // Verificar PIN
      if (child.pin !== childPin) {
        setError('PIN incorreto');
        setLoading(false);
        return;
      }

      // Salvar dados da criança no localStorage
      localStorage.setItem(
        'child-session',
        JSON.stringify({
          ...child,
          loginTime: new Date().toISOString(),
        })
      );

      // Redirecionar para dashboard da criança
      router.push('/demo-child-view');
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            🏦
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Banco da Família
          </h1>
          <p className="text-gray-600">Sistema de Educação Financeira</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'parent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👨‍👩‍👧‍👦 Pais
          </button>
          <button
            onClick={() => setActiveTab('child')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'child'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👶 Crianças
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Parent Login Form */}
        {activeTab === 'parent' && (
          <form onSubmit={handleParentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={parentCredentials.email}
                onChange={e =>
                  setParentCredentials(prev => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={parentCredentials.password}
                onChange={e =>
                  setParentCredentials(prev => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sua senha"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar como Pai/Mãe'}
            </button>

            {/* Credenciais de teste */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <p className="font-medium mb-1">Credenciais de teste:</p>
              <p>• tifernandes@gmail.com / tiago1211</p>
              <p>• esposa@familia.com / familia123</p>
            </div>
          </form>
        )}

        {/* Child Login Form */}
        {activeTab === 'child' && (
          <form onSubmit={handleChildLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione seu nome
              </label>
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Escolha seu nome...</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.avatar} {child.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN (4 números)
              </label>
              <input
                type="password"
                value={childPin}
                onChange={e =>
                  setChildPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg tracking-widest"
                placeholder="••••"
                maxLength={4}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !selectedChildId || childPin.length !== 4}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {children.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-4">
                <p>Nenhuma criança cadastrada ainda.</p>
                <p>Peça para seus pais criarem seu perfil!</p>
              </div>
            )}
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Sistema educativo • Transações simuladas</p>
        </div>
      </div>
    </div>
  );
}
