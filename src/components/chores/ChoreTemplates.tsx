'use client';

import { useState, useEffect } from 'react';
import { ChoresService } from '@/lib/services/chores';
import type { ChoreTemplate, Child } from '@/lib/supabase';

interface ChoreTemplatesProps {
  familyId: string;
  children: Child[];
}

const CATEGORY_ICONS = {
  cleaning: '🧹',
  academic: '📚',
  pets: '🐕',
  outdoor: '🌳',
  helping: '🤝',
  other: '⭐'
};

const CATEGORY_COLORS = {
  cleaning: 'from-blue-400 to-blue-600',
  academic: 'from-purple-400 to-purple-600',
  pets: 'from-green-400 to-green-600',
  outdoor: 'from-orange-400 to-orange-600',
  helping: 'from-pink-400 to-pink-600',
  other: 'from-gray-400 to-gray-600'
};

export default function ChoreTemplates({ familyId, children }: ChoreTemplatesProps) {
  const [templates, setTemplates] = useState<ChoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChoreTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [familyId]);

  const loadTemplates = async () => {
    try {
      const data = await ChoresService.getChoreTemplates(familyId);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading chore templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Omit<ChoreTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    const newTemplate = await ChoresService.createChoreTemplate(templateData);
    if (newTemplate) {
      setTemplates(prev => [...prev, newTemplate]);
      setShowCreateForm(false);
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<ChoreTemplate>) => {
    const updatedTemplate = await ChoresService.updateChoreTemplate(id, updates);
    if (updatedTemplate) {
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      setEditingTemplate(null);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (await ChoresService.deleteChoreTemplate(id)) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const assignTemplateToChild = async (template: ChoreTemplate, childId: string) => {
    const assignedChore = await ChoresService.assignChore({
      chore_template_id: template.id,
      child_id: childId,
      name: template.name,
      description: template.description,
      reward_amount: template.reward_amount,
      priority: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    });

    if (assignedChore) {
      alert(`Tarefa "${template.name}" atribuída com sucesso!`);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modelos de Tarefas</h2>
          <p className="text-gray-600">Crie e gerencie modelos de tarefas para a família</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          ➕ Nova Tarefa
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTemplate) && (
        <ChoreTemplateForm
          familyId={familyId}
          template={editingTemplate}
          onSave={editingTemplate ? 
            (updates) => handleUpdateTemplate(editingTemplate.id, updates) :
            handleCreateTemplate
          }
          onCancel={() => {
            setShowCreateForm(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <ChoreTemplateCard
            key={template.id}
            template={template}
            children={children}
            onEdit={setEditingTemplate}
            onDelete={handleDeleteTemplate}
            onAssign={assignTemplateToChild}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum modelo de tarefa criado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro modelo de tarefa para começar a atribuir atividades às crianças
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ➕ Criar Primeira Tarefa
          </button>
        </div>
      )}
    </div>
  );
}

// Chore Template Card Component
function ChoreTemplateCard({ 
  template, 
  children, 
  onEdit, 
  onDelete, 
  onAssign 
}: {
  template: ChoreTemplate;
  children: Child[];
  onEdit: (template: ChoreTemplate) => void;
  onDelete: (id: string) => void;
  onAssign: (template: ChoreTemplate, childId: string) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-r ${CATEGORY_COLORS[template.category]} rounded-full shadow-lg`}>
          <span className="text-2xl">{CATEGORY_ICONS[template.category]}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">R$ {template.reward_amount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Recompensa</div>
          </div>
          {template.estimated_minutes && (
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{template.estimated_minutes}min</div>
              <div className="text-xs text-gray-500">Estimado</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Idade: {template.age_min}-{template.age_max} anos</span>
        <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
          {template.category.replace('_', ' ')}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowAssignMenu(!showAssignMenu)}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          👨‍👩‍👧‍👦 Atribuir para Criança
        </button>

        {showAssignMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => {
                  onAssign(template, child.id);
                  setShowAssignMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                <span className="text-2xl">{child.avatar}</span>
                <span className="font-medium">{child.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Chore Template Form Component  
function ChoreTemplateForm({
  familyId,
  template,
  onSave,
  onCancel
}: {
  familyId: string;
  template?: ChoreTemplate | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'cleaning' as ChoreTemplate['category'],
    reward_amount: template?.reward_amount || 5,
    estimated_minutes: template?.estimated_minutes || 30,
    age_min: template?.age_min || 5,
    age_max: template?.age_max || 18
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      family_id: familyId,
      is_active: true
    };

    onSave(data);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {template ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Nome da Tarefa *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              placeholder="Ex: Lavar a louça"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ChoreTemplate['category'] }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="cleaning">🧹 Limpeza</option>
              <option value="academic">📚 Estudos</option>
              <option value="pets">🐕 Animais</option>
              <option value="outdoor">🌳 Atividades Externas</option>
              <option value="helping">🤝 Ajuda em Casa</option>
              <option value="other">⭐ Outros</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-none"
            placeholder="Descreva a tarefa em detalhes..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Recompensa (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.50"
              value={formData.reward_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Tempo Estimado (min)
            </label>
            <input
              type="number"
              min="5"
              value={formData.estimated_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) || 30 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Idade Mínima
            </label>
            <input
              type="number"
              min="3"
              max="17"
              value={formData.age_min}
              onChange={(e) => setFormData(prev => ({ ...prev, age_min: parseInt(e.target.value) || 5 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Idade Máxima
            </label>
            <input
              type="number"
              min="4"
              max="18"
              value={formData.age_max}
              onChange={(e) => setFormData(prev => ({ ...prev, age_max: parseInt(e.target.value) || 18 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {template ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>
      </form>
    </div>
  );
}