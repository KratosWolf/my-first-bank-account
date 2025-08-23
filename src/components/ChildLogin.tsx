'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChildrenStorage } from '@/lib/storage/children';

interface Child {
  id: string;
  name: string;
  pin: string;
  balance: number;
  level: number;
  points: number;
  avatar: string;
  createdAt: string;
  parentId: string;
}

interface ChildLoginProps {
  onBack: () => void;
}

export default function ChildLogin({ onBack }: ChildLoginProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = () => {
    try {
      // Load all children from localStorage (in real app, would filter by family)
      const saved = localStorage.getItem('banco-familia-children');
      if (saved) {
        const allChildren = JSON.parse(saved);
        setChildren(allChildren);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  const handleLogin = async () => {
    if (!selectedChild) return;
    if (pin.length !== 4) {
      setError('Digite um PIN de 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (pin === selectedChild.pin) {
        // Store child session
        sessionStorage.setItem(
          'childSession',
          JSON.stringify({
            id: selectedChild.id,
            name: selectedChild.name,
            avatar: selectedChild.avatar,
            loginTime: Date.now(),
          })
        );

        // Redirect to child dashboard
        router.push(`/child/${selectedChild.id}`);
      } else {
        setError('PIN incorreto. Tente novamente!');
        setPin('');
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handlePinClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              👶 Login Criança
            </h1>
            <p className="text-sm text-gray-600">
              Escolha seu perfil e digite seu PIN
            </p>
          </div>
        </div>

        {!selectedChild ? (
          // Child Selection
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quem é você?
            </h3>

            {children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Nenhuma criança cadastrada ainda
                </p>
                <p className="text-sm text-gray-400">
                  Peça para seus pais cadastrarem você primeiro!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <span className="text-3xl mr-4">{child.avatar}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {child.name}
                      </div>
                      <div className="text-sm text-green-600">
                        Saldo: R$ {child.balance.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Level {child.level} • {child.points} pontos
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // PIN Entry
          <div>
            {/* Selected Child */}
            <div className="text-center mb-6">
              <span className="text-6xl">{selectedChild.avatar}</span>
              <h3 className="text-xl font-semibold text-gray-900 mt-2">
                Olá, {selectedChild.name}!
              </h3>
              <p className="text-gray-600">Digite seu PIN de 4 dígitos</p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-3">
                {[0, 1, 2, 3].map(index => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold ${
                      pin.length > index
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {pin.length > index ? '●' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm text-center mb-4 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  disabled={pin.length >= 4 || loading}
                  className="h-14 text-xl font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handlePinClear}
                disabled={loading}
                className="h-14 text-sm font-semibold bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-red-700"
              >
                Limpar
              </button>
              <button
                onClick={() => handlePinInput('0')}
                disabled={pin.length >= 4 || loading}
                className="h-14 text-xl font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={pin.length === 0 || loading}
                className="h-14 text-sm font-semibold bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-yellow-700"
              >
                ⌫
              </button>
            </div>

            {/* Login Button */}
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedChild(null)}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleLogin}
                disabled={pin.length !== 4 || loading}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
