'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const goalIcons = ['🎯', '🧸', '🎮', '📚', '👕', '📱', '⚽', '🎨', '🎵', '🚲', '💎', '🎪'];

interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  icon: string;
  isCompleted: boolean;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  const goalId = params.goalId;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    category: '',
    icon: '🎯'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    try {
      const response = await fetch(`/api/goals/${goalId}`);
      if (response.ok) {
        const data = await response.json();
        setGoal(data.goal);
        setFormData({
          name: data.goal.name,
          description: data.goal.description,
          targetAmount: data.goal.targetAmount.toString(),
          category: data.goal.category,
          icon: data.goal.icon
        });
      } else {
        setError('Objetivo não encontrado');
      }
    } catch (error) {
      console.error('Fetch goal error:', error);
      setError('Erro ao carregar objetivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          category: formData.category,
          icon: formData.icon,
        }),
      });

      if (response.ok) {
        router.push(`/child/${childId}/goals`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao atualizar objetivo');
      }
    } catch (error) {
      console.error('Update goal error:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-700">Carregando objetivo...</p>
        </div>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push(`/child/${childId}/goals`)}>
                Voltar aos Objetivos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/child/${childId}/goals`)}
            className="mr-4"
          >
            ← Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-purple-900">✏️ Editar Objetivo</h1>
            <p className="text-purple-700">Atualize sua meta de poupança</p>
          </div>
        </div>

        {goal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{goal.icon}</span>
                {goal.name}
              </CardTitle>
              <CardDescription>
                Progresso atual: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} 
                ({goal.progressPercent}%)
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Editar Objetivo</CardTitle>
            <CardDescription>
              Atualize as informações do seu objetivo
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
                <Label htmlFor="name">Nome do Objetivo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Bicicleta nova"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu objetivo..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor do Objetivo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min={goal?.currentAmount || 0.01}
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  required
                />
                {goal && (
                  <p className="text-xs text-gray-500">
                    Mínimo: {formatCurrency(goal.currentAmount)} (valor já economizado)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ícone do Objetivo</Label>
                <div className="grid grid-cols-6 gap-2">
                  {goalIcons.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      className="text-xl h-12 w-12"
                      onClick={() => handleInputChange('icon', icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/child/${childId}/goals`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}