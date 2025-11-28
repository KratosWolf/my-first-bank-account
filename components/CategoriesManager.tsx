import { useState, useEffect } from 'react';
import { CategoriesService, Category } from '../src/lib/services/categoriesService';

interface CategoriesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoriesManager({ isOpen, onClose }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    type: 'both' as 'spending' | 'dream' | 'both',
    color: '#3B82F6'
  });

  // Popular emojis para seleção
  const popularEmojis = [
    '🎮', '👕', '📚', '⚽', '📱', '🧸', '🍕', '📖', '✈️', '🎵',
    '🚗', '🏠', '💻', '🎨', '🎬', '🏃‍♂️', '🎯', '💡', '🌟', '🎁',
    '🛒', '💰', '🎪', '🎊', '🎈', '🎂', '🍔', '🍎', '🧩', '🎲',
    '📦', '🔧', '🎸', '🎤', '🏆', '⭐', '🌈', '🔥', '💎', '🎭'
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = () => {
    const loadedCategories = CategoriesService.getCategories();
    setCategories(loadedCategories);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    try {
      if (editingCategory) {
        // Editar categoria existente
        const updatedCategory = CategoriesService.updateCategory(editingCategory.id, formData);
        if (updatedCategory) {
          console.log('✅ Categoria atualizada:', updatedCategory);
          loadCategories();
          resetForm();
        }
      } else {
        // Adicionar nova categoria
        const newCategory = CategoriesService.addCategory(formData);
        console.log('✅ Nova categoria criada:', newCategory);
        loadCategories();
        resetForm();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria. Tente novamente.');
    }
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      const success = CategoriesService.deleteCategory(categoryId);
      if (success) {
        console.log('✅ Categoria excluída:', categoryId);
        loadCategories();
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      type: category.type,
      color: category.color || '#3B82F6'
    });
    setIsAddingNew(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📦',
      type: 'both',
      color: '#3B82F6'
    });
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  const handleResetToDefault = () => {
    if (confirm('Tem certeza que deseja resetar todas as categorias para o padrão? Esta ação não pode ser desfeita.')) {
      CategoriesService.resetToDefault();
      loadCategories();
      alert('✅ Categorias resetadas para o padrão!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            🏷️ Gerenciar Categorias
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
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
                  {editingCategory ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
                </h3>
                {!isAddingNew && (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
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
                      Nome da Categoria
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Eletrônicos, Brinquedos..."
                    />
                  </div>

                  {/* Emoji Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Escolha um Emoji
                    </label>
                    <div className="grid grid-cols-10 gap-2 mb-3">
                      {popularEmojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                          className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-100 transition-colors ${
                            formData.icon === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Emoji Input */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Emoji personalizado:</span>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value.slice(0, 2) }))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-lg"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tipo de Categoria
                    </label>
                    <div className="flex space-x-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="spending"
                          checked={formData.type === 'spending'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="mr-2"
                        />
                        <span className="text-sm">💰 Apenas Gastos</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="dream"
                          checked={formData.type === 'dream'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="mr-2"
                        />
                        <span className="text-sm">🎯 Apenas Sonhos</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="both"
                          checked={formData.type === 'both'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                          className="mr-2"
                        />
                        <span className="text-sm">🔄 Gastos e Sonhos</span>
                      </label>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cor (opcional)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview:</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{formData.icon}</span>
                      <div>
                        <span className="font-medium" style={{ color: formData.color }}>
                          {formData.name || 'Nome da categoria'}
                        </span>
                        <p className="text-sm text-gray-600">
                          Tipo: {formData.type === 'spending' ? 'Gastos' : 
                                formData.type === 'dream' ? 'Sonhos' : 'Gastos e Sonhos'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Categories List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📋 Categorias Existentes ({categories.length})
                </h3>
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  🔄 Resetar Padrão
                </button>
              </div>

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
                          <p className="text-xs text-gray-600">
                            {category.type === 'spending' ? '💰 Gastos' : 
                             category.type === 'dream' ? '🎯 Sonhos' : '🔄 Ambos'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Editar categoria"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Excluir categoria"
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
                        <span className="text-xs text-gray-500">{category.color}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
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
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Dica: Categorias do tipo "Ambos" aparecem tanto em gastos quanto em sonhos
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}