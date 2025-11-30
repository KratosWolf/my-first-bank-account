import React, { useState, useEffect } from 'react';
import { AllowanceService } from '../src/lib/services/allowanceService';
import { ChildrenService } from '../src/lib/services/childrenService';
import type { AllowanceConfig, Child } from '../src/lib/supabase';

interface AllowanceConfigManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChildWithConfig {
  child: Child;
  config: AllowanceConfig | null;
}

const AllowanceConfigManager: React.FC<AllowanceConfigManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [children, setChildren] = useState<ChildWithConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para edição de cada filho
  const [editConfig, setEditConfig] = useState<Partial<AllowanceConfig>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar todas as crianças
      const childrenData = await ChildrenService.getChildren();

      // Buscar configurações de mesada
      const configs = await AllowanceService.getAllConfigs();

      // Combinar dados
      const combined: ChildWithConfig[] = childrenData.map(child => {
        const config = configs.find(c => c.child_id === child.id) || null;
        return { child, config };
      });

      setChildren(combined);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (childWithConfig: ChildWithConfig) => {
    setEditingChildId(childWithConfig.child.id);
    setEditConfig(
      childWithConfig.config || {
        amount: 20.0,
        frequency: 'weekly',
        day_of_week: 1, // Segunda-feira
        day_of_month: 1,
        is_active: true,
      }
    );
  };

  const cancelEditing = () => {
    setEditingChildId(null);
    setEditConfig({});
  };

  const saveConfig = async (childId: string) => {
    // Validar
    const validation = AllowanceService.validateConfig(editConfig);
    if (!validation.isValid) {
      alert('❌ Erro:\n\n' + validation.errors.join('\n'));
      return;
    }

    setIsSaving(true);
    try {
      const result = await AllowanceService.upsertConfig(childId, editConfig);

      if (result) {
        console.log('✅ Configuração salva:', result);
        await loadData();
        setEditingChildId(null);
        setEditConfig({});

        alert(
          `✅ Mesada configurada com sucesso!\n\n` +
            `Valor: R$ ${editConfig.amount?.toFixed(2)}\n` +
            `Frequência: ${AllowanceService.getFrequencyDescription(editConfig as AllowanceConfig)}\n` +
            `Próximo pagamento: ${AllowanceService.calculateNextPaymentDate(editConfig as AllowanceConfig)}`
        );
      } else {
        alert('❌ Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (childId: string, currentStatus: boolean) => {
    const confirm = window.confirm(
      currentStatus
        ? 'Deseja desativar a mesada automática?'
        : 'Deseja ativar a mesada automática?'
    );

    if (!confirm) return;

    try {
      const result = currentStatus
        ? await AllowanceService.deactivateConfig(childId)
        : await AllowanceService.activateConfig(childId);

      if (result) {
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            📅 Configurar Mesada Automática
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-blue-900 mb-1">
                  Como Funciona a Mesada Automática:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Cada filho pode ter uma configuração diferente (valor e
                    periodicidade)
                  </li>
                  <li>
                    • O dinheiro é depositado automaticamente no dia configurado
                  </li>
                  <li>• Você pode ativar/desativar a qualquer momento</li>
                  <li>
                    • Histórico de depósitos fica registrado nas transações
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          )}

          {/* Cards por filho */}
          {!isLoading && (
            <div className="space-y-6">
              {children.map(({ child, config }) => {
                const isEditing = editingChildId === child.id;

                return (
                  <div
                    key={child.id}
                    className={`border-2 rounded-xl p-6 ${
                      isEditing
                        ? 'border-blue-500 bg-blue-50'
                        : config?.is_active
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header do Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{child.avatar}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {child.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Saldo atual: R$ {(child.balance || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center space-x-2">
                          {config && (
                            <button
                              onClick={() =>
                                toggleActive(child.id, config.is_active)
                              }
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                config.is_active
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {config.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                            </button>
                          )}
                          <button
                            onClick={() => startEditing({ child, config })}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                          >
                            {config ? '✏️ Editar' : '➕ Configurar'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Modo Visualização */}
                    {!isEditing && config && (
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-bold text-green-700">
                            R$ {config.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frequência:</span>
                          <span className="font-medium text-gray-900">
                            {AllowanceService.getFrequencyDescription(config)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Próximo depósito:
                          </span>
                          <span className="font-medium text-blue-700">
                            {config.next_payment_date
                              ? new Date(
                                  config.next_payment_date
                                ).toLocaleDateString('pt-BR')
                              : 'Não definido'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Modo Edição */}
                    {isEditing && (
                      <div className="space-y-4">
                        {/* Valor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            💰 Valor da Mesada
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">
                              R$
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editConfig.amount || 0}
                              onChange={e =>
                                setEditConfig(prev => ({
                                  ...prev,
                                  amount: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>

                        {/* Frequência */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            📅 Periodicidade
                          </label>
                          <select
                            value={editConfig.frequency || 'weekly'}
                            onChange={e =>
                              setEditConfig(prev => ({
                                ...prev,
                                frequency: e.target.value as
                                  | 'daily'
                                  | 'weekly'
                                  | 'biweekly'
                                  | 'monthly',
                              }))
                            }
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                          >
                            <option value="daily">Todo dia</option>
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">
                              Quinzenal (dias 1 e 15)
                            </option>
                            <option value="monthly">Mensal</option>
                          </select>
                        </div>

                        {/* Dia da semana (se semanal) */}
                        {editConfig.frequency === 'weekly' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              🗓️ Dia da Semana
                            </label>
                            <select
                              value={editConfig.day_of_week || 1}
                              onChange={e =>
                                setEditConfig(prev => ({
                                  ...prev,
                                  day_of_week: parseInt(e.target.value),
                                }))
                              }
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                            >
                              <option value="0">Domingo</option>
                              <option value="1">Segunda-feira</option>
                              <option value="2">Terça-feira</option>
                              <option value="3">Quarta-feira</option>
                              <option value="4">Quinta-feira</option>
                              <option value="5">Sexta-feira</option>
                              <option value="6">Sábado</option>
                            </select>
                          </div>
                        )}

                        {/* Dia do mês (se mensal) */}
                        {editConfig.frequency === 'monthly' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              📆 Dia do Mês (1-28)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="28"
                              value={editConfig.day_of_month || 1}
                              onChange={e =>
                                setEditConfig(prev => ({
                                  ...prev,
                                  day_of_month: Math.min(
                                    28,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  ),
                                }))
                              }
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              * Limitado a 28 para garantir que funcione em
                              todos os meses
                            </p>
                          </div>
                        )}

                        {/* Toggle Ativo */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`active-${child.id}`}
                            checked={editConfig.is_active !== false}
                            onChange={e =>
                              setEditConfig(prev => ({
                                ...prev,
                                is_active: e.target.checked,
                              }))
                            }
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <label
                            htmlFor={`active-${child.id}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Ativar mesada automática
                          </label>
                        </div>

                        {/* Preview */}
                        {editConfig.amount && editConfig.amount > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              📊 Preview:
                            </p>
                            <p className="text-sm text-blue-800">
                              • Valor: R$ {editConfig.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-blue-800">
                              •{' '}
                              {AllowanceService.getFrequencyDescription(
                                editConfig as AllowanceConfig
                              )}
                            </p>
                            <p className="text-sm text-blue-800">
                              • Próximo depósito:{' '}
                              {new Date(
                                AllowanceService.calculateNextPaymentDate(
                                  editConfig as AllowanceConfig
                                )
                              ).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}

                        {/* Botões */}
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            disabled={isSaving}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => saveConfig(child.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Empty state (sem configuração) */}
                    {!isEditing && !config && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          Nenhuma mesada configurada ainda
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllowanceConfigManager;
