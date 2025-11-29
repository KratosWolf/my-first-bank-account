'use client';

import { useState } from 'react';

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

interface ChildFormProps {
  onSave: (data: { name: string; pin: string; avatar: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errors?: { [key: string]: string };
  editingChild?: Child | null;
}

const AVATARS = ['👧', '👦', '🧒', '👶', '🐱', '🐶', '🦊', '🐼'];

export default function ChildForm({
  onSave,
  onCancel,
  isSubmitting,
  errors,
  editingChild,
}: ChildFormProps) {
  const [formData, setFormData] = useState({
    name: editingChild?.name || '',
    pin: editingChild?.pin || '',
    avatar: editingChild?.avatar || '👧',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingChild ? 'Editar Criança' : 'Adicionar Nova Criança'}
        </h3>

        {errors?.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Criança
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o nome..."
              maxLength={50}
            />
            {errors?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN de 4 dígitos
            </label>
            <input
              type="password"
              value={formData.pin}
              onChange={e =>
                setFormData({
                  ...formData,
                  pin: e.target.value.replace(/\D/g, ''),
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest ${
                errors?.pin ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0000"
              maxLength={4}
            />
            {errors?.pin && (
              <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha um Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`p-3 text-2xl rounded-lg border-2 hover:bg-gray-50 ${
                    formData.avatar === avatar
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
