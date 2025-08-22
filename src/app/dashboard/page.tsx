'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChildForm from './components/ChildForm';

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadChildren();
  }, [session, status, router]);

  const loadChildren = () => {
    if (!session?.user?.id) return;
    
    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (saved) {
        const allChildren = JSON.parse(saved);
        const userChildren = allChildren.filter((c: Child) => c.parentId === session.user.id);
        setChildren(userChildren);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    }
  };

  const handleSaveChild = async (childData: { name: string; pin: string; avatar: string }) => {
    setIsSubmitting(true);
    setFormErrors({});

    // Validações simples
    const errors: {[key: string]: string} = {};
    
    if (childData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!/^\d{4}$/.test(childData.pin)) {
      errors.pin = 'PIN deve ter exatamente 4 dígitos';
    }
    
    if (children.some(c => c.pin === childData.pin)) {
      errors.pin = 'Este PIN já está sendo usado';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const newChild: Child = {
        id: `child_${Date.now()}`,
        name: childData.name.trim(),
        pin: childData.pin,
        balance: 0,
        level: 1,
        points: 0,
        avatar: childData.avatar,
        createdAt: new Date().toISOString(),
        parentId: session?.user?.id || ''
      };
      
      // Salvar no localStorage
      const saved = localStorage.getItem('banco-familia-children');
      const allChildren = saved ? JSON.parse(saved) : [];
      allChildren.push(newChild);
      localStorage.setItem('banco-familia-children', JSON.stringify(allChildren));
      
      // Atualizar estado
      setChildren([...children, newChild]);
      setShowAddChild(false);
    } catch (error) {
      console.error('Error saving child:', error);
      setFormErrors({ general: 'Erro ao salvar criança. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">🏦 Banco da Família</h1>
                <p className="text-sm text-gray-600">Olá, {session.user?.name?.split(' ')[0]}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Crianças Cadastradas</h2>
            <button
              onClick={() => setShowAddChild(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Adicionar Criança
            </button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma criança cadastrada</h3>
              <p className="text-gray-600 mb-4">Comece adicionando a primeira criança da família</p>
              <button
                onClick={() => setShowAddChild(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Cadastrar Primeira Criança
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {children.map(child => (
                <div key={child.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{child.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">Nível {child.level} • {child.points} pontos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">R$ {child.balance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Saldo atual</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddChild && (
        <ChildForm
          onSave={handleSaveChild}
          onCancel={() => {
            setShowAddChild(false);
            setFormErrors({});
          }}
          isSubmitting={isSubmitting}
          errors={formErrors}
        />
      )}
    </div>
  );
}