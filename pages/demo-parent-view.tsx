'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/services/database';
import { ParentalDashboardService } from '@/lib/services/parental-dashboard';
import type { Family, Child, PurchaseRequest } from '@/lib/supabase';

// Helper function to get birth date from localStorage
const getBirthDateFromStorage = (childId: string): string | null => {
  const childBirthDates = JSON.parse(
    localStorage.getItem('child-birth-dates') || '{}'
  );
  console.log('🔍 Buscando data de nascimento para criança:', childId);
  console.log('📅 Dados salvos no localStorage:', childBirthDates);
  const birthDate = childBirthDates[childId] || null;
  console.log('🎂 Data encontrada:', birthDate);
  return birthDate;
};

// Helper function to format date without timezone issues
const formatBirthDate = (dateString: string): string => {
  // Split the date string (YYYY-MM-DD format)
  const [year, month, day] = dateString.split('-');
  // Create date directly with local timezone
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  console.log(
    '🎯 Formatando data:',
    dateString,
    '→',
    date.toLocaleDateString('pt-BR')
  );
  return date.toLocaleDateString('pt-BR');
};

// Helper function to calculate age
const calculateAge = (childId: string, createdAt: string): number => {
  const birthDate = getBirthDateFromStorage(childId);

  if (birthDate) {
    // Calculate real age from birth date
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return Math.max(0, age);
  }

  // Fallback: simulate age based on creation date
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 365 * 2) return 12;
  if (diffDays > 365) return 10;
  if (diffDays > 180) return 8;
  return 7;
};

// Componente para configuração de mesada de uma criança
const AllowanceChildConfig = ({
  child,
  config,
  onUpdate,
}: {
  child: any;
  config: any;
  onUpdate: (updates: any) => void;
}) => {
  const [localFrequency, setLocalFrequency] = useState(config.frequency);
  const [localAmount, setLocalAmount] = useState(config.amount);
  const [localDayOfWeek, setLocalDayOfWeek] = useState(config.day_of_week || 1);
  const [localDayOfMonth, setLocalDayOfMonth] = useState(
    config.day_of_month || 1
  );
  const [localIsActive, setLocalIsActive] = useState(config.is_active);

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-3xl">{child.avatar}</div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
          <p className="text-gray-600">
            {calculateAge(child.id, child.created_at)} anos
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Valor da Mesada (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={localAmount}
            className="w-full p-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
            onChange={e => {
              const newAmount = parseFloat(e.target.value) || 0;
              setLocalAmount(newAmount);
              onUpdate({ amount: newAmount });
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Frequência
          </label>
          <select
            value={localFrequency}
            className="w-full p-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
            onChange={e => {
              const frequency = e.target.value as
                | 'daily'
                | 'weekly'
                | 'monthly';
              setLocalFrequency(frequency);
              onUpdate({ frequency });
            }}
          >
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>

        {localFrequency === 'weekly' && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Dia da Semana
            </label>
            <select
              value={localDayOfWeek}
              className="w-full p-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              onChange={e => {
                const day_of_week = parseInt(e.target.value);
                setLocalDayOfWeek(day_of_week);
                onUpdate({ day_of_week });
              }}
            >
              <option value={1}>Segunda-feira</option>
              <option value={2}>Terça-feira</option>
              <option value={3}>Quarta-feira</option>
              <option value={4}>Quinta-feira</option>
              <option value={5}>Sexta-feira</option>
              <option value={6}>Sábado</option>
              <option value={0}>Domingo</option>
            </select>
          </div>
        )}

        {localFrequency === 'monthly' && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Dia do Mês
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={localDayOfMonth}
              className="w-full p-3 border-2 border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              onChange={e => {
                const day_of_month = parseInt(e.target.value);
                setLocalDayOfMonth(day_of_month);
                onUpdate({ day_of_month });
              }}
            />
          </div>
        )}

        <div className="col-span-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`active-${child.id}`}
              checked={localIsActive}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              onChange={e => {
                const is_active = e.target.checked;
                setLocalIsActive(is_active);
                onUpdate({ is_active });
              }}
            />
            <label
              htmlFor={`active-${child.id}`}
              className="text-sm font-bold text-gray-900"
            >
              Mesada ativa
            </label>
          </div>
        </div>
      </div>

      {localIsActive && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-800 mb-2">
            💰 Resumo da Mesada:
          </h4>
          <p className="text-sm font-medium text-green-700">
            <strong>{child.name}</strong> receberá
            <strong> R$ {localAmount.toFixed(2)}</strong>{' '}
            {localFrequency === 'daily'
              ? 'por dia'
              : localFrequency === 'weekly'
                ? 'por semana'
                : 'por mês'}
            .
            {localFrequency === 'weekly' && (
              <span>
                {' '}
                Toda{' '}
                {
                  [
                    'domingo',
                    'segunda',
                    'terça',
                    'quarta',
                    'quinta',
                    'sexta',
                    'sábado',
                  ][localDayOfWeek]
                }
                .
              </span>
            )}
            {localFrequency === 'monthly' && (
              <span> Todo dia {localDayOfMonth} do mês.</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para configuração de juros de uma criança
const InterestChildConfig = ({
  child,
  config,
  onUpdate,
}: {
  child: any;
  config: any;
  onUpdate: (updates: any) => void;
}) => {
  const [localRate, setLocalRate] = useState(
    (config.monthly_rate * 100).toFixed(1)
  );
  const [localMinBalance, setLocalMinBalance] = useState(
    config.minimum_balance.toFixed(0)
  );
  const [localIsActive, setLocalIsActive] = useState(config.is_active);

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="text-4xl">{child.avatar || '👧'}</div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{child.name}</h3>
          <p className="text-gray-600 font-medium">
            Saldo atual:{' '}
            <span className="text-green-600 font-bold">
              R$ {(child.balance || 0).toFixed(2)}
            </span>{' '}
            • Status:{' '}
            {localIsActive ? (
              <span className="text-green-600 font-bold">✅ Ativo</span>
            ) : (
              <span className="text-red-600 font-bold">❌ Desativado</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Taxa mensal */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            📈 Taxa Mensal
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={localRate}
              className="flex-1 border-2 border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              onChange={e => {
                const newRate = e.target.value;
                setLocalRate(newRate);
                const rate = parseFloat(newRate) / 100;
                onUpdate({ monthly_rate: rate });
              }}
            />
            <span className="text-gray-900 font-bold">%</span>
          </div>
          <p className="text-xs font-bold text-gray-800 mt-1">
            Atual: {localRate}% ao mês
          </p>
        </div>

        {/* Saldo mínimo */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            💰 Saldo Mínimo
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 font-bold">R$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={localMinBalance}
              className="flex-1 border-2 border-gray-500 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              onChange={e => {
                const newMin = e.target.value;
                setLocalMinBalance(newMin);
                const minBalance = parseFloat(newMin);
                onUpdate({ minimum_balance: minBalance });
              }}
            />
          </div>
          <p className="text-xs font-bold text-gray-800 mt-1">
            Mínimo para ganhar juros
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            🎯 Status dos Juros
          </label>
          <div className="flex items-center space-x-3 h-12">
            <input
              type="checkbox"
              id={`interest-active-${child.id}`}
              checked={localIsActive}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              onChange={e => {
                const is_active = e.target.checked;
                setLocalIsActive(is_active);
                onUpdate({ is_active });
              }}
            />
            <label
              htmlFor={`interest-active-${child.id}`}
              className="text-sm font-bold text-gray-900"
            >
              Juros ativos
            </label>
          </div>
        </div>
      </div>

      {/* Resumo e previsões */}
      {localIsActive && (
        <div className="mt-6 space-y-3">
          {(child.balance || 0) >= parseFloat(localMinBalance) && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-2">
                💚 Rendimento Mensal:
              </h4>
              <p className="text-sm font-bold text-green-800">
                <strong>{child.name}</strong> ganhará aproximadamente
                <strong className="text-lg">
                  {' '}
                  R${' '}
                  {(
                    ((child.balance || 0) * parseFloat(localRate)) /
                    100
                  ).toFixed(2)}
                </strong>{' '}
                por mês (considerando a regra dos 30 dias).
              </p>
            </div>
          )}

          {localIsActive &&
            (child.balance || 0) < parseFloat(localMinBalance) && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2">
                  ⚠️ Saldo insuficiente:
                </h4>
                <p className="text-sm font-bold text-yellow-800">
                  <strong>{child.name}</strong> precisa de mais
                  <strong>
                    {' '}
                    R${' '}
                    {(
                      parseFloat(localMinBalance) - (child.balance || 0)
                    ).toFixed(2)}
                  </strong>
                  para começar a ganhar juros.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default function ParentView() {
  const router = useRouter();

  // Verificar sessão de pai
  useEffect(() => {
    const checkParentSession = () => {
      const parentSession = localStorage.getItem('parent-session');
      if (!parentSession) {
        router.replace('/');
        return;
      }

      try {
        const session = JSON.parse(parentSession);
        // Verificar se a sessão não expirou (24 horas)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const diffHours =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (diffHours > 24) {
          localStorage.removeItem('parent-session');
          router.replace('/');
          return;
        }

        console.log('👨‍👩‍👧‍👦 Sessão de pai válida:', session.name);
      } catch (error) {
        localStorage.removeItem('parent-session');
        router.replace('/');
      }
    };

    checkParentSession();
  }, [router]);

  // Estados para dados reais do Supabase
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PurchaseRequest[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showChildEmojiPicker, setShowChildEmojiPicker] = useState(false);
  const [childSelectedEmoji, setChildSelectedEmoji] = useState('');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [interestConfigs, setInterestConfigs] = useState<any>({});
  const [allowanceConfigs, setAllowanceConfigs] = useState<any>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showChildDetailsModal, setShowChildDetailsModal] = useState(false);
  const [selectedChildForDetails, setSelectedChildForDetails] =
    useState<Child | null>(null);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState([
    { id: '1', name: 'Jogos', icon: '🎮', enabled: true },
    { id: '2', name: 'Roupas', icon: '👕', enabled: true },
    { id: '3', name: 'Livros', icon: '📚', enabled: true },
    { id: '4', name: 'Esportes', icon: '⚽', enabled: true },
    { id: '5', name: 'Eletrônicos', icon: '📱', enabled: false },
    { id: '6', name: 'Brinquedos', icon: '🧸', enabled: false },
  ]);

  // useEffect para carregar dados reais do Supabase
  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    setLoading(true);
    try {
      // Usar Supabase para dados reais
      console.log('🔍 Carregando dados do Supabase...');

      // Usar família existente do banco (primeira família disponível)
      const { data: families, error: familyError } = await supabase
        .from('families')
        .select('*')
        .limit(1);

      if (familyError || !families || families.length === 0) {
        console.error('❌ Erro ao carregar família:', familyError);
        // Fallback: criar família demo
        const { data: newFamily, error: createError } = await supabase
          .from('families')
          .insert([
            {
              parent_name: 'Demo Parent',
              parent_email: 'demo@teste.com',
            },
          ])
          .select()
          .single();

        if (createError || !newFamily) {
          console.error('❌ Erro ao criar família:', createError);
          return;
        }
        setCurrentFamily(newFamily);
      } else {
        setCurrentFamily(families[0]);
      }

      // Carregar crianças do Supabase
      const { data: familyChildren, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', families?.[0]?.id || currentFamily?.id);

      if (childrenError) {
        console.error('❌ Erro ao carregar crianças:', childrenError);
        setChildren([]);
      } else {
        console.log('✅ Crianças carregadas do Supabase:', familyChildren);
        setChildren(familyChildren || []);
      }

      if (familyChildren.length > 0) {
        setSelectedChild(familyChildren[0]);
      }

      // Carregar solicitações pendentes (transações pendentes) do Supabase
      const { data: pendingTransactions, error: pendingError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('requires_approval', true)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error(
          '❌ Erro ao carregar solicitações pendentes:',
          pendingError
        );
        setPendingRequests([]);
      } else {
        console.log(
          '✅ Solicitações pendentes carregadas:',
          pendingTransactions
        );
        setPendingRequests(pendingTransactions || []);
      }

      // Carregar configurações de juros do localStorage
      const localInterestConfigs = localStorage.getItem(
        'demo-interest-configs'
      );
      const interestConfigs: any = localInterestConfigs
        ? JSON.parse(localInterestConfigs)
        : {};

      // Para cada criança sem configuração, criar padrão
      for (const child of familyChildren) {
        if (!interestConfigs[child.id]) {
          interestConfigs[child.id] = {
            monthly_rate: 0.01,
            minimum_balance: 10.0,
            is_active: true,
          };
        }
      }

      // Carregar configurações de mesada do localStorage
      const localAllowanceConfigs = localStorage.getItem(
        'demo-allowance-configs'
      );
      const allowanceConfigs: any = localAllowanceConfigs
        ? JSON.parse(localAllowanceConfigs)
        : {};

      // Para cada criança sem configuração, criar padrão
      for (const child of familyChildren) {
        if (!allowanceConfigs[child.id]) {
          allowanceConfigs[child.id] = {
            amount: 25.0,
            frequency: 'weekly',
            day_of_week: 1,
            is_active: true,
            next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          };
        }
      }

      setInterestConfigs(interestConfigs);
      setAllowanceConfigs(allowanceConfigs);

      // Adicionar as crianças ao objeto family
      const familyWithChildren = { ...family, children: familyChildren };
      setFamilyData(familyWithChildren);

      // Salvar de volta no localStorage
      localStorage.setItem(
        'demo-interest-configs',
        JSON.stringify(interestConfigs)
      );
      localStorage.setItem(
        'demo-allowance-configs',
        JSON.stringify(allowanceConfigs)
      );
    } catch (error) {
      console.error('Erro ao carregar dados da família:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para aprovar/negar solicitações
  const handleRequestDecision = async (
    requestId: string,
    approved: boolean
  ) => {
    try {
      const success = await ParentalDashboardService.handleApprovalRequest(
        requestId,
        approved
      );

      if (success) {
        // Remover da lista local
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));

        // Recarregar dados para atualizar saldos
        await loadFamilyData();

        alert(approved ? '✅ Solicitação aprovada!' : '❌ Solicitação negada!');
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      alert('❌ Erro ao processar solicitação');
    }
  };

  // Função para atualizar configuração de juros
  const updateInterestConfig = async (
    childId: string,
    config: {
      monthly_rate?: number;
      minimum_balance?: number;
      is_active?: boolean;
    }
  ) => {
    try {
      console.log('Atualizando configuração de juros:', { childId, config });

      // Atualizar estado local
      setInterestConfigs(prev => {
        const newConfigs = {
          ...prev,
          [childId]: {
            ...prev[childId],
            ...config,
          },
        };

        // Salvar também no localStorage
        localStorage.setItem(
          'demo-interest-configs',
          JSON.stringify(newConfigs)
        );

        return newConfigs;
      });

      console.log('Configuração de juros atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configuração de juros:', error);
      alert('❌ Erro ao atualizar configuração de juros');
    }
  };

  // Função para atualizar configuração de mesada
  const updateAllowanceConfig = async (
    childId: string,
    config: {
      amount?: number;
      frequency?: 'daily' | 'weekly' | 'monthly';
      day_of_week?: number;
      day_of_month?: number;
      is_active?: boolean;
    }
  ) => {
    try {
      console.log('Atualizando configuração de mesada:', { childId, config });

      // Atualizar estado local
      setAllowanceConfigs(prev => {
        const newConfigs = {
          ...prev,
          [childId]: {
            ...prev[childId],
            ...config,
          },
        };

        // Salvar também no localStorage
        localStorage.setItem(
          'demo-allowance-configs',
          JSON.stringify(newConfigs)
        );

        return newConfigs;
      });

      console.log('Configuração de mesada atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configuração de mesada:', error);
      alert('❌ Erro ao atualizar configuração de mesada');
    }
  };

  // Função para criar/editar criança
  const handleChildSubmit = async (childData: {
    name: string;
    age: number;
    birth_date?: string;
    pin: string;
    avatar_url?: string;
  }) => {
    try {
      if (!currentFamily) {
        alert('❌ Família não encontrada');
        return;
      }

      if (editingChild) {
        // Editando criança existente no Supabase
        const { data: updatedChild, error } = await supabase
          .from('children')
          .update({
            name: childData.name,
            pin: childData.pin,
            avatar: childData.avatar_url || editingChild.avatar,
          })
          .eq('id', editingChild.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar criança:', error);
          alert('❌ Erro ao atualizar criança');
          return;
        }

        // Salvar data de nascimento no localStorage (temporário)
        if (childData.birth_date) {
          const childBirthDates = JSON.parse(
            localStorage.getItem('child-birth-dates') || '{}'
          );
          childBirthDates[editingChild.id] = childData.birth_date;
          localStorage.setItem(
            'child-birth-dates',
            JSON.stringify(childBirthDates)
          );
          console.log(
            '📅 Data de nascimento salva no localStorage:',
            childData.birth_date
          );
        }

        alert('✅ Criança atualizada com sucesso!');
      } else {
        // Criando nova criança no Supabase
        const { data: newChild, error } = await supabase
          .from('children')
          .insert([
            {
              family_id: currentFamily.id,
              name: childData.name,
              pin: childData.pin,
              avatar: childData.avatar_url || '👧',
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              level: 1,
              xp: 0,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar criança:', error);
          alert('❌ Erro ao criar criança');
          return;
        }

        // Salvar data de nascimento no localStorage (temporário)
        if (childData.birth_date && newChild) {
          const childBirthDates = JSON.parse(
            localStorage.getItem('child-birth-dates') || '{}'
          );
          childBirthDates[newChild.id] = childData.birth_date;
          localStorage.setItem(
            'child-birth-dates',
            JSON.stringify(childBirthDates)
          );
          console.log(
            '📅 Data de nascimento salva no localStorage:',
            childData.birth_date
          );
        }

        console.log('✅ Nova criança criada no Supabase:', newChild);
        alert('✅ Criança criada com sucesso!');
      }

      // Recarregar dados para atualizar a interface
      await loadFamilyData();

      setShowChildModal(false);
      setEditingChild(null);
    } catch (error) {
      console.error('Erro ao criar/editar criança:', error);
      alert('❌ Erro ao processar dados da criança');
    }
  };

  // Dados híbridos - usa Supabase quando disponível, fallback para mock
  const family = {
    parentName: currentFamily?.parent_name || 'João Silva',
    parentAvatar: '👨‍💼',
    familyBalance:
      children.reduce((total, child) => total + (child.balance || 0), 0) ||
      1250.75,
    children:
      children.length > 0
        ? children.map(child => ({
            id: child.id,
            name: child.name,
            avatar: child.avatar || '👧',
            age: calculateAge(child.id, child.created_at),
            balance: child.balance || 0,
            level: child.current_level || 1,
            xp: child.total_xp || 0,
            currentStreak: child.current_streak || 0,
            pendingRequests: pendingRequests.filter(
              req => req.child_id === child.id
            ).length,
            lastActivity: new Date(
              child.updated_at || child.created_at
            ).toLocaleDateString('pt-BR'),
          }))
        : [
            {
              id: '1',
              name: 'Maria Silva',
              avatar: '👧',
              age: 12,
              balance: 89.5,
              level: 5,
              xp: 1240,
              currentStreak: 7,
              pendingRequests: 2,
              lastActivity: '2 horas atrás',
            },
            {
              id: '2',
              name: 'Pedro Silva',
              avatar: '👦',
              age: 9,
              balance: 45.25,
              level: 3,
              xp: 680,
              currentStreak: 3,
              pendingRequests: 1,
              lastActivity: '30 minutos atrás',
            },
            {
              id: '3',
              name: 'Ana Silva',
              avatar: '👶',
              age: 6,
              balance: 15.75,
              level: 2,
              xp: 320,
              currentStreak: 1,
              pendingRequests: 0,
              lastActivity: '1 hora atrás',
            },
          ],
  };

  const totalPendingRequests = family.children.reduce(
    (total, child) => total + child.pendingRequests,
    0
  );

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const emojiCategories = {
    Objetos: [
      '🎮',
      '🎯',
      '🎨',
      '🎵',
      '🎪',
      '🎭',
      '🎬',
      '🎤',
      '🎸',
      '🎹',
      '🎺',
      '🎻',
      '📱',
      '💻',
      '⌨️',
      '🖥️',
      '🖨️',
      '📷',
      '📹',
      '🎥',
    ],
    Esportes: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🎾',
      '🏐',
      '🏉',
      '🎱',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
      '🏏',
      '🏗️',
      '⛳',
      '🏹',
      '🎣',
      '🥊',
      '🥋',
    ],
    Roupas: [
      '👕',
      '👖',
      '🩳',
      '👔',
      '👗',
      '👠',
      '👡',
      '👢',
      '👞',
      '👟',
      '🥾',
      '🧦',
      '🧢',
      '🎩',
      '👑',
      '💄',
      '👜',
      '🎒',
      '👛',
      '💍',
    ],
    Educação: [
      '📚',
      '📖',
      '📝',
      '📒',
      '📕',
      '📗',
      '📘',
      '📙',
      '📓',
      '🗒️',
      '📑',
      '🔖',
      '🏷️',
      '💼',
      '📁',
      '📂',
      '🗂️',
      '📋',
      '📊',
      '📈',
    ],
    Comida: [
      '🍎',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🫐',
      '🍓',
      '🥝',
      '🍑',
      '🥭',
      '🍍',
      '🥥',
      '🍅',
      '🍆',
      '🥑',
      '🫒',
      '🌶️',
      '🫑',
      '🥒',
    ],
    Casa: [
      '🏠',
      '🏡',
      '🏘️',
      '🏚️',
      '🏗️',
      '🏭',
      '🏢',
      '🏬',
      '🏣',
      '🏤',
      '🏥',
      '🏦',
      '🏨',
      '🏪',
      '🏫',
      '🏩',
      '💒',
      '🏛️',
      '⛪',
      '🕌',
    ],
    Transporte: [
      '🚗',
      '🚙',
      '🚐',
      '🛻',
      '🚚',
      '🚛',
      '🚜',
      '🏎️',
      '🏍️',
      '🛵',
      '🚲',
      '🛴',
      '🛹',
      '🛼',
      '🚁',
      '✈️',
      '🛩️',
      '🚀',
      '🛸',
      '⛵',
    ],
    Animais: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐻‍❄️',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐽',
      '🐸',
      '🐵',
      '🦄',
      '🐴',
      '🦓',
    ],
    Símbolos: [
      '❤️',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '⭐',
      '🌟',
      '✨',
    ],
  };

  const addNewCategory = () => {
    setNewCategoryName('');
    setSelectedEmoji('');
    setShowEmojiPicker(true);
  };

  const confirmAddCategory = () => {
    if (newCategoryName && selectedEmoji) {
      setCategories(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newCategoryName,
          icon: selectedEmoji,
          enabled: true,
        },
      ]);
      setShowEmojiPicker(false);
      setNewCategoryName('');
      setSelectedEmoji('');
      alert(
        `✅ Categoria "${newCategoryName} ${selectedEmoji}" criada com sucesso!`
      );
    } else {
      alert('❌ Preencha o nome e selecione um emoji!');
    }
  };

  const removeCategory = (categoryId: string) => {
    if (confirm('Tem certeza que deseja remover esta categoria?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  // Tela de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👨‍💼</div>
          <div className="text-xl font-bold text-gray-700 mb-2">
            Carregando dashboard parental...
          </div>
          <div className="text-gray-500">Conectando com Supabase</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{family.parentAvatar}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bem-vindo, {family.parentName}
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboard Parental - Banco da Família
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Saldo Familiar Total
                </div>
                <div className="text-xl font-bold text-green-600">
                  R$ {family.familyBalance.toFixed(2)}
                </div>
              </div>

              {totalPendingRequests > 0 && (
                <div className="relative">
                  <button className="bg-red-500 text-white p-2 rounded-full">
                    <span className="text-lg">🔔</span>
                  </button>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalPendingRequests}
                  </span>
                </div>
              )}

              <button
                onClick={() => {
                  localStorage.removeItem('parent-session');
                  router.push('/');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
            <div className="text-2xl font-bold text-blue-600">
              {family.children.length}
            </div>
            <div className="text-sm text-gray-600">Filhos Ativos</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-2xl font-bold text-green-600">
              R$ {family.familyBalance.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Saldo Total</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-orange-600">
              {totalPendingRequests}
            </div>
            <div className="text-sm text-gray-600">Aprovações Pendentes</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...family.children.map(c => c.currentStreak))}
            </div>
            <div className="text-sm text-gray-600">Maior Streak</div>
          </div>
        </div>

        {/* Children Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Visão Geral dos Filhos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {family.children.map(child => (
              <div
                key={child.id}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedChild(child)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{child.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">
                      {calculateAge(child.id, child.created_at)} anos
                    </p>
                  </div>
                  {child.pendingRequests > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {child.pendingRequests}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saldo</span>
                    <span className="font-semibold text-green-600">
                      R$ {child.balance.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nível</span>
                    <span className="font-semibold text-blue-600">
                      Nível {child.level} ({child.xp} XP)
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Streak</span>
                    <span className="font-semibold text-orange-600">
                      {child.currentStreak} dias 🔥
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Última atividade: {child.lastActivity}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                      onClick={async e => {
                        e.stopPropagation();
                        // Buscar dados atualizados do Supabase
                        const { data: updatedChild, error } = await supabase
                          .from('children')
                          .select('*')
                          .eq('id', child.id)
                          .single();

                        if (error) {
                          console.error(
                            '❌ Erro ao buscar dados da criança:',
                            error
                          );
                          setSelectedChildForDetails(child);
                        } else {
                          console.log(
                            '✅ Criança atualizada do Supabase:',
                            updatedChild
                          );
                          setSelectedChildForDetails(updatedChild);
                        }
                        setShowChildDetailsModal(true);
                      }}
                    >
                      Ver Detalhes
                    </button>
                    <button
                      className="bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition-all"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingChild(
                          children.find(c => c.id === child.id) || null
                        );
                        setShowChildModal(true);
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals - Dados reais do Supabase */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
              <span className="mr-2">⚠️</span>
              Aprovações Pendentes ({pendingRequests.length})
            </h2>

            <div className="space-y-4">
              {pendingRequests.map(request => {
                const child = children.find(c => c.id === request.child_id);
                const childName = child?.name || 'Criança';
                const childAvatar = child?.avatar_url || '👧';

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{childAvatar}</div>
                        <div>
                          <h4 className="font-semibold">
                            {childName} quer{' '}
                            {request.type === 'purchase'
                              ? 'comprar'
                              : request.type === 'goal'
                                ? 'criar sonho'
                                : 'empréstimo para'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.item_name} - R$ {request.amount.toFixed(2)}
                            {request.category && ` (${request.category})`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleRequestDecision(request.id, true)
                          }
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                          disabled={loading}
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          onClick={() =>
                            handleRequestDecision(request.id, false)
                          }
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                          disabled={loading}
                        >
                          ❌ Negar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => router.push('/statements-test')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Ver Extratos</div>
            </button>

            <button
              onClick={() => router.push('/analytics-test')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
            </button>

            <button
              onClick={() => router.push('/goals-test')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Gerenciar Metas</div>
            </button>

            <button
              onClick={() => router.push('/notifications-test')}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-semibold">Notificações</div>
            </button>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">🏷️</div>
              <div className="font-semibold">Gerenciar Categorias</div>
            </button>

            <button
              onClick={() => setShowInterestModal(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Configurar Juros</div>
            </button>

            <button
              onClick={() => setShowAllowanceModal(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">💸</div>
              <div className="font-semibold">Configurar Mesada</div>
            </button>

            <button
              onClick={() => {
                setEditingChild(null);
                setShowChildModal(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-2xl mb-2">👶</div>
              <div className="font-semibold">Adicionar Criança</div>
            </button>
          </div>
        </div>

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Criar Nova Categoria
                </h2>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Categoria:
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Música, Arte, Viagem..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Emoji Selecionado:{' '}
                  {selectedEmoji && (
                    <span className="text-2xl ml-2">{selectedEmoji}</span>
                  )}
                </label>

                <div className="space-y-4">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {category}:
                      </h4>
                      <div className="grid grid-cols-10 gap-2">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-all ${
                              selectedEmoji === emoji
                                ? 'bg-blue-100 ring-2 ring-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={confirmAddCategory}
                  className="flex-1 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all"
                >
                  ✅ Criar Categoria
                </button>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="flex-1 bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Gerenciar Categorias de Compra
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Configure quais categorias estarão disponíveis para seus
                  filhos comprarem.
                </p>

                <button
                  onClick={addNewCategory}
                  className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                >
                  + Adicionar Nova Categoria
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      category.enabled
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        <div
                          className={`text-sm ${category.enabled ? 'text-green-600' : 'text-gray-500'}`}
                        >
                          {category.enabled
                            ? 'Disponível para crianças'
                            : 'Indisponível'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={`flex-1 font-semibold py-2 px-3 rounded-lg transition-all ${
                          category.enabled
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {category.enabled ? 'Desabilitar' : 'Habilitar'}
                      </button>

                      <button
                        onClick={() => removeCategory(category.id)}
                        className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Como funciona:
                </h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>
                    • <strong>Habilitadas:</strong> Aparecem na tela dos seus
                    filhos
                  </li>
                  <li>
                    • <strong>Desabilitadas:</strong> Ficam ocultas para as
                    crianças
                  </li>
                  <li>
                    • <strong>Personalizadas:</strong> Você pode criar quantas
                    quiser
                  </li>
                  <li>
                    • <strong>Controle total:</strong> Ative/desative quando
                    necessário
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interest Configuration Modal */}
        {showInterestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  💰 Configurar Sistema de Juros
                </h2>
                <button
                  onClick={() => setShowInterestModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📋 Como funciona o sistema de juros:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Taxa padrão:</strong> 1% ao mês (ajustável por
                    criança)
                  </li>
                  <li>
                    • <strong>Regra dos 30 dias:</strong> Só rende o dinheiro
                    que está há 30+ dias na conta
                  </li>
                  <li>
                    • <strong>Saldo mínimo:</strong> Configurável (padrão R$
                    10,00)
                  </li>
                  <li>
                    • <strong>Aplicação:</strong> Automática todo mês
                  </li>
                </ul>
              </div>

              {children.length === 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ⚙️ Configurações Globais de Juros:
                  </h3>
                  <div className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">💰</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Configurações Padrão
                          </h3>
                          <p className="text-sm text-gray-600">
                            Aplicadas a todas as crianças novas
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            📈 Taxa de Juros Mensal
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              defaultValue="1.0"
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-gray-900"
                              placeholder="1.0"
                            />
                            <span className="text-gray-600 font-bold">
                              % ao mês
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Recomendado: 0.5% - 2.0% para educar sobre juros
                            compostos
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            💵 Saldo Mínimo para Render
                          </label>
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600 font-bold">R$</span>
                            <input
                              type="number"
                              min="0"
                              step="5"
                              defaultValue="10"
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-gray-900"
                              placeholder="10"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Valor mínimo para a conta render juros
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            📅 Frequência de Aplicação
                          </label>
                          <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-gray-900">
                            <option value="monthly">
                              Mensal (todo dia 1º)
                            </option>
                            <option value="weekly">
                              Semanal (todo domingo)
                            </option>
                            <option value="daily">
                              Diário (só para testes)
                            </option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              Sistema Ativo
                            </h4>
                            <p className="text-xs text-gray-600">
                              Aplicar juros automaticamente
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="text-yellow-600">⚠️</div>
                        <div>
                          <h4 className="font-bold text-yellow-800">
                            Regra dos 30 Dias
                          </h4>
                          <p className="text-sm text-yellow-700">
                            Apenas o dinheiro que está na conta há mais de 30
                            dias rende juros. Isso ensina sobre disciplina
                            financeira e evita manipulação do sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {children.map(child => {
                    const config = interestConfigs[child.id] || {
                      monthly_rate: 0.01,
                      minimum_balance: 10.0,
                      is_active: true,
                    };

                    return (
                      <InterestChildConfig
                        key={child.id}
                        child={child}
                        config={config}
                        onUpdate={updates =>
                          updateInterestConfig(child.id, updates)
                        }
                      />
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowInterestModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aqui salvaria as configurações
                    alert('Configurações de juros salvas com sucesso!');
                    setShowInterestModal(false);
                  }}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                >
                  💾 Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Configuração de Mesada */}
        {showAllowanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  💸 Configurar Mesada
                </h2>
                <button
                  onClick={() => setShowAllowanceModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-6">
                {family.children.map(child => {
                  const config = allowanceConfigs[child.id] || {
                    amount: 25,
                    frequency: 'weekly',
                    day_of_week: 1,
                    day_of_month: 1,
                    is_active: true,
                  };

                  return (
                    <AllowanceChildConfig
                      key={child.id}
                      child={child}
                      config={config}
                      onUpdate={updates =>
                        updateAllowanceConfig(child.id, updates)
                      }
                    />
                  );
                })}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAllowanceModal(false)}
                  className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criança (Criar/Editar) */}
        {showChildModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingChild ? '✏️ Editar Criança' : '👶 Adicionar Criança'}
                </h2>
                <button
                  onClick={() => {
                    setShowChildModal(false);
                    setEditingChild(null);
                    setChildSelectedEmoji('');
                    setShowChildEmojiPicker(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ❌
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const birthDate = formData.get('birth_date') as string;
                  const pinValue = formData.get('pin') as string;
                  const nameValue = formData.get('name') as string;

                  console.log('📝 FormData extraída:', {
                    name: nameValue,
                    birth_date: birthDate,
                    pin: pinValue,
                    avatar: childSelectedEmoji,
                  });

                  // Calcular idade automaticamente
                  let age = 0;
                  if (birthDate) {
                    const today = new Date();
                    const birth = new Date(birthDate);
                    age = today.getFullYear() - birth.getFullYear();
                    const monthDiff = today.getMonth() - birth.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birth.getDate())
                    ) {
                      age--;
                    }
                  }

                  const childData = {
                    name: nameValue,
                    age: age,
                    birth_date: birthDate,
                    pin: pinValue,
                    avatar_url: childSelectedEmoji || '👧',
                  };

                  console.log('📝 Dados da criança sendo enviados:', childData);
                  handleChildSubmit(childData);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome da Criança
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingChild?.name || ''}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    defaultValue=""
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    placeholder="Opcional - para cálculo de idade"
                  />
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    A idade será calculada automaticamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    PIN de 4 dígitos
                  </label>
                  <input
                    type="password"
                    name="pin"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    placeholder="0000"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium text-center text-lg"
                    required
                  />
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    Usado pela criança para fazer login no app
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Avatar da Criança
                  </label>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-6xl">
                      {childSelectedEmoji || editingChild?.avatar || '👧'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChildEmojiPicker(true)}
                      className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Escolher Emoji
                    </button>
                  </div>

                  <input
                    type="hidden"
                    name="avatar"
                    value={
                      childSelectedEmoji || editingChild?.avatar_url || '👧'
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChildModal(false);
                      setEditingChild(null);
                      setChildSelectedEmoji('');
                      setShowChildEmojiPicker(false);
                    }}
                    className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingChild ? 'Salvar Alterações' : 'Criar Criança'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Emoji Picker para Criança */}
        {showChildEmojiPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎭 Escolher Avatar
                </h2>
                <button
                  onClick={() => setShowChildEmojiPicker(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(emojiCategories).map(
                  ([categoryName, emojis]) => (
                    <div key={categoryName}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">
                        {categoryName}
                      </h3>
                      <div className="grid grid-cols-10 gap-3">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setChildSelectedEmoji(emoji);
                              setShowChildEmojiPicker(false);
                            }}
                            className={`text-3xl p-3 rounded-lg transition-all hover:bg-blue-50 hover:scale-110 ${
                              childSelectedEmoji === emoji
                                ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowChildEmojiPicker(false)}
                  className="bg-gray-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Child Details Modal */}
        {showChildDetailsModal && selectedChildForDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedChildForDetails.emoji} Detalhes -{' '}
                  {selectedChildForDetails.name}
                </h2>
                <button
                  onClick={() => setShowChildDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Child Basic Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    📋 Informações Básicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-gray-700">Nome:</span>
                      <p className="text-gray-600">
                        {selectedChildForDetails.name}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Idade:</span>
                      <p className="text-gray-600">
                        {calculateAge(
                          selectedChildForDetails.id,
                          selectedChildForDetails.created_at
                        )}{' '}
                        anos
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">
                        Data de Nascimento:
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600">
                          {(() => {
                            const savedBirthDate = getBirthDateFromStorage(
                              selectedChildForDetails.id
                            );
                            if (savedBirthDate) {
                              return formatBirthDate(savedBirthDate);
                            }
                            return 'Não informada';
                          })()}
                        </p>
                        {!getBirthDateFromStorage(
                          selectedChildForDetails.id
                        ) && (
                          <button
                            onClick={async () => {
                              const birthDate = prompt(
                                'Digite a data de nascimento (AAAA-MM-DD):'
                              );
                              if (
                                birthDate &&
                                /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
                              ) {
                                // Calcular idade
                                const today = new Date();
                                const birth = new Date(birthDate);
                                let age =
                                  today.getFullYear() - birth.getFullYear();
                                const monthDiff =
                                  today.getMonth() - birth.getMonth();
                                if (
                                  monthDiff < 0 ||
                                  (monthDiff === 0 &&
                                    today.getDate() < birth.getDate())
                                ) {
                                  age--;
                                }

                                // Atualizar criança
                                const updatedChildren = family.children.map(
                                  child =>
                                    child.id === selectedChildForDetails.id
                                      ? {
                                          ...child,
                                          birth_date: birthDate,
                                          age: age,
                                        }
                                      : child
                                );

                                const updatedFamily = {
                                  ...family,
                                  children: updatedChildren,
                                };
                                localStorage.setItem(
                                  'demo-family',
                                  JSON.stringify(updatedFamily)
                                );

                                // Recarregar dados
                                loadFamilyData();

                                alert(
                                  'Data de nascimento adicionada com sucesso!'
                                );
                              } else if (birthDate !== null) {
                                alert(
                                  'Data deve estar no formato AAAA-MM-DD (ex: 2015-06-15)'
                                );
                              }
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                          >
                            ➕ Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">
                        PIN de Acesso:
                      </span>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-gray-600 font-mono"
                          id={`pin-${selectedChildForDetails.id}`}
                        >
                          {showPins[selectedChildForDetails.id]
                            ? selectedChildForDetails.pin || '0000'
                            : '****'}
                        </p>
                        <button
                          onClick={() => {
                            setShowPins(prev => ({
                              ...prev,
                              [selectedChildForDetails.id]:
                                !prev[selectedChildForDetails.id],
                            }));
                          }}
                          className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                        >
                          {showPins[selectedChildForDetails.id]
                            ? '🙈 Ocultar'
                            : '👁️ Ver'}
                        </button>
                        <button
                          onClick={async () => {
                            const newPin = prompt(
                              'Digite o novo PIN (4 dígitos):',
                              selectedChildForDetails.pin
                            );
                            if (
                              newPin &&
                              newPin.length === 4 &&
                              /^\d{4}$/.test(newPin)
                            ) {
                              // Atualizar PIN da criança
                              const updatedChildren = family.children.map(
                                child =>
                                  child.id === selectedChildForDetails.id
                                    ? { ...child, pin: newPin }
                                    : child
                              );

                              const updatedFamily = {
                                ...family,
                                children: updatedChildren,
                              };
                              localStorage.setItem(
                                'demo-family',
                                JSON.stringify(updatedFamily)
                              );

                              // Atualizar os estados locais
                              // Recarregar dados
                              loadFamilyData();

                              alert('PIN atualizado com sucesso!');
                            } else if (newPin !== null) {
                              alert(
                                'PIN deve ter exatamente 4 dígitos numéricos.'
                              );
                            }
                          }}
                          className="text-orange-500 hover:text-orange-700 text-sm font-bold"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    💰 Informações Financeiras
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold text-gray-700">
                        Saldo Atual:
                      </span>
                      <p className="text-2xl font-bold text-green-600">
                        R${' '}
                        {selectedChildForDetails.balance?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">
                        Status dos Juros:
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600">
                          {interestConfigs[selectedChildForDetails.id]?.active
                            ? '✅ Ativo'
                            : '❌ Inativo'}
                        </p>
                        {!interestConfigs[selectedChildForDetails.id]
                          ?.active && (
                          <button
                            onClick={async () => {
                              const defaultConfig = {
                                active: true,
                                rate: 10,
                                minimum_balance: 10,
                                next_application_date: new Date(
                                  new Date().setMonth(new Date().getMonth() + 1)
                                ).toISOString(),
                              };
                              await updateInterestConfig(
                                selectedChildForDetails.id,
                                defaultConfig
                              );
                              loadFamilyData();
                            }}
                            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600 transition-all"
                          >
                            Ativar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interest Configuration Details */}
                  {interestConfigs[selectedChildForDetails.id]?.active && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-2">
                        Configuração de Juros:
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Taxa:{' '}
                          {interestConfigs[selectedChildForDetails.id]?.rate}%
                          ao mês
                        </p>
                        <p>
                          Saldo mínimo: R${' '}
                          {
                            interestConfigs[selectedChildForDetails.id]
                              ?.minimum_balance
                          }
                        </p>
                        <p>
                          Próxima aplicação:{' '}
                          {interestConfigs[selectedChildForDetails.id]
                            ?.next_application_date
                            ? new Date(
                                interestConfigs[
                                  selectedChildForDetails.id
                                ].next_application_date
                              ).toLocaleDateString('pt-BR')
                            : 'Não definida'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Allowance Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    💸 Mesada
                  </h3>
                  {allowanceConfigs[selectedChildForDetails.id] ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-bold text-gray-700">Valor:</span>
                        <p className="text-xl font-bold text-purple-600">
                          R${' '}
                          {allowanceConfigs[
                            selectedChildForDetails.id
                          ]?.amount?.toFixed(2) || '0,00'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">
                          Frequência:
                        </span>
                        <p className="text-gray-600">
                          {allowanceConfigs[selectedChildForDetails.id]
                            ?.frequency === 'weekly'
                            ? 'Semanal'
                            : 'Mensal'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">Status:</span>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-600">
                            {allowanceConfigs[selectedChildForDetails.id]
                              ?.active
                              ? '✅ Ativa'
                              : '❌ Inativa'}
                          </p>
                          {!allowanceConfigs[selectedChildForDetails.id]
                            ?.active && (
                            <button
                              onClick={async () => {
                                const defaultConfig = {
                                  active: true,
                                  amount: 25,
                                  frequency: 'weekly',
                                  next_payment_date: new Date(
                                    new Date().setDate(new Date().getDate() + 7)
                                  ).toISOString(),
                                  day_of_week: new Date().getDay(),
                                };
                                await updateAllowanceConfig(
                                  selectedChildForDetails.id,
                                  defaultConfig
                                );
                                loadFamilyData();
                              }}
                              className="bg-purple-500 text-white text-xs px-2 py-1 rounded hover:bg-purple-600 transition-all"
                            >
                              Ativar
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">
                          Próximo Pagamento:
                        </span>
                        <p className="text-gray-600">
                          {allowanceConfigs[selectedChildForDetails.id]
                            ?.next_payment_date
                            ? new Date(
                                allowanceConfigs[
                                  selectedChildForDetails.id
                                ].next_payment_date
                              ).toLocaleDateString('pt-BR')
                            : 'Não definido'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500">Mesada não configurada</p>
                      <button
                        onClick={async () => {
                          const defaultConfig = {
                            active: true,
                            amount: 25,
                            frequency: 'weekly',
                            next_payment_date: new Date(
                              new Date().setDate(new Date().getDate() + 7)
                            ).toISOString(),
                            day_of_week: new Date().getDay(),
                          };
                          await updateAllowanceConfig(
                            selectedChildForDetails.id,
                            defaultConfig
                          );
                          loadFamilyData();
                        }}
                        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-all"
                      >
                        Configurar Mesada
                      </button>
                    </div>
                  )}
                </div>

                {/* Gamification Stats */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    🏆 Gamificação
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        Nível 1
                      </div>
                      <div className="text-sm text-gray-600">Iniciante</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Badges</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progresso para Nível 2</span>
                      <span>0 / 100 XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingChild(selectedChildForDetails);
                      setShowChildDetailsModal(false);
                      setShowChildModal(true);
                    }}
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-all"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChildForDetails(selectedChildForDetails);
                      setShowChildDetailsModal(false);
                      setShowAllowanceModal(true);
                    }}
                    className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition-all"
                  >
                    💸 Configurar Mesada
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChildForDetails(selectedChildForDetails);
                      setShowChildDetailsModal(false);
                      setShowInterestModal(true);
                    }}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                  >
                    💰 Configurar Juros
                  </button>
                  <button
                    onClick={() => {
                      // Debug das datas de nascimento
                      const childBirthDates =
                        localStorage.getItem('child-birth-dates');
                      const debugInfo = {
                        'ID da criança': selectedChildForDetails.id,
                        'Nome da criança': selectedChildForDetails.name,
                        'Dados no localStorage': childBirthDates
                          ? JSON.parse(childBirthDates)
                          : 'Nenhum dado encontrado',
                        'Todas as chaves localStorage':
                          Object.keys(localStorage),
                      };
                      alert(
                        `🔍 DEBUG - Dados de nascimento:\n\n${JSON.stringify(debugInfo, null, 2)}`
                      );
                      console.log('🔍 DEBUG completo:', debugInfo);
                    }}
                    className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all"
                  >
                    🔍 Debug Datas
                  </button>
                  <button
                    onClick={() => {
                      // Forçar data de nascimento para RAFAEL ou GABRIEL
                      if (selectedChildForDetails.name === 'RAFAEL') {
                        const childBirthDates = JSON.parse(
                          localStorage.getItem('child-birth-dates') || '{}'
                        );
                        childBirthDates[selectedChildForDetails.id] =
                          '2015-06-12';
                        localStorage.setItem(
                          'child-birth-dates',
                          JSON.stringify(childBirthDates)
                        );
                        console.log(
                          '✅ Data forçada para RAFAEL:',
                          '2015-06-12'
                        );
                        alert(
                          '✅ Data de nascimento adicionada para RAFAEL: 12/06/2015'
                        );

                        // Recarregar a página para mostrar a data
                        window.location.reload();
                      } else if (selectedChildForDetails.name === 'GABRIEL') {
                        const childBirthDates = JSON.parse(
                          localStorage.getItem('child-birth-dates') || '{}'
                        );
                        childBirthDates[selectedChildForDetails.id] =
                          '2016-10-27';
                        localStorage.setItem(
                          'child-birth-dates',
                          JSON.stringify(childBirthDates)
                        );
                        console.log(
                          '✅ Data forçada para GABRIEL:',
                          '2016-10-27'
                        );
                        alert(
                          '✅ Data de nascimento adicionada para GABRIEL: 27/10/2016'
                        );

                        // Recarregar a página para mostrar a data
                        window.location.reload();
                      } else {
                        const birthDate = prompt(
                          'Digite a data de nascimento (AAAA-MM-DD):'
                        );
                        if (
                          birthDate &&
                          /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
                        ) {
                          const childBirthDates = JSON.parse(
                            localStorage.getItem('child-birth-dates') || '{}'
                          );
                          childBirthDates[selectedChildForDetails.id] =
                            birthDate;
                          localStorage.setItem(
                            'child-birth-dates',
                            JSON.stringify(childBirthDates)
                          );
                          console.log('✅ Data adicionada:', birthDate);
                          alert(
                            `✅ Data de nascimento adicionada: ${new Date(birthDate).toLocaleDateString('pt-BR')}`
                          );
                          window.location.reload();
                        } else {
                          alert('❌ Formato inválido. Use AAAA-MM-DD');
                        }
                      }
                    }}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                  >
                    🎂 Forçar Data
                  </button>
                  <button
                    onClick={async () => {
                      const confirmDelete = confirm(
                        `⚠️ Tem certeza que deseja deletar "${selectedChildForDetails.name}"?\n\n` +
                          `Esta ação não pode ser desfeita e removerá:\n` +
                          `• Todos os dados da criança\n` +
                          `• Configurações de mesada e juros\n` +
                          `• Histórico financeiro\n\n` +
                          `Digite "DELETAR" para confirmar:`
                      );

                      if (confirmDelete) {
                        const confirmation = prompt(
                          'Para confirmar, digite: DELETAR'
                        );
                        if (confirmation === 'DELETAR') {
                          try {
                            // Tentar remover criança do Supabase (pode falhar por RLS - ok para demo)
                            const { error } = await supabase
                              .from('children')
                              .delete()
                              .eq('id', selectedChildForDetails.id);

                            if (error) {
                              console.warn(
                                '⚠️ Aviso: Não foi possível deletar do Supabase (RLS):',
                                error
                              );
                              console.log(
                                '🔄 Continuando com exclusão local para versão demo...'
                              );
                            }

                            // Remover data de nascimento do localStorage
                            const childBirthDates = JSON.parse(
                              localStorage.getItem('child-birth-dates') || '{}'
                            );
                            delete childBirthDates[selectedChildForDetails.id];
                            localStorage.setItem(
                              'child-birth-dates',
                              JSON.stringify(childBirthDates)
                            );

                            // Remover configurações da criança
                            const localAllowanceConfigs = localStorage.getItem(
                              'demo-allowance-configs'
                            );
                            const allowanceConfigs = localAllowanceConfigs
                              ? JSON.parse(localAllowanceConfigs)
                              : {};
                            delete allowanceConfigs[selectedChildForDetails.id];
                            localStorage.setItem(
                              'demo-allowance-configs',
                              JSON.stringify(allowanceConfigs)
                            );

                            const localInterestConfigs = localStorage.getItem(
                              'demo-interest-configs'
                            );
                            const interestConfigs = localInterestConfigs
                              ? JSON.parse(localInterestConfigs)
                              : {};
                            delete interestConfigs[selectedChildForDetails.id];
                            localStorage.setItem(
                              'demo-interest-configs',
                              JSON.stringify(interestConfigs)
                            );

                            // Remover criança do estado local também
                            setChildren(prevChildren =>
                              prevChildren.filter(
                                child => child.id !== selectedChildForDetails.id
                              )
                            );

                            console.log(
                              '✅ Criança deletada com sucesso (versão demo - exclusão local)'
                            );

                            // Fechar modal
                            setShowChildDetailsModal(false);
                            setSelectedChildForDetails(null);

                            alert(
                              `✅ ${selectedChildForDetails.name} foi removido(a) com sucesso!`
                            );
                          } catch (error) {
                            console.error('❌ Erro ao deletar criança:', error);
                            alert('❌ Erro interno ao deletar criança');
                          }
                        } else {
                          alert(
                            '❌ Confirmação incorreta. Criança não foi deletada.'
                          );
                        }
                      }
                    }}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/demo-child-view')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg"
          >
            👧 Ver como Criança
          </button>

          <button
            onClick={() => router.push('/system-overview')}
            className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-600"
          >
            ← Voltar ao Overview
          </button>
        </div>
      </div>
    </div>
  );
}
