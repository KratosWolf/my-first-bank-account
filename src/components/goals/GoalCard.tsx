'use client';

import { useState } from 'react';
import { GoalsService, type Goal, type GoalProgress } from '@/lib/services/goals';

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  onAddMoney?: (goalId: string, amount: number) => void;
  showActions?: boolean;
}

export default function GoalCard({ 
  goal, 
  progress, 
  onAddMoney, 
  showActions = true 
}: GoalCardProps) {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && onAddMoney) {
      onAddMoney(goal.id!, numAmount);
      setAmount('');
      setShowAddMoney(false);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-cyan-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    if (percentage >= 25) return 'from-purple-500 to-pink-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusBadge = () => {
    if (goal.is_completed) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-300">
          <span className="mr-1">🎉</span>
          Concluída!
        </div>
      );
    }

    if (progress.percentage >= 90) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800 border border-orange-300">
          <span className="mr-1">🔥</span>
          Quase lá!
        </div>
      );
    }

    if (progress.is_on_track) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-300">
          <span className="mr-1">📈</span>
          No caminho
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
        <span className="mr-1">⚡</span>
        Ativo
      </div>
    );
  };

  const getCategoryInfo = () => {
    const categories = GoalsService.getGoalCategories();
    return categories.find(c => c.id === goal.category) || categories[categories.length - 1];
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{goal.emoji}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{categoryInfo.emoji} {categoryInfo.name}</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
          
          {goal.priority === 'high' && (
            <div className="text-red-500">
              <span className="text-lg">🔥</span>
            </div>
          )}
        </div>

        {goal.description && (
          <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-lg font-bold text-gray-900">{progress.percentage}%</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(progress.percentage)} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">R$ {progress.remaining_amount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Faltam</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{progress.estimated_weeks_remaining}</div>
            <div className="text-xs text-gray-500">Semanas estimadas</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4 border border-blue-200">
          <p className="text-sm text-blue-800 font-medium text-center">
            {GoalsService.getMotivationalMessage(progress)}
          </p>
        </div>

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-gray-500">📅</span>
            <span className="text-sm text-gray-600">
              Meta para: {new Date(goal.target_date).toLocaleDateString('pt-BR')}
            </span>
            {!progress.is_on_track && !goal.is_completed && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Acelere!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && !goal.is_completed && (
        <div className="bg-gray-50 px-6 py-4">
          {!showAddMoney ? (
            <button
              onClick={() => setShowAddMoney(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>💰</span>
              <span>Adicionar Dinheiro</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.01"
                  min="0.01"
                />
                <button
                  onClick={handleAddMoney}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowAddMoney(false);
                    setAmount('');
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Quick amount buttons */}
              <div className="flex space-x-2">
                {[5, 10, 20, 50].map(value => (
                  <button
                    key={value}
                    onClick={() => setAmount(value.toString())}
                    className="flex-1 py-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                  >
                    R$ {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Celebration */}
      {goal.is_completed && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-center">
          <div className="text-white">
            <div className="text-2xl mb-2">🎉 🎊 🎉</div>
            <div className="font-bold">Meta Alcançada!</div>
            <div className="text-sm opacity-90">
              Concluída em {goal.completed_at ? new Date(goal.completed_at).toLocaleDateString('pt-BR') : 'hoje'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}