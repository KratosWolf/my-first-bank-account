import { useState, useEffect } from 'react';

interface Child {
  id?: string;
  name: string;
  avatar: string;
  birthDate: string;
  age?: number;
  pin: string;
  balance: number;
  level: number;
  xp: number;
}

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: Child) => void;
  child?: Child | null;
  mode: 'add' | 'edit';
}

export default function ChildModal({ isOpen, onClose, onSave, child, mode }: ChildModalProps) {
  const [formData, setFormData] = useState<Child>({
    name: '',
    avatar: '👦',
    birthDate: '',
    pin: '',
    balance: 0,
    level: 1,
    xp: 0
  });
  
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const avatars = ['👦', '👧', '🧒', '👶', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '👩‍🎓', '👨‍🎓', '👩‍💻', '👨‍💻'];

  useEffect(() => {
    if (child && mode === 'edit') {
      setFormData(child);
    } else if (mode === 'add') {
      setFormData({
        name: '',
        avatar: '👦',
        birthDate: '',
        pin: '',
        balance: 0,
        level: 1,
        xp: 0
      });
    }
  }, [child, mode, isOpen]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const age = calculateAge(formData.birthDate);
      if (age < 3 || age > 17) {
        newErrors.birthDate = 'Idade deve estar entre 3 e 17 anos';
      }
    }
    
    if (!formData.pin || formData.pin.length !== 4) {
      newErrors.pin = 'PIN deve ter exatamente 4 dígitos';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN deve conter apenas números';
    }
    
    if (formData.balance < 0) {
      newErrors.balance = 'Saldo não pode ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const childData = {
        ...formData,
        age: calculateAge(formData.birthDate),
        // Não incluir ID aqui - deixar o serviço gerar o UUID válido
        ...(child?.id && { id: child.id })
      };
      onSave(childData);
      onClose();
    }
  };

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData(prev => ({ ...prev, pin }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {mode === 'add' ? '➕ Adicionar Criança' : '✏️ Editar Criança'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: João Silva"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.birthDate && (
              <p className="text-sm text-gray-900 mt-1">
                Idade: {calculateAge(formData.birthDate)} anos
              </p>
            )}
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Escolha um Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                    formData.avatar === avatar ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              PIN de Acesso (4 dígitos)
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.slice(0, 4) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0000"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-800 hover:text-gray-900"
                >
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomPin}
                className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                title="Gerar PIN aleatório"
              >
                🎲
              </button>
            </div>
            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
          </div>

          {/* Saldo Inicial */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Saldo Inicial (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.balance && <p className="text-red-500 text-xs mt-1">{errors.balance}</p>}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Preview:</h3>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{formData.avatar}</span>
              <div>
                <p className="font-semibold text-gray-900">{formData.name || 'Nome da criança'}</p>
                <p className="text-sm text-gray-800">
                  {formData.birthDate ? `${calculateAge(formData.birthDate)} anos` : 'Idade'} • 
                  PIN: {formData.pin ? '****' : '----'} • 
                  R$ {formData.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-900 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {mode === 'add' ? 'Adicionar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}