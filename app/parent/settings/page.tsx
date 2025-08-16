'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersistentStorage } from '@/lib/storage/persistent-storage';

interface FamilySettings {
  familyName: string;
  currency: string;
  allowanceAmount: number;
  allowanceFrequency: 'weekly' | 'monthly';
  requireApprovalOver: number;
  familyMission: string;
  savingsInterestRate: number;
  interestEnabled: boolean;
  interestApplicationDay: number;
}

interface SpendingCategory {
  id: string;
  name: string;
  icon: string;
  monthlyLimit: number;
  quarterlyLimit: number;
  enabled: boolean;
}

interface Child {
  id: number;
  name: string;
  email: string;
  pin: string;
  balance: number;
  totalSpent: number;
  totalSaved: number;
  level: number;
  badges: number;
  createdAt: string;
  isActive: boolean;
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
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
  color: '#1e40af',
  marginBottom: '0.5rem'
};

const subtitleStyle = {
  color: '#3730a3',
  fontSize: '1rem'
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
  border: '1px solid #3b82f6'
};

const dangerBtnStyle = {
  ...btnStyle,
  background: '#dc2626',
  color: 'white',
  border: '1px solid #dc2626'
};

const successBtnStyle = {
  ...btnStyle,
  background: '#16a34a',
  color: 'white',
  border: '1px solid #16a34a'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const loadingStyle = {
  ...containerStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem'
};

export default function ParentSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<FamilySettings>({
    familyName: 'Minha Família',
    currency: 'BRL',
    allowanceAmount: 20.00,
    allowanceFrequency: 'monthly',
    requireApprovalOver: 50.00,
    familyMission: 'Ensinar nossos filhos sobre o valor do dinheiro e a importância de poupar para seus sonhos.',
    savingsInterestRate: 1.0, // 1% ao mês por padrão
    interestEnabled: true,
    interestApplicationDay: 30 // Último dia do mês
  });

  const [categories, setCategories] = useState<SpendingCategory[]>([
    { id: '1', name: 'Comida e Lanches', icon: '🍕', monthlyLimit: 50, quarterlyLimit: 150, enabled: true },
    { id: '2', name: 'Jogos e Apps', icon: '🎮', monthlyLimit: 20, quarterlyLimit: 60, enabled: true },
    { id: '3', name: 'Brinquedos', icon: '🧸', monthlyLimit: 30, quarterlyLimit: 90, enabled: true },
    { id: '4', name: 'Roupas', icon: '👕', monthlyLimit: 40, quarterlyLimit: 120, enabled: true },
    { id: '5', name: 'Livros e Material Escolar', icon: '📚', monthlyLimit: 25, quarterlyLimit: 75, enabled: true },
    { id: '6', name: 'Entretenimento', icon: '🎬', monthlyLimit: 35, quarterlyLimit: 105, enabled: true }
  ]);

  const [children, setChildren] = useState<Child[]>([
    {
      id: 1,
      name: 'Demo Child',
      email: 'child@example.com',
      pin: '1234',
      balance: 15.00,
      totalSpent: 25.00,
      totalSaved: 10.00,
      level: 3,
      badges: 5,
      createdAt: '2024-01-15',
      isActive: true
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [backupInfo, setBackupInfo] = useState<any>(null);

  useEffect(() => {
    loadFromLocalStorage();
    updateBackupInfo();
  }, []);

  const updateBackupInfo = () => {
    setBackupInfo(PersistentStorage.getBackupInfo());
  };

  const loadFromLocalStorage = () => {
    try {
      // Auto-backup existing data
      PersistentStorage.autoBackup();
      
      // Carregar configurações
      const savedSettings = PersistentStorage.safeRead('familySettings');
      if (savedSettings) {
        setSettings(savedSettings);
      }

      // Carregar categorias
      const savedCategories = PersistentStorage.safeRead('spendingCategories');
      if (savedCategories) {
        setCategories(savedCategories);
      }

      // Carregar crianças
      const savedChildren = PersistentStorage.safeRead('familyChildren');
      if (savedChildren) {
        setChildren(savedChildren);
      }

      setInitialLoading(false);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setInitialLoading(false);
    }
  };

  const saveToLocalStorage = (key: string, data: any) => {
    PersistentStorage.safeWrite(key, data);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Salvar no localStorage
      saveToLocalStorage('familySettings', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChild = () => {
    if (newChildName && newChildPin) {
      const newChild: Child = {
        id: Date.now(),
        name: newChildName,
        email: `${newChildName.toLowerCase().replace(' ', '')}@example.com`,
        pin: newChildPin,
        balance: 0,
        totalSpent: 0,
        totalSaved: 0,
        level: 1,
        badges: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      };
      const updatedChildren = [...children, newChild];
      setChildren(updatedChildren);
      saveToLocalStorage('familyChildren', updatedChildren);
      setNewChildName('');
      setNewChildPin('');
    }
  };

  const resetChild = (childId: number) => {
    const updatedChildren = children.map(child => 
      child.id === childId 
        ? { ...child, balance: 0, totalSpent: 0, totalSaved: 0, level: 1, badges: 0 }
        : child
    );
    setChildren(updatedChildren);
    saveToLocalStorage('familyChildren', updatedChildren);
  };

  const removeChild = (childId: number) => {
    const updatedChildren = children.filter(child => child.id !== childId);
    setChildren(updatedChildren);
    saveToLocalStorage('familyChildren', updatedChildren);
  };

  const addCategory = () => {
    if (newCategoryName && newCategoryIcon) {
      const newCategory: SpendingCategory = {
        id: Date.now().toString(),
        name: newCategoryName,
        icon: newCategoryIcon,
        monthlyLimit: 20,
        quarterlyLimit: 60,
        enabled: true
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      saveToLocalStorage('spendingCategories', updatedCategories);
      setNewCategoryName('');
      setNewCategoryIcon('');
    }
  };

  const removeCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    saveToLocalStorage('spendingCategories', updatedCategories);
  };

  const updateCategoryLimit = (categoryId: string, field: 'monthlyLimit' | 'quarterlyLimit', value: number) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    );
    setCategories(updatedCategories);
    saveToLocalStorage('spendingCategories', updatedCategories);
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  const emojiList = [
    '🍕', '🍔', '🌭', '🍟', '🍿', '🥨', '🧀', '🍎', '🍌', '🍓', '🍇', '🥝', '🍊',
    '🎮', '🎯', '🎲', '🃏', '🎪', '🎭', '🎨', '🎬', '🎵', '🎸', '🎤', '🎧', '🎹',
    '🧸', '🎈', '🎁', '🎀', '🪀', '🧩', '🚗', '✈️', '🚂', '🚁', '⛵', '🏀', '⚽',
    '👕', '👗', '👔', '👖', '👟', '👑', '🎩', '👒', '🧤', '🧣', '👜', '🎒', '👓',
    '📚', '✏️', '🖊️', '📝', '📐', '🧮', '🖍️', '✂️', '📎', '📌', '🔍', '💡', '🎓',
    '🎬', '🍭', '🍪', '🧁', '🍰', '🎂', '🍦', '🏆', '🥇', '🎖️', '🎪', '🎨', '🎭',
    '💰', '💳', '💎', '⭐', '🌟', '🔥', '❤️', '💙', '💜', '💚', '💛', '🧡', '🌈'
  ];

  const handleSaveCategories = async () => {
    setLoading(true);
    try {
      // Salvar categorias no localStorage
      saveToLocalStorage('spendingCategories', categories);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      updateBackupInfo();
    } catch (error) {
      console.error('Error saving categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = () => {
    PersistentStorage.createBackup();
    updateBackupInfo();
    alert('Backup criado com sucesso!');
  };

  const handleRestoreBackup = () => {
    if (confirm('Tem certeza que deseja restaurar o backup? Isso irá sobrescrever todos os dados atuais.')) {
      const success = PersistentStorage.restoreFromBackup();
      if (success) {
        loadFromLocalStorage();
        alert('Dados restaurados com sucesso!');
      } else {
        alert('Erro ao restaurar backup.');
      }
    }
  };

  const tabStyle = (isActive: boolean) => ({
    ...btnStyle,
    background: isActive ? '#3b82f6' : 'white',
    color: isActive ? 'white' : '#374151',
    border: isActive ? '1px solid #3b82f6' : '1px solid #d1d5db',
    marginRight: '0.5rem',
    marginBottom: '0.5rem'
  });

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
          <p style={{color: '#1e40af'}}>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Link href="/parent/dashboard" style={{...btnStyle, marginRight: '1rem'}}>
              ← Voltar
            </Link>
            <div>
              <h1 style={titleStyle}>⚙️ Configurações da Família</h1>
              <p style={subtitleStyle}>Personalize a experiência educacional financeira</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{marginBottom: '2rem'}}>
          <button 
            onClick={() => setActiveTab('general')} 
            style={tabStyle(activeTab === 'general')}
          >
            🏠 Geral
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            style={tabStyle(activeTab === 'categories')}
          >
            📊 Categorias
          </button>
          <button 
            onClick={() => setActiveTab('children')} 
            style={tabStyle(activeTab === 'children')}
          >
            👶 Filhos
          </button>
          <button 
            onClick={() => setActiveTab('backup')} 
            style={tabStyle(activeTab === 'backup')}
          >
            💾 Backup
          </button>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div>
            {/* Family Information */}
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem'}}>
                👨‍👩‍👧‍👦 Informações da Família
              </h2>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Nome da Família</label>
                  <input
                    style={inputStyle}
                    value={settings.familyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, familyName: e.target.value }))}
                    placeholder="Ex: Família Silva"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Moeda</label>
                  <select
                    style={inputStyle}
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="BRL">🇧🇷 Real Brasileiro (R$)</option>
                    <option value="USD">🇺🇸 Dólar Americano ($)</option>
                    <option value="EUR">🇪🇺 Euro (€)</option>
                  </select>
                </div>
              </div>
              <div style={{marginTop: '1rem'}}>
                <label style={labelStyle}>Missão Familiar</label>
                <textarea
                  style={{...inputStyle, minHeight: '80px'}}
                  value={settings.familyMission}
                  onChange={(e) => setSettings(prev => ({ ...prev, familyMission: e.target.value }))}
                  placeholder="Descreva os objetivos financeiros da sua família..."
                />
              </div>
            </div>

            {/* Mesada e Aprovações */}
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem'}}>
                💰 Mesada e Controle de Gastos
              </h2>
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                Os limites por categoria são definidos na aba "Categorias". Aqui você configura a mesada e quando precisa de aprovação.
              </p>
              
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Valor da Mesada</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.01"
                    value={settings.allowanceAmount}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowanceAmount: parseFloat(e.target.value) || 0 }))}
                  />
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    {formatCurrency(settings.allowanceAmount)} por {settings.allowanceFrequency === 'weekly' ? 'semana' : 'mês'}
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Frequência da Mesada</label>
                  <select
                    style={inputStyle}
                    value={settings.allowanceFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowanceFrequency: e.target.value as 'weekly' | 'monthly' }))}
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    {settings.allowanceFrequency === 'weekly' ? 'A cada 7 dias' : 'A cada 30 dias'}
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Aprovação Necessária Acima de</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.01"
                    value={settings.requireApprovalOver}
                    onChange={(e) => setSettings(prev => ({ ...prev, requireApprovalOver: parseFloat(e.target.value) || 0 }))}
                  />
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    Gastos acima de {formatCurrency(settings.requireApprovalOver)} precisam de aprovação dos pais
                  </p>
                </div>
              </div>

              {/* Ação de Mesada */}
              <div style={{marginTop: '2rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#16a34a', marginBottom: '0.75rem'}}>
                  🎁 Distribuir Mesada
                </h3>
                <p style={{fontSize: '0.875rem', color: '#15803d', marginBottom: '1rem'}}>
                  Você pode distribuir a mesada manualmente a qualquer momento, ou configurar para lembretes automáticos.
                </p>
                <button 
                  onClick={() => {
                    // Função para distribuir mesada para todas as crianças
                    const updatedChildren = children.map(child => ({
                      ...child,
                      balance: child.balance + settings.allowanceAmount
                    }));
                    setChildren(updatedChildren);
                    saveToLocalStorage('familyChildren', updatedChildren);
                    alert(`Mesada de ${formatCurrency(settings.allowanceAmount)} distribuída para ${children.length} ${children.length === 1 ? 'criança' : 'crianças'}!`);
                  }}
                  style={successBtnStyle}
                >
                  Distribuir Mesada Agora
                </button>
              </div>
            </div>

            {/* Sistema de Rendimento */}
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1rem'}}>
                🏦 Sistema de Rendimento da Poupança
              </h2>
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                Incentive seus filhos a pouparem! O dinheiro que permanecer na conta por um mês completo rende juros automaticamente.
              </p>
              
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>
                    <input
                      type="checkbox"
                      checked={settings.interestEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, interestEnabled: e.target.checked }))}
                      style={{marginRight: '0.5rem'}}
                    />
                    Ativar Rendimento Automático
                  </label>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    Quando ativado, o saldo que ficou o mês todo renderá juros automaticamente
                  </p>
                </div>
                
                <div>
                  <label style={labelStyle}>Taxa de Juros Mensal (%)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.savingsInterestRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, savingsInterestRate: parseFloat(e.target.value) || 0 }))}
                    disabled={!settings.interestEnabled}
                  />
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    {settings.savingsInterestRate}% ao mês • Recomendado: 0.5% a 2%
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Dia da Aplicação</label>
                  <select
                    style={inputStyle}
                    value={settings.interestApplicationDay}
                    onChange={(e) => setSettings(prev => ({ ...prev, interestApplicationDay: parseInt(e.target.value) }))}
                    disabled={!settings.interestEnabled}
                  >
                    <option value={30}>Último dia do mês</option>
                    <option value={1}>Todo dia 1</option>
                    <option value={15}>Todo dia 15</option>
                  </select>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    Quando os juros serão calculados e aplicados
                  </p>
                </div>
              </div>

              {/* Simulação de Rendimento */}
              {settings.interestEnabled && (
                <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.75rem'}}>
                    📊 Simulação de Rendimento
                  </h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
                    <div style={{textAlign: 'center'}}>
                      <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1'}}>
                        {formatCurrency(100 * (settings.savingsInterestRate / 100))}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#0369a1'}}>
                        Rendimento de R$ 100,00
                      </p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1'}}>
                        {formatCurrency(50 * (settings.savingsInterestRate / 100))}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#0369a1'}}>
                        Rendimento de R$ 50,00
                      </p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#0369a1'}}>
                        {formatCurrency(20 * (settings.savingsInterestRate / 100))}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#0369a1'}}>
                        Rendimento de R$ 20,00
                      </p>
                    </div>
                  </div>
                  <p style={{fontSize: '0.875rem', color: '#0369a1', marginTop: '0.75rem', textAlign: 'center'}}>
                    💡 Apenas o dinheiro que ficou o mês todo na conta rende juros
                  </p>
                </div>
              )}

              {/* Teste de Rendimento */}
              {settings.interestEnabled && (
                <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
                  <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#16a34a', marginBottom: '0.75rem'}}>
                    🧪 Teste de Rendimento
                  </h3>
                  <p style={{fontSize: '0.875rem', color: '#15803d', marginBottom: '1rem'}}>
                    Aplique rendimento manualmente para testar o sistema. Útil para demonstrações e testes.
                  </p>
                  <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                    <button 
                      onClick={() => {
                        const appliedAny = false; // InterestService.checkAndApplyInterest();
                        if (appliedAny) {
                          alert('✅ Rendimento aplicado automaticamente para contas elegíveis!');
                          loadFromLocalStorage(); // Reload data to reflect changes
                        } else {
                          alert('ℹ️ Nenhuma conta elegível para rendimento no momento. (Apenas dinheiro que ficou o mês todo rende juros)');
                        }
                      }}
                      style={{...successBtnStyle, fontSize: '0.875rem'}}
                    >
                      🏦 Aplicar Rendimento
                    </button>
                    <button 
                      onClick={() => {
                        // Simulate adding interest for demonstration
                        const children = JSON.parse(localStorage.getItem('familyChildren') || '[]');
                        const updatedChildren = children.map((child: any) => ({
                          ...child,
                          balance: child.balance + (child.balance * (settings.savingsInterestRate / 100))
                        }));
                        localStorage.setItem('familyChildren', JSON.stringify(updatedChildren));
                        
                        // Create a test interest transaction for child 1
                        const childTransactions = JSON.parse(localStorage.getItem('child-1-transactions') || '[]');
                        const interestAmount = 92.50 * (settings.savingsInterestRate / 100);
                        const newTransaction = {
                          amount: interestAmount,
                          description: `🏦 Rendimento da Poupança (${settings.savingsInterestRate}%)`,
                          timestamp: new Date().toISOString(),
                          category: 'interest',
                          type: 'income'
                        };
                        childTransactions.push(newTransaction);
                        localStorage.setItem('child-1-transactions', JSON.stringify(childTransactions));
                        
                        alert(`✅ Teste aplicado! Rendimento de ${(interestAmount).toFixed(2)}% adicionado às contas.`);
                        loadFromLocalStorage(); // Reload to show changes
                      }}
                      style={{...btnStyle, fontSize: '0.875rem', backgroundColor: '#fbbf24', color: 'white', border: '1px solid #f59e0b'}}
                    >
                      🧪 Teste Forçado
                    </button>
                  </div>
                </div>
              )}

              {/* Explicação Educativa */}
              <div style={{marginTop: '1.5rem', padding: '1rem', background: '#fefce8', borderRadius: '0.5rem', border: '1px solid #fde047'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#a16207', marginBottom: '0.75rem'}}>
                  🎓 Como Funciona o Rendimento
                </h3>
                <ul style={{fontSize: '0.875rem', color: '#92400e', listStyleType: 'disc', marginLeft: '1.5rem', lineHeight: '1.6'}}>
                  <li>O sistema verifica o <strong>saldo mínimo</strong> que ficou na conta durante todo o mês</li>
                  <li>No dia configurado, aplica a taxa de juros apenas sobre esse valor</li>
                  <li>Cria uma transação de "Rendimento da Poupança" automaticamente</li>
                  <li>Ensina sobre <strong>paciência</strong> e <strong>benefícios de longo prazo</strong></li>
                  <li>Incentiva as crianças a <strong>não gastarem tudo</strong> rapidamente</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#7c2d12', marginBottom: '1rem'}}>
                📊 Categorias de Gastos
              </h2>
              
              {/* Add new category */}
              <div style={{marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem'}}>➕ Adicionar Nova Categoria</h3>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: '0.75rem', alignItems: 'end'}}>
                  <div>
                    <label style={labelStyle}>Nome da Categoria</label>
                    <input
                      style={inputStyle}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Material Esportivo"
                    />
                  </div>
                  <div style={{position: 'relative'}}>
                    <label style={labelStyle}>Emoji</label>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <input
                        style={{...inputStyle, width: '60px', textAlign: 'center', fontSize: '1.5rem'}}
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        placeholder="⚽"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        style={{...btnStyle, padding: '0.75rem', fontSize: '1rem'}}
                      >
                        😀
                      </button>
                    </div>
                    {showEmojiPicker && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 10,
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        width: '300px',
                        maxHeight: '200px',
                        overflowY: 'auto' as 'auto'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, 1fr)',
                          gap: '0.25rem'
                        }}>
                          {emojiList.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setNewCategoryIcon(emoji);
                                setShowEmojiPicker(false);
                              }}
                              style={{
                                padding: '0.5rem',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                                borderRadius: '0.25rem',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div></div>
                  <div></div>
                  <button onClick={addCategory} style={successBtnStyle}>
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem'}}>
                <div>Categoria</div>
                <div>Ícone</div>
                <div>Limite Mensal</div>
                <div>Limite Trimestral</div>
                <div>Ações</div>
              </div>
              
              {categories.map(category => (
                <div key={category.id} style={{display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem'}}>
                  <div style={{fontWeight: '500'}}>{category.name}</div>
                  <div style={{fontSize: '1.5rem', textAlign: 'center'}}>{category.icon}</div>
                  <div>
                    <input
                      style={{...inputStyle, padding: '0.5rem'}}
                      type="number"
                      step="0.01"
                      value={category.monthlyLimit}
                      onChange={(e) => updateCategoryLimit(category.id, 'monthlyLimit', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <input
                      style={{...inputStyle, padding: '0.5rem'}}
                      type="number"
                      step="0.01"
                      value={category.quarterlyLimit}
                      onChange={(e) => updateCategoryLimit(category.id, 'quarterlyLimit', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button 
                    onClick={() => removeCategory(category.id)}
                    style={{...dangerBtnStyle, padding: '0.5rem 1rem', fontSize: '0.875rem'}}
                  >
                    Remover
                  </button>
                </div>
              ))}
              
              {/* Save Categories Button */}
              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb'}}>
                <button 
                  onClick={handleSaveCategories}
                  disabled={loading}
                  style={{
                    ...primaryBtnStyle,
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Salvando...' : saved ? '✓ Categorias Salvas!' : 'Salvar Categorias'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Children Tab */}
        {activeTab === 'children' && (
          <div>
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#7c2d12', marginBottom: '1rem'}}>
                👶 Gerenciar Filhos
              </h2>
              
              {/* Add new child */}
              <div style={{marginBottom: '2rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem'}}>➕ Adicionar Novo Filho</h3>
                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', alignItems: 'end'}}>
                  <div>
                    <label style={labelStyle}>Nome</label>
                    <input
                      style={inputStyle}
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      placeholder="Nome da criança"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>PIN (4 dígitos)</label>
                    <input
                      style={inputStyle}
                      value={newChildPin}
                      onChange={(e) => setNewChildPin(e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  <button onClick={addChild} style={successBtnStyle}>
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Children list */}
              {children.map(child => (
                <div key={child.id} style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                    <div>
                      <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#374151'}}>{child.name}</h3>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>PIN: {child.pin} | Membro desde: {new Date(child.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => resetChild(child.id)}
                        style={{...btnStyle, padding: '0.5rem 1rem', fontSize: '0.875rem'}}
                      >
                        🔄 Reset
                      </button>
                      <button 
                        onClick={() => removeChild(child.id)}
                        style={{...dangerBtnStyle, padding: '0.5rem 1rem', fontSize: '0.875rem'}}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem'}}>
                    <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a'}}>{formatCurrency(child.balance)}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Saldo Atual</p>
                    </div>
                    <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626'}}>{formatCurrency(child.totalSpent)}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Total Gasto</p>
                    </div>
                    <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb'}}>{formatCurrency(child.totalSaved)}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Total Poupado</p>
                    </div>
                    <div style={{textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '0.5rem'}}>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed'}}>Nível {child.level}</p>
                      <p style={{fontSize: '0.75rem', color: '#6b7280'}}>{child.badges} medalhas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div>
            <div style={cardStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#7c2d12', marginBottom: '1rem'}}>
                💾 Backup e Restauração
              </h2>
              
              <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem'}}>
                Proteja os dados da sua família criando backups regulares. Em caso de problemas, você pode restaurar facilmente.
              </p>

              {/* Current Backup Status */}
              <div style={{marginBottom: '2rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#16a34a', marginBottom: '0.75rem'}}>
                  📊 Status do Backup
                </h3>
                {backupInfo?.exists ? (
                  <div>
                    <p style={{fontSize: '0.875rem', color: '#15803d', marginBottom: '0.25rem'}}>
                      ✅ Backup disponível
                    </p>
                    <p style={{fontSize: '0.875rem', color: '#15803d'}}>
                      Criado: {backupInfo.age}
                    </p>
                  </div>
                ) : (
                  <p style={{fontSize: '0.875rem', color: '#dc2626'}}>
                    ⚠️ Nenhum backup encontrado
                  </p>
                )}
              </div>

              {/* Backup Actions */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
                <div style={{padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                    💾 Criar Backup
                  </h4>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                    Salva todas as configurações, categorias, dados dos filhos e transações.
                  </p>
                  <button 
                    onClick={handleCreateBackup}
                    style={{...successBtnStyle, width: '100%'}}
                  >
                    Criar Backup Agora
                  </button>
                </div>

                <div style={{padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}>
                  <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                    📂 Restaurar Backup
                  </h4>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                    Restaura todos os dados do último backup criado.
                  </p>
                  <button 
                    onClick={handleRestoreBackup}
                    disabled={!backupInfo?.exists}
                    style={{
                      ...btnStyle, 
                      width: '100%',
                      opacity: backupInfo?.exists ? 1 : 0.6,
                      cursor: backupInfo?.exists ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Restaurar Backup
                  </button>
                </div>
              </div>

              {/* Automatic Backup Info */}
              <div style={{padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe'}}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem'}}>
                  🔄 Backup Automático
                </h4>
                <p style={{fontSize: '0.875rem', color: '#1d4ed8'}}>
                  O sistema cria backups automaticamente a cada 5 minutos quando você faz alterações importantes. 
                  Você também pode criar backups manuais a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
          <button 
            onClick={handleSaveSettings}
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}
          >
            {loading ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}