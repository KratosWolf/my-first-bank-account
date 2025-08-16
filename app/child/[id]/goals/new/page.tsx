'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const goalCategories = [
  { value: 'Brinquedos', label: 'Brinquedos', icon: '🧸' },
  { value: 'Jogos', label: 'Jogos', icon: '🎮' },
  { value: 'Livros', label: 'Livros', icon: '📚' },
  { value: 'Roupas', label: 'Roupas', icon: '👕' },
  { value: 'Eletrônicos', label: 'Eletrônicos', icon: '📱' },
  { value: 'Esportes', label: 'Esportes', icon: '⚽' },
  { value: 'Arte', label: 'Arte', icon: '🎨' },
  { value: 'Música', label: 'Música', icon: '🎵' },
  { value: 'Outros', label: 'Outros', icon: '🎯' },
];


const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '32rem',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem'
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#86198f'
};

const subtitleStyle = {
  color: '#a21caf',
  fontSize: '0.875rem'
};

const cardStyle = {
  background: 'white',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  background: 'white',
  color: '#374151',
  textDecoration: 'none',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const primaryBtnStyle = {
  ...btnStyle,
  background: '#a855f7',
  color: 'white',
  border: '1px solid #a855f7'
};

const outlineBtnStyle = {
  ...btnStyle,
  background: 'white',
  color: '#a855f7',
  border: '1px solid #a855f7'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const errorStyle = {
  padding: '0.75rem',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '0.5rem',
  marginBottom: '1rem'
};

const formGroupStyle = {
  marginBottom: '1.5rem'
};


export default function NewGoalPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Get icon from category
      const selectedCategory = goalCategories.find(cat => cat.value === formData.category);
      const categoryIcon = selectedCategory ? selectedCategory.icon : '🎯';
      
      // Simulate saving to localStorage for demo purposes
      const newGoal = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        progressPercent: 0,
        category: formData.category,
        icon: categoryIcon,
        isCompleted: false,
        createdAt: new Date().toISOString()
      };

      // Get existing goals from localStorage
      const existingGoals = JSON.parse(localStorage.getItem(`child-${childId}-goals`) || '[]');
      existingGoals.push(newGoal);
      
      // Save back to localStorage
      localStorage.setItem(`child-${childId}-goals`, JSON.stringify(existingGoals));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/child/${childId}/goals`);
    } catch (error) {
      console.error('Create goal error:', error);
      setError('Erro ao salvar objetivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        <div style={headerStyle}>
          <button
            onClick={() => router.push(`/child/${childId}/goals`)}
            style={{...btnStyle, marginRight: '1rem', padding: '0.5rem'}}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={titleStyle}>🎯 Novo Objetivo</h1>
            <p style={subtitleStyle}>Crie uma nova meta de poupança</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem'}}>Criar Objetivo</h2>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Defina o que você quer comprar e quanto precisa economizar
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={errorStyle}>
                <p style={{color: '#dc2626', fontSize: '0.875rem'}}>{error}</p>
              </div>
            )}

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="name">Nome do Objetivo</label>
              <input
                id="name"
                type="text"
                placeholder="Ex: Bicicleta nova"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="description">Descrição (opcional)</label>
              <textarea
                id="description"
                placeholder="Descreva seu objetivo..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="targetAmount">Valor do Objetivo (R$)</label>
              <input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Selecione uma categoria</option>
                {goalCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview da categoria selecionada */}
            {formData.category && (
              <div style={{...formGroupStyle, textAlign: 'center', padding: '1rem', background: '#faf5ff', borderRadius: '0.5rem', border: '1px solid #e9d5ff'}}>
                <p style={{fontSize: '0.875rem', color: '#86198f', marginBottom: '0.5rem'}}>Ícone do seu objetivo:</p>
                <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>
                  {goalCategories.find(cat => cat.value === formData.category)?.icon}
                </div>
                <p style={{fontSize: '0.875rem', color: '#a855f7', fontWeight: '500'}}>
                  {goalCategories.find(cat => cat.value === formData.category)?.label}
                </p>
              </div>
            )}

            <div style={{display: 'flex', gap: '0.75rem', paddingTop: '1rem'}}>
              <button
                type="button"
                onClick={() => router.push(`/child/${childId}/goals`)}
                style={{...outlineBtnStyle, flex: 1}}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...primaryBtnStyle, 
                  flex: 1,
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Criando...' : 'Criar Objetivo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}