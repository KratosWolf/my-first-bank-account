'use client';

import { useState } from 'react';
import {
  GoalsService,
  type Goal,
  type GoalProgress,
} from '@/lib/services/goals';

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  onAddMoney?: (goalId: string, amount: number) => void;
  onCancelGoal?: (goalId: string) => void;
  onRequestFulfillment?: (goalId: string) => void;
  showActions?: boolean;
}

export default function GoalCard({
  goal,
  progress,
  onAddMoney,
  onCancelGoal,
  onRequestFulfillment,
  showActions = true,
}: GoalCardProps) {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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
    if (percentage >= 100) return 'from-[#22C55E] to-[#16A34A]'; // Verde sucesso
    if (percentage >= 75) return 'from-[#F5B731] to-[#FFD966]'; // Amarelo (quase lá!)
    if (percentage >= 50) return 'from-[#F5B731] to-[#F59E0B]'; // Amarelo-laranja
    if (percentage >= 25) return 'from-[#F5B731]/80 to-[#F5B731]'; // Amarelo claro
    return 'from-white/40 to-white/60'; // Cinza claro
  };

  const getStatusBadge = () => {
    if (goal.is_completed) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#22C55E] text-white border border-[#22C55E]">
          <span className="mr-1">🎉</span>
          Concluída!
        </div>
      );
    }

    if (progress.percentage >= 90) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#F5B731] text-[#0D2818] border border-[#F5B731]">
          <span className="mr-1">🔥</span>
          Quase lá!
        </div>
      );
    }

    if (progress.is_on_track) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#F5B731]/30 text-[#F5B731] border border-[#F5B731]/50">
          <span className="mr-1">📈</span>
          No caminho
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/20 text-white border border-white/30">
        <span className="mr-1">⚡</span>
        Ativo
      </div>
    );
  };

  const getCategoryInfo = () => {
    const categories = GoalsService.getGoalCategories();
    return (
      categories.find(c => c.id === goal.category) ||
      categories[categories.length - 1]
    );
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className="bg-[#1A4731] rounded-2xl shadow-xl border-2 border-[#F5B731]/30 overflow-hidden hover:shadow-2xl hover:border-[#F5B731] transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{goal.emoji}</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {goal.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70">
                  {categoryInfo.emoji} {categoryInfo.name}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {goal.priority === 'high' && (
            <div className="text-[#F5B731]">
              <span className="text-lg">🔥</span>
            </div>
          )}
        </div>

        {goal.description && (
          <p className="text-white/80 text-sm mb-4">{goal.description}</p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white/70">
                Progresso
              </span>
              <span className="text-lg font-bold text-[#F5B731]">
                {progress.percentage}%
              </span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm font-bold text-white">
                R$ {goal.current_amount.toFixed(2)} / R${' '}
                {goal.target_amount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="w-full bg-[#0D2818] rounded-full h-4 overflow-hidden shadow-inner border border-white/10">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(progress.percentage)} transition-all duration-1000 ease-out relative`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            >
              <div className="h-full bg-white/30 animate-pulse"></div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0D2818] rounded-lg p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-[#F5B731]">
              R$ {progress.remaining_amount.toFixed(2)}
            </div>
            <div className="text-xs text-white/70">Faltam</div>
          </div>
          <div className="bg-[#0D2818] rounded-lg p-3 text-center border border-white/10">
            <div className="text-lg font-bold text-[#F5B731]">
              {progress.estimated_weeks_remaining}
            </div>
            <div className="text-xs text-white/70">Semanas estimadas</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-[#F5B731]/20 to-[#FFD966]/20 rounded-lg p-3 mb-4 border border-[#F5B731]/30">
          <p className="text-sm text-[#F5B731] font-medium text-center">
            {GoalsService.getMotivationalMessage(progress)}
          </p>
        </div>

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-white/70">📅</span>
            <span className="text-sm text-white/90">
              Meta para:{' '}
              {new Date(goal.target_date).toLocaleDateString('pt-BR')}
            </span>
            {!progress.is_on_track && !goal.is_completed && (
              <span className="text-xs bg-[#F5B731] text-[#0D2818] px-2 py-1 rounded-full font-semibold">
                Acelere!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && !goal.is_completed && (
        <div className="bg-[#0D2818] px-6 py-4 space-y-3">
          {/* Botão principal: Adicionar dinheiro OU Realizar sonho */}
          {!showAddMoney && !showCancelConfirm ? (
            <>
              {progress.percentage >= 100 ? (
                <button
                  onClick={() => onRequestFulfillment?.(goal.id!)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#22C55E] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 animate-pulse"
                >
                  <span>🎁</span>
                  <span>Realizar Sonho!</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAddMoney(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F5B731] to-[#FFD966] hover:from-[#FFD966] hover:to-[#F5B731] text-[#0D2818] font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  <span>💰</span>
                  <span>Adicionar Dinheiro</span>
                </button>
              )}

              {/* Botão secundário: Desistir */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                <span>🚫</span>
                <span>Desistir deste Sonho</span>
              </button>
            </>
          ) : showCancelConfirm ? (
            /* Modal de confirmação de cancelamento */
            <div className="space-y-3 bg-[#EF4444]/10 border-2 border-[#EF4444]/30 rounded-xl p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-white font-semibold mb-1">
                  Tem certeza que quer desistir?
                </p>
                <p className="text-white/70 text-sm mb-3">
                  R$ {goal.current_amount.toFixed(2)} voltará para sua conta
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onCancelGoal?.(goal.id!);
                    setShowCancelConfirm(false);
                  }}
                  className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Sim, Desistir
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-[#F5B731]/50 bg-[#1A4731] text-white rounded-lg focus:ring-2 focus:ring-[#F5B731] focus:border-[#F5B731]"
                  step="0.01"
                  min="0.01"
                />
                <button
                  onClick={handleAddMoney}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="px-6 py-2 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowAddMoney(false);
                    setAmount('');
                  }}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors"
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
                    className="flex-1 py-2 text-xs bg-[#F5B731]/20 hover:bg-[#F5B731]/30 text-[#F5B731] rounded-md transition-colors font-semibold"
                  >
                    R$ {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Celebration for completed goals */}
      {goal.is_completed && showActions && (
        <div className="bg-[#0D2818] px-6 py-4">
          <div className="text-center text-white/70 text-sm font-medium">
            <span className="mr-1">🎉</span>
            Sonho realizado!
            <span className="ml-1">🎊</span>
          </div>
        </div>
      )}

      {/* Completion Celebration */}
      {goal.is_completed && (
        <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-6 text-center border-t-2 border-[#22C55E]/30 relative overflow-hidden">
          {/* Celebratory background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]"></div>

          <div className="relative z-10">
            <div className="text-4xl mb-3 animate-bounce">🎉 🎊 🎉</div>
            <div className="font-bold text-xl text-white mb-2">
              Meta Alcançada!
            </div>
            <div className="text-sm text-white/90 font-medium">
              Concluída em{' '}
              {goal.completed_at
                ? new Date(goal.completed_at).toLocaleDateString('pt-BR')
                : 'hoje'}
            </div>
            <div className="mt-3 inline-block px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
              <span className="text-white font-bold text-sm">
                🏆 Objetivo Conquistado!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
