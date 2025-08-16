'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  cardBorderColor: string;
  icon: string;
  preview: {
    primaryBg: string;
    secondaryBg: string;
    textColor: string;
    borderColor: string;
  };
}

const familyThemes: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Oceano Azul',
    description: 'Tema inspirado no mar, perfeito para famílias que amam tranquilidade',
    primaryColor: '#3b82f6',
    secondaryColor: '#06b6d4',
    accentColor: '#14b8a6',
    backgroundGradient: 'linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)',
    cardBorderColor: '#bfdbfe',
    icon: '🌊',
    preview: {
      primaryBg: '#3b82f6',
      secondaryBg: '#e0f2fe',
      textColor: '#1e3a8a',
      borderColor: '#60a5fa'
    }
  },
  {
    id: 'forest',
    name: 'Floresta Verde',
    description: 'Tema natural e sustentável, ideal para famílias eco-conscientes',
    primaryColor: '#16a34a',
    secondaryColor: '#10b981',
    accentColor: '#84cc16',
    backgroundGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    cardBorderColor: '#bbf7d0',
    icon: '🌲',
    preview: {
      primaryBg: '#16a34a',
      secondaryBg: '#dcfce7',
      textColor: '#166534',
      borderColor: '#4ade80'
    }
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    description: 'Cores quentes e acolhedoras para famílias calorosas',
    primaryColor: '#ea580c',
    secondaryColor: '#f59e0b',
    accentColor: '#eab308',
    backgroundGradient: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)',
    cardBorderColor: '#fed7aa',
    icon: '🌅',
    preview: {
      primaryBg: '#ea580c',
      secondaryBg: '#fed7aa',
      textColor: '#9a3412',
      borderColor: '#fb923c'
    }
  },
  {
    id: 'galaxy',
    name: 'Galáxia Roxa',
    description: 'Tema espacial e mágico para famílias criativas',
    primaryColor: '#9333ea',
    secondaryColor: '#8b5cf6',
    accentColor: '#d946ef',
    backgroundGradient: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)',
    cardBorderColor: '#e9d5ff',
    icon: '✨',
    preview: {
      primaryBg: '#9333ea',
      secondaryBg: '#f3e8ff',
      textColor: '#6b21a8',
      borderColor: '#a855f7'
    }
  },
  {
    id: 'strawberry',
    name: 'Morango Doce',
    description: 'Tema doce e divertido, perfeito para famílias joviais',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    accentColor: '#ef4444',
    backgroundGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)',
    cardBorderColor: '#fbcfe8',
    icon: '🍓',
    preview: {
      primaryBg: '#ec4899',
      secondaryBg: '#fce7f3',
      textColor: '#be185d',
      borderColor: '#f472b6'
    }
  },
  {
    id: 'classic',
    name: 'Clássico Neutro',
    description: 'Tema elegante e atemporal para todas as famílias',
    primaryColor: '#6b7280',
    secondaryColor: '#64748b',
    accentColor: '#71717a',
    backgroundGradient: 'linear-gradient(135deg, #f9fafb 0%, #f8fafc 100%)',
    cardBorderColor: '#e5e7eb',
    icon: '🎨',
    preview: {
      primaryBg: '#6b7280',
      secondaryBg: '#f3f4f6',
      textColor: '#374151',
      borderColor: '#9ca3af'
    }
  }
];

const containerStyle = {
  minHeight: '100vh',
  padding: '1rem'
};

const maxWidthStyle = {
  maxWidth: '80rem',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap' as 'wrap',
  gap: '1rem'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem'
};

const cardStyle = {
  background: 'white',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  marginBottom: '1.5rem'
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
  display: 'inline-block'
};

const primaryBtnStyle = {
  ...btnStyle,
  background: '#3b82f6',
  color: 'white',
  border: '1px solid #3b82f6',
  padding: '1rem 2rem',
  fontSize: '1.125rem',
  fontWeight: '600'
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)'
};

export default function FamilyThemesPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState('ocean');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = () => {
    try {
      const savedTheme = localStorage.getItem('familyTheme');
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
      setInitialLoading(false);
    } catch (error) {
      console.error('Error loading theme:', error);
      setInitialLoading(false);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('familyTheme', selectedTheme);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = familyThemes.find(theme => theme.id === selectedTheme) || familyThemes[0];

  if (initialLoading) {
    return (
      <div style={loadingStyle}>
        <div style={{textAlign: 'center'}}>
          <div className="spin" style={{
            width: '48px', 
            height: '48px', 
            border: '3px solid #3b82f6', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px'
          }}></div>
          <p style={{color: '#1e3a8a'}}>Carregando temas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{...containerStyle, background: currentTheme.backgroundGradient}}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Link href="/parent/dashboard" style={{...btnStyle, marginRight: '1rem'}}>
              ← Voltar
            </Link>
            <div>
              <h1 style={{...titleStyle, color: currentTheme.preview.textColor}}>
                🎨 Temas da Família
              </h1>
              <p style={{color: currentTheme.preview.textColor, opacity: 0.8}}>
                Escolha o tema visual perfeito para sua família
              </p>
            </div>
          </div>
        </div>

        {/* Current Theme Preview */}
        <div style={{...cardStyle, border: `2px solid ${currentTheme.cardBorderColor}`, background: 'rgba(255, 255, 255, 0.9)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
            <span style={{fontSize: '2rem'}}>{currentTheme.icon}</span>
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: currentTheme.preview.textColor}}>
                Tema Atual: {currentTheme.name}
              </h2>
              <p style={{color: '#6b7280'}}>{currentTheme.description}</p>
            </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
            <div style={{textAlign: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #e5e7eb'}}>
              <div style={{
                width: '2rem', 
                height: '2rem', 
                background: currentTheme.preview.primaryBg, 
                borderRadius: '50%', 
                margin: '0 auto 0.5rem'
              }}></div>
              <p style={{fontSize: '0.875rem', fontWeight: '500'}}>Cor Primária</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #e5e7eb'}}>
              <div style={{
                width: '2rem', 
                height: '2rem', 
                background: currentTheme.preview.secondaryBg, 
                borderRadius: '50%', 
                margin: '0 auto 0.5rem',
                border: `2px solid ${currentTheme.preview.borderColor}`
              }}></div>
              <p style={{fontSize: '0.875rem', fontWeight: '500'}}>Cor Secundária</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #e5e7eb'}}>
              <div style={{
                width: '100%', 
                height: '1rem', 
                background: currentTheme.backgroundGradient, 
                borderRadius: '0.25rem', 
                margin: '0 auto 0.5rem'
              }}></div>
              <p style={{fontSize: '0.875rem', fontWeight: '500'}}>Fundo</p>
            </div>
            <div style={{textAlign: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'white', border: '1px solid #e5e7eb'}}>
              <div style={{
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: currentTheme.preview.textColor, 
                marginBottom: '0.5rem'
              }}>Aa</div>
              <p style={{fontSize: '0.875rem', fontWeight: '500'}}>Texto</p>
            </div>
          </div>
        </div>

        {/* Theme Selection Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          {familyThemes.map((theme) => (
            <div 
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                border: selectedTheme === theme.id 
                  ? `3px solid ${theme.preview.primaryBg}` 
                  : '1px solid #e5e7eb',
                background: selectedTheme === theme.id 
                  ? 'rgba(255, 255, 255, 0.95)' 
                  : 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedTheme !== theme.id) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTheme !== theme.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <span style={{fontSize: '2rem'}}>{theme.icon}</span>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: selectedTheme === theme.id ? theme.preview.textColor : '#374151',
                      marginBottom: '0.25rem'
                    }}>
                      {theme.name}
                    </h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      {theme.description}
                    </p>
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    background: theme.preview.primaryBg,
                    color: 'white',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Selecionado
                  </div>
                )}
              </div>

              {/* Mini Preview */}
              <div style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                background: theme.backgroundGradient,
                marginBottom: '1rem'
              }}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem'}}>
                  <div style={{height: '0.5rem', background: theme.preview.primaryBg, borderRadius: '0.25rem'}}></div>
                  <div style={{
                    height: '0.5rem', 
                    background: theme.preview.secondaryBg, 
                    borderRadius: '0.25rem',
                    border: `1px solid ${theme.preview.borderColor}`
                  }}></div>
                  <div style={{
                    height: '0.5rem', 
                    background: 'white', 
                    borderRadius: '0.25rem',
                    border: `1px solid ${theme.preview.borderColor}`
                  }}></div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: theme.preview.textColor,
                  opacity: 0.8
                }}>
                  Preview do tema
                </div>
              </div>

              {/* Color Palette */}
              <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                <div 
                  style={{
                    width: '1.5rem', 
                    height: '1.5rem', 
                    background: theme.preview.primaryBg, 
                    borderRadius: '50%'
                  }} 
                  title="Cor Primária"
                ></div>
                <div 
                  style={{
                    width: '1.5rem', 
                    height: '1.5rem', 
                    background: theme.preview.secondaryBg, 
                    borderRadius: '50%',
                    border: `2px solid ${theme.preview.borderColor}`
                  }} 
                  title="Cor Secundária"
                ></div>
                <div 
                  style={{
                    width: '1.5rem', 
                    height: '1.5rem', 
                    background: theme.backgroundGradient, 
                    borderRadius: '50%',
                    border: '2px solid #e5e7eb'
                  }} 
                  title="Fundo"
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              background: currentTheme.preview.primaryBg
            }}
          >
            {loading ? 'Salvando...' : saved ? '✓ Tema Salvo!' : 'Salvar Tema Escolhido'}
          </button>
        </div>

        {/* Features Info */}
        <div style={{...cardStyle, background: 'rgba(255, 255, 255, 0.8)'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem'}}>
            💡 Como Funciona
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div>
              <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>✨ Personalização Completa</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                O tema escolhido será aplicado em toda a experiência da família, 
                incluindo dashboards das crianças e dos pais.
              </p>
            </div>
            <div>
              <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>🎯 Engajamento das Crianças</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                Temas coloridos e divertidos tornam o aprendizado financeiro 
                mais atrativo e envolvente para as crianças.
              </p>
            </div>
            <div>
              <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>👨‍👩‍👧‍👦 Identidade Familiar</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                Cada família pode ter sua própria identidade visual única 
                que reflete sua personalidade.
              </p>
            </div>
            <div>
              <h3 style={{fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>📱 Responsivo</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                Todos os temas são otimizados para funcionar perfeitamente 
                em dispositivos móveis e desktop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}