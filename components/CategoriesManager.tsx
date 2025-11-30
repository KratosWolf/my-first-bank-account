import { useState, useEffect } from 'react';
import {
  CategoriesService,
  Category,
} from '../src/lib/services/categoriesService';

interface CategoriesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoriesManager({
  isOpen,
  onClose,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#3B82F6',
    monthly_limit: 0,
    quarterly_limit: 0,
    enabled: true,
  });

  // Popular emojis para seleção
  const popularEmojis = [
    '🎮',
    '👕',
    '📚',
    '⚽',
    '📱',
    '🧸',
    '🍕',
    '📖',
    '✈️',
    '🎵',
    '🚗',
    '🏠',
    '💻',
    '🎨',
    '🎬',
    '🏃‍♂️',
    '🎯',
    '💡',
    '🌟',
    '🎁',
    '🛒',
    '💰',
    '🎪',
    '🎊',
    '🎈',
    '🎂',
    '🍔',
    '🍎',
    '🧩',
    '🎲',
    '📦',
    '🔧',
    '🎸',
    '🎤',
    '🏆',
    '⭐',
    '🌈',
    '🔥',
    '💎',
    '🎭',
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const loadedCategories = await CategoriesService.getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    if (formData.monthly_limit < 0 || formData.quarterly_limit < 0) {
      alert('Limites não podem ser negativos');
      return;
    }

    // Validar formato da cor (deve ser hexadecimal)
    if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
      alert('Cor inválida. Use formato hexadecimal (ex: #3B82F6)');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        // Editar categoria existente
        console.log('📝 Atualizando categoria:', editingCategory.id, formData);
        const updatedCategory = await CategoriesService.updateCategory(
          editingCategory.id,
          formData
        );
        if (updatedCategory) {
          console.log('✅ Categoria atualizada:', updatedCategory);
          await loadCategories();
          resetForm();
          alert('✅ Categoria atualizada com sucesso!');
        } else {
          throw new Error('Falha ao atualizar categoria');
        }
      } else {
        // Adicionar nova categoria
        console.log('📝 Criando nova categoria:', formData);
        const newCategory = await CategoriesService.addCategory(formData);
        if (newCategory) {
          console.log('✅ Nova categoria criada:', newCategory);
          await loadCategories();
          resetForm();
          alert('✅ Categoria criada com sucesso!');
        } else {
          throw new Error('Falha ao criar categoria');
        }
      }
    } catch (error: any) {
      console.error('❌ ERRO DETALHADO ao salvar categoria:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error,
      });
      alert(
        `Erro ao salvar categoria: ${error.message || 'Erro desconhecido'}\n\nVerifique o console para mais detalhes.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (
      confirm(
        'Tem certeza que deseja desabilitar esta categoria? Ela não aparecerá mais nas listas, mas dados históricos serão mantidos.'
      )
    ) {
      setIsLoading(true);
      try {
        const success = await CategoriesService.deleteCategory(categoryId);
        if (success) {
          console.log('✅ Categoria desabilitada:', categoryId);
          await loadCategories();
          alert('✅ Categoria desabilitada com sucesso!');
        } else {
          throw new Error('Falha ao desabilitar categoria');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color || '#3B82F6',
      monthly_limit: category.monthly_limit || 0,
      quarterly_limit: category.quarterly_limit || 0,
      enabled: category.enabled,
    });
    setIsAddingNew(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📦',
      color: '#3B82F6',
      monthly_limit: 0,
      quarterly_limit: 0,
      enabled: true,
    });
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            🏷️ Gerenciar Categorias de Gasto
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
            {/* Add/Edit Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory
                    ? '✏️ Editar Categoria'
                    : '➕ Nova Categoria'}
                </h3>
                {!isAddingNew && (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    disabled={isLoading}
                  >
                    + Adicionar
                  </button>
                )}
              </div>

              {(isAddingNew || editingCategory) && (
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Ex: Brinquedos e Jogos, Lanches..."
                      disabled={isSaving}
                    />
                  </div>

                  {/* Emoji Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Escolha um Emoji *
                    </label>
                    <div className="grid grid-cols-10 gap-2 mb-3">
                      {popularEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({ ...prev, icon: emoji }))
                          }
                          className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-100 transition-colors ${
                            formData.icon === emoji
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                          disabled={isSaving}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Custom Emoji Input */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Emoji personalizado:
                      </span>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            icon: e.target.value.slice(0, 2),
                          }))
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-lg"
                        maxLength={2}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cor da Categoria
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            color: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        disabled={isSaving}
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={e => {
                          const value = e.target.value.toUpperCase();
                          // Apenas permitir valores que começam com # e têm até 7 caracteres
                          if (value.match(/^#[0-9A-F]{0,6}$/)) {
                            setFormData(prev => ({ ...prev, color: value }));
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 font-mono"
                        placeholder="#3B82F6"
                        maxLength={7}
                        disabled={isSaving}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formato hexadecimal (ex: #3B82F6)
                    </p>
                  </div>

                  {/* Limites de Gasto */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        💰 Limite Mensal (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.monthly_limit}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            monthly_limit: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="0.00"
                        disabled={isSaving}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Limite aplicado a TODAS as crianças
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        📅 Limite Trimestral (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quarterly_limit}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            quarterly_limit: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="0.00"
                        disabled={isSaving}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Limite a cada 3 meses
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Preview:
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{formData.icon}</span>
                        <div>
                          <span
                            className="font-medium"
                            style={{ color: formData.color }}
                          >
                            {formData.name || 'Nome da categoria'}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="mr-3">
                              💰 Mensal: R$ {formData.monthly_limit.toFixed(2)}
                            </span>
                            <span>
                              📅 Trimestral: R${' '}
                              {formData.quarterly_limit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                      disabled={isSaving}
                    >
                      {isSaving
                        ? '⏳ Salvando...'
                        : editingCategory
                          ? 'Salvar Alterações'
                          : 'Adicionar Categoria'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Categories List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📋 Categorias Cadastradas ({categories.length})
                </h3>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">⏳</div>
                  <p className="text-gray-600">Carregando categorias...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-gray-600">Nenhuma categoria encontrada</p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Criar Primeira Categoria
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {category.name}
                            </h4>
                            <div className="text-xs text-gray-600 mt-1">
                              <div>
                                💰 Mensal: R${' '}
                                {category.monthly_limit.toFixed(2)}
                              </div>
                              <div>
                                📅 Trimestral: R${' '}
                                {category.quarterly_limit.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Editar categoria"
                            disabled={isLoading}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Desabilitar categoria"
                            disabled={isLoading}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {category.color && (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-xs text-gray-500">
                            {category.color}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Dica: Limites são globais e aplicam-se a todas as crianças
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
