'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpendingCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  parentId: number;
  childId?: number;
  isActive: boolean;
  monthlyBudget?: number;
  createdAt: string;
  updatedAt: string;
}

const transactionTypes = [
  { value: 'expense', label: 'Gasto', icon: '💸', description: 'Dinheiro que você gastou' },
  { value: 'allowance', label: 'Mesada', icon: '💰', description: 'Dinheiro recebido dos pais' },
  { value: 'gift', label: 'Presente', icon: '🎁', description: 'Dinheiro recebido de presente' },
  { value: 'goal_deposit', label: 'Depósito para Objetivo', icon: '🎯', description: 'Dinheiro guardado para um objetivo' },
];

export default function NewSpendingPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;

  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    
    // Listen for changes in categories
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spendingCategories') {
        console.log('Categories changed, reloading...');
        fetchCategories();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      // Load categories from parent settings
      const savedCategories = JSON.parse(localStorage.getItem('spendingCategories') || '[]');
      console.log('Loading categories from localStorage:', savedCategories);
      
      if (savedCategories.length > 0) {
        // Convert parent categories format to child format
        const convertedCategories = savedCategories.map((cat: any) => ({
          id: parseInt(cat.id),
          name: cat.name,
          icon: cat.icon,
          color: '#6B7280',
          parentId: 1,
          isActive: cat.enabled,
          monthlyBudget: cat.monthlyLimit,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        console.log('Converted categories:', convertedCategories);
        setCategories(convertedCategories);
      } else {
        console.log('No saved categories found, using default categories');
        // Fallback to default categories
        setCategories([
          { id: 1, name: 'Brinquedos', icon: '🧸', color: '#FF6B6B', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, name: 'Roupas', icon: '👕', color: '#4ECDC4', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, name: 'Livros', icon: '📚', color: '#45B7D1', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 4, name: 'Jogos', icon: '🎮', color: '#96CEB4', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 5, name: 'Doces', icon: '🍭', color: '#FECA57', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 6, name: 'Outros', icon: '📦', color: '#A0A0A0', parentId: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('Load categories error:', error);
      setError('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          categoryId: parseInt(formData.categoryId),
          type: formData.type,
          date: formData.date,
        }),
      });

      if (response.ok) {
        router.push(`/child/${childId}/spending`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao salvar transação');
      }
    } catch (error) {
      console.error('Create spending error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedType = transactionTypes.find(type => type.value === formData.type);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/child/${childId}/spending`)}
            className="mr-4"
          >
            ← Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-purple-900">💸 Nova Movimentação</h1>
            <p className="text-purple-700">Registre seus gastos e recebimentos</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedType?.icon}</span>
              {selectedType?.label}
            </CardTitle>
            <CardDescription>
              {selectedType?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipo de Movimentação</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que foi comprado ou recebido..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/child/${childId}/spending`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Movimentação'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}