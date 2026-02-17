import { useState, useEffect } from 'react';
import {
  InterestService,
  InterestConfigWithChild,
} from '../src/lib/services/interestService';
import { ChildrenService } from '../src/lib/services/childrenService';
import type { Child } from '../src/lib/supabase';

interface InterestConfigManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterestConfigManager({
  isOpen,
  onClose,
}: InterestConfigManagerProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [currentConfig, setCurrentConfig] =
    useState<InterestConfigWithChild | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Configuração global (aplicada a todos os filhos)
  const [globalConfig, setGlobalConfig] = useState({
    monthly_rate: 9.9, // Taxa mensal em %
    compound_frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    minimum_balance: 5.0,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar crianças
      const childrenData = await ChildrenService.getChildren();
      setChildren(childrenData);

      // Carregar configuração existente (pegamos a primeira encontrada como base)
      const configs = await InterestService.getAllConfigs();
      if (configs.length > 0) {
        const firstConfig = configs[0];
        setCurrentConfig(firstConfig);
        setGlobalConfig({
          monthly_rate: firstConfig.monthly_rate,
          compound_frequency: firstConfig.compound_frequency,
          minimum_balance: firstConfig.minimum_balance,
          is_active: firstConfig.is_active,
        });
      }

      console.log('💰 Dados carregados:', {
        children: childrenData.length,
        configs: configs.length,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      alert('Erro ao carregar configurações. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validar taxa
    const rateValidation = InterestService.validateRate(
      globalConfig.monthly_rate
    );
    if (!rateValidation.isValid) {
      alert(
        rateValidation.error +
          (rateValidation.warning ? '\n\n' + rateValidation.warning : '')
      );
      return;
    }

    // Validar saldo mínimo
    const balanceValidation = InterestService.validateMinimumBalance(
      globalConfig.minimum_balance
    );
    if (!balanceValidation.isValid) {
      alert(
        balanceValidation.error +
          (balanceValidation.warning ? '\n\n' + balanceValidation.warning : '')
      );
      return;
    }

    setIsSaving(true);
    try {
      console.log(
        '💰 Salvando configuração global para todos os filhos:',
        globalConfig
      );

      // Aplicar a mesma configuração para TODOS os filhos
      let successCount = 0;
      let errorCount = 0;

      for (const child of children) {
        const result = await InterestService.upsertConfig(
          child.id,
          globalConfig
        );
        if (result) {
          successCount++;
          console.log(`✅ Config salva para ${child.name}`);
        } else {
          errorCount++;
          console.error(`❌ Erro ao salvar config para ${child.name}`);
        }
      }

      if (successCount > 0) {
        await loadData(); // Recarregar dados
        alert(
          `✅ Configuração de juros aplicada com sucesso!\n\n` +
            `${successCount} ${successCount === 1 ? 'criança configurada' : 'crianças configuradas'}\n` +
            `Taxa: ${globalConfig.monthly_rate}% ao mês`
        );
      }

      if (errorCount > 0) {
        alert(
          `⚠️ ${errorCount} ${errorCount === 1 ? 'erro ocorreu' : 'erros ocorreram'}. Verifique o console.`
        );
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      alert(
        `Erro ao salvar configuração: ${error.message || 'Erro desconhecido'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleGlobal = async () => {
    const newStatus = !globalConfig.is_active;
    setIsSaving(true);

    try {
      // Ativar/desativar para todos os filhos
      let successCount = 0;
      for (const child of children) {
        const success = newStatus
          ? await InterestService.activateConfig(child.id)
          : await InterestService.deactivateConfig(child.id);
        if (success) successCount++;
      }

      if (successCount > 0) {
        setGlobalConfig(prev => ({ ...prev, is_active: newStatus }));
        await loadData();
        alert(
          newStatus
            ? '✅ Juros ativados para todos!'
            : '✅ Juros desativados para todos!'
        );
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      alert('Erro ao alterar status. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculatePreview = (balance: number) => {
    return InterestService.calculatePreview(
      balance,
      globalConfig.monthly_rate,
      globalConfig.compound_frequency
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            💰 Configuração Global de Rendimento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Info about monthly rate */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Taxa Mensal Configurável
                  </h4>
                  <p className="text-sm text-blue-800">
                    Configure a taxa mensal de <strong>0% até 100%</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    💡 Exemplo: 9.9% ao mês = 211% ao ano (juros compostos).
                    Recomendado: 1% a 2% ao mês para educação financeira
                    realista.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Como Funciona o Rendimento
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Apenas dinheiro que está na conta{' '}
                      <strong>há 30+ dias</strong> rende juros
                    </li>
                    <li>
                      • Juros são aplicados automaticamente todo mês (dia 1º)
                    </li>
                    <li>
                      • <strong>Configuração única</strong> aplicada a todos os
                      filhos
                    </li>
                    <li>
                      • Saldo mínimo: apenas saldos acima deste valor rendem
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Global Configuration Form */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      ⚙️ Configuração Global
                    </h3>
                    <button
                      onClick={handleToggleGlobal}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        globalConfig.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                      disabled={isSaving}
                    >
                      {globalConfig.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Taxa Mensal - Editável */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        📈 Taxa Mensal de Rendimento
                      </label>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Taxa Mensal (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={globalConfig.monthly_rate}
                          onChange={e =>
                            setGlobalConfig(prev => ({
                              ...prev,
                              monthly_rate: Math.min(
                                100,
                                Math.max(0, parseFloat(e.target.value) || 0)
                              ),
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg text-center font-bold text-3xl text-green-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={isSaving}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Exemplo: {globalConfig.monthly_rate}% ao mês = ~
                          {(globalConfig.monthly_rate * 12).toFixed(1)}% ao ano
                          (simples)
                        </p>
                      </div>

                      {/* Slider Visual */}
                      <div className="mt-4">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.1"
                          value={Math.min(20, globalConfig.monthly_rate)}
                          onChange={e =>
                            setGlobalConfig(prev => ({
                              ...prev,
                              monthly_rate: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          disabled={isSaving}
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>0%</span>
                          <span>10%</span>
                          <span>20%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          💡 Slider limitado a 20% para facilidade. Digite acima
                          para valores maiores (até 100%).
                        </p>
                      </div>
                    </div>

                    {/* Saldo Mínimo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        💵 Saldo Mínimo para Render (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        step="0.10"
                        value={globalConfig.minimum_balance}
                        onChange={e =>
                          setGlobalConfig(prev => ({
                            ...prev,
                            minimum_balance: Math.max(
                              0,
                              parseFloat(e.target.value) || 0
                            ),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold"
                        disabled={isSaving}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Apenas saldos acima deste valor renderão juros.
                        Recomendado: R$ 5,00 a R$ 50,00
                      </p>
                    </div>

                    {/* Frequência */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        📅 Frequência de Aplicação
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            value: 'monthly',
                            label: 'Mensal',
                            icon: '📆',
                            recommended: true,
                          },
                          {
                            value: 'weekly',
                            label: 'Semanal',
                            icon: '📅',
                            recommended: false,
                          },
                          {
                            value: 'daily',
                            label: 'Diário',
                            icon: '📌',
                            recommended: false,
                          },
                        ].map(freq => (
                          <button
                            key={freq.value}
                            type="button"
                            onClick={() =>
                              setGlobalConfig(prev => ({
                                ...prev,
                                compound_frequency: freq.value as any,
                              }))
                            }
                            className={`relative px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                              globalConfig.compound_frequency === freq.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                            disabled={isSaving}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-2xl mb-1">{freq.icon}</span>
                              <span>{freq.label}</span>
                              {freq.recommended && (
                                <span className="text-xs text-green-600 mt-1">
                                  ⭐ Recomendado
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-colors"
                        disabled={isSaving}
                      >
                        {isSaving
                          ? '⏳ Salvando...'
                          : '💾 Salvar Configuração Global'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview por Filho */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📊 Preview de Rendimento por Filho
                  </h3>

                  {children.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">👶</div>
                      <p className="text-gray-600">
                        Nenhuma criança cadastrada
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {children.map(child => {
                        const preview = calculatePreview(child.balance || 0);
                        const eligibleBalance =
                          child.balance >= globalConfig.minimum_balance;

                        return (
                          <div
                            key={child.id}
                            className={`border-2 rounded-lg p-4 transition-all ${
                              eligibleBalance
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-3xl">{child.avatar}</span>
                                <div>
                                  <h4 className="font-bold text-gray-900">
                                    {child.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Saldo:{' '}
                                    <strong>
                                      R$ {(child.balance || 0).toFixed(2)}
                                    </strong>
                                  </p>
                                </div>
                              </div>

                              {eligibleBalance ? (
                                <span className="text-green-600 text-2xl">
                                  ✅
                                </span>
                              ) : (
                                <span className="text-gray-400 text-2xl">
                                  🔒
                                </span>
                              )}
                            </div>

                            {eligibleBalance ? (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Por mês:
                                  </span>
                                  <span className="font-bold text-green-700">
                                    ~R$ {preview.monthly.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Por ano:
                                  </span>
                                  <span className="font-bold text-green-700">
                                    ~R$ {preview.yearly.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Com {globalConfig.monthly_rate}% ao mês
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                <p>
                                  Saldo abaixo do mínimo de R${' '}
                                  {globalConfig.minimum_balance.toFixed(2)}
                                </p>
                                <p className="text-xs mt-1">
                                  Não renderá juros até atingir o mínimo
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Configuração única aplicada a <strong>todos os filhos</strong>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={isSaving}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
