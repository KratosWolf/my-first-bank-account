import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChildrenService } from '../src/lib/services/childrenService';
import type { Child } from '../src/lib/supabase';
import { calculateAge } from '../src/lib/utils/date';

export default function ChildLoginPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load children from Supabase/localStorage (synchronized with dashboard data)
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const childrenData = await ChildrenService.getChildren();
      setChildren(childrenData);
      console.log('👶 Child Login: Crianças carregadas:', childrenData);
    } catch (error) {
      console.error('❌ Erro ao carregar crianças:', error);
      // Fallback to mock data
      setChildren(getMockChildren());
    }
  };

  const getMockChildren = (): Child[] => [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Rafael Silva',
      avatar: '👦',
      birthDate: '2012-05-15',
      age: 12,
      pin: '1234',
      balance: 150.50,
      level: 3,
      xp: 250
    },
    {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
      name: 'Ana Oliveira',
      avatar: '👧',
      birthDate: '2014-08-22',
      age: 9,
      pin: '5678',
      balance: 89.30,
      level: 2,
      xp: 180
    }
  ];

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setPin('');
    setError('');
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    setError('');
  };

  const handleLogin = async () => {
    if (!selectedChild || pin.length !== 4) {
      setError('Digite um PIN de 4 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (pin === selectedChild.pin) {
        // Store authenticated child in sessionStorage
        sessionStorage.setItem('authenticatedChild', JSON.stringify(selectedChild));
        
        // Redirect to child dashboard
        router.push('/demo-child-view');
      } else {
        setError('PIN incorreto! Tente novamente.');
        setPin('');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    setSelectedChild(null);
    setPin('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleLogin();
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
          <p className="text-gray-600">
            {selectedChild ? 'Digite sua senha' : 'Escolha seu perfil'}
          </p>
        </div>

        {!selectedChild ? (
          /* Child Selection */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
              👶 Qual é você?
            </h2>
            
            {children.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">😴</div>
                <p className="text-gray-600">Nenhuma criança cadastrada ainda!</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Ir para Dashboard Parental
                </button>
              </div>
            ) : (
              children.map(child => (
                <button
                  key={child.id}
                  onClick={() => handleChildSelect(child)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-4"
                >
                  <span className="text-3xl">{child.avatar}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">{child.name}</p>
                    <p className="text-sm text-gray-600">
                      {child.birth_date ? `${calculateAge(child.birth_date)} anos` : 'Idade não definida'} • Nível {child.level}
                    </p>
                  </div>
                  <span className="text-2xl text-gray-400">→</span>
                </button>
              ))
            )}
            
            {/* Back to Home */}
            <button
              onClick={() => router.push('/')}
              className="w-full mt-6 p-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Voltar ao Início
            </button>
          </div>
        ) : (
          /* PIN Entry */
          <div className="space-y-6">
            {/* Selected Child Info */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="text-4xl mb-2">{selectedChild.avatar}</div>
              <p className="font-semibold text-gray-800">{selectedChild.name}</p>
              <p className="text-sm text-gray-600">
                {selectedChild.birth_date ? `${calculateAge(selectedChild.birth_date)} anos` : 'Idade não definida'} • Nível {selectedChild.level}
              </p>
            </div>

            {/* PIN Input */}
            <div className="space-y-4">
              <label className="block text-center text-gray-700 font-medium">
                Digite sua senha de 4 números:
              </label>
              
              <div className="flex justify-center">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-32 h-16 text-3xl text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
              </div>

              {/* PIN Dots Indicator */}
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      pin.length >= i ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-center text-sm">❌ {error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleLogin}
                  disabled={pin.length !== 4 || isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⏳</span>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar 🚀'
                  )}
                </button>
              </div>

              {/* Hint for development */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-xs text-center">
                  💡 Dica: PIN do {selectedChild.name} é {selectedChild.pin}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}