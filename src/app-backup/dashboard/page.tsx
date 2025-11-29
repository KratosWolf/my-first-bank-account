'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChildForm from './components/ChildForm';
import TransactionModal from './components/TransactionModal';
import { FamilyService } from '@/lib/services/family-service';
import type { Child } from '@/lib/supabase';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadChildren();
  }, [session, status, router]);

  const loadChildren = async () => {
    if (!session?.user?.id) return;

    try {
      const children = await FamilyService.getChildren();
      setChildren(children);
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    }
  };

  const handleSaveChild = async (childData: {
    name: string;
    pin: string;
    avatar: string;
  }) => {
    setIsSubmitting(true);
    setFormErrors({});

    // Validações simples
    const errors: { [key: string]: string } = {};

    if (childData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!/^\d{4}$/.test(childData.pin)) {
      errors.pin = 'PIN deve ter exatamente 4 dígitos';
    }

    // Verificar PIN único
    const isPinUnique = await FamilyService.isPinUnique(
      childData.pin,
      editingChild?.id
    );
    if (!isPinUnique) {
      errors.pin = 'Este PIN já está sendo usado';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingChild) {
        // Editando criança existente
        const result = await FamilyService.updateChild(editingChild.id, {
          name: childData.name.trim(),
          pin: childData.pin,
          avatar: childData.avatar,
        });

        if (!result) {
          throw new Error('Failed to update child');
        }
      } else {
        // Adicionando nova criança
        const result = await FamilyService.createChild({
          name: childData.name.trim(),
          pin: childData.pin,
          avatar: childData.avatar,
          familyId: session?.user?.id || 'temp-family-id',
        });

        if (!result) {
          throw new Error('Failed to create child');
        }
      }

      await loadChildren();
      setShowAddChild(false);
      setEditingChild(null);
    } catch (error) {
      console.error('Error saving child:', error);
      setFormErrors({ general: 'Erro ao salvar criança. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setShowAddChild(true);
  };

  const handleDeleteChild = async (childId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir esta criança? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    try {
      const success = await FamilyService.deleteChild(childId);
      if (success) {
        await loadChildren();
      } else {
        throw new Error('Failed to delete child');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Erro ao excluir criança. Tente novamente.');
    }
  };

  const handleQuickTransaction = async (child: Child, amount: number) => {
    try {
      const success = await FamilyService.updateChildBalance(child.id, amount);
      if (success) {
        await loadChildren();
      } else {
        throw new Error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Erro ao atualizar saldo. Tente novamente.');
    }
  };

  const openTransactionModal = (child: Child) => {
    setSelectedChild(child);
    setShowTransactionModal(true);
  };

  const handleTransaction = (
    amount: number,
    category: string,
    description: string
  ) => {
    if (!selectedChild) return;

    try {
      const saved = localStorage.getItem('banco-familia-children');
      if (saved) {
        const allChildren = JSON.parse(saved);
        const index = allChildren.findIndex(
          (c: Child) => c.id === selectedChild.id
        );
        if (index >= 0) {
          allChildren[index].balance = Math.max(
            0,
            allChildren[index].balance + amount
          );
          localStorage.setItem(
            'banco-familia-children',
            JSON.stringify(allChildren)
          );

          // TODO: Salvar histórico de transações
          const transaction = {
            id: `tx_${Date.now()}`,
            childId: selectedChild.id,
            amount,
            category,
            description,
            timestamp: new Date().toISOString(),
          };

          loadChildren();
          setShowTransactionModal(false);
          setSelectedChild(null);
        }
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Erro ao processar transação. Tente novamente.');
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
                <h1 className="text-xl font-bold text-gray-900">
                  🏦 Banco da Família
                </h1>
                <p className="text-sm text-gray-600">
                  Olá, {session.user?.name?.split(' ')[0]}
                </p>
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
            <h2 className="text-2xl font-bold text-gray-900">
              Crianças Cadastradas
            </h2>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma criança cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece adicionando a primeira criança da família
              </p>
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
                <div
                  key={child.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{child.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Nível {child.level} • {child.xp} XP
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditChild(child)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {child.balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">Saldo atual</p>
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleQuickTransaction(child, 10)}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        title="Adicionar R$10"
                      >
                        +R$10
                      </button>
                      <button
                        onClick={() => handleQuickTransaction(child, -5)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        title="Remover R$5"
                      >
                        -R$5
                      </button>
                      <button
                        onClick={() => openTransactionModal(child)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Valor personalizado"
                      >
                        💰
                      </button>
                    </div>
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
            setEditingChild(null);
            setFormErrors({});
          }}
          editingChild={editingChild}
          isSubmitting={isSubmitting}
          errors={formErrors}
        />
      )}

      {/* Modal de Transação */}
      {showTransactionModal && selectedChild && (
        <TransactionModal
          child={selectedChild}
          onSave={handleTransaction}
          onCancel={() => {
            setShowTransactionModal(false);
            setSelectedChild(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
