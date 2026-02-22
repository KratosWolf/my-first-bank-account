'use client';

import { useState, useEffect } from 'react';
import { GoalsService } from '@/lib/services/goals';
import type { DreamBoard as DreamBoardType, Goal } from '@/lib/supabase';
import GoalCard from './GoalCard';

interface DreamBoardProps {
  childId: string;
  childName: string;
  showCreateButton?: boolean;
  onCreateGoal?: () => void;
}

export default function DreamBoard({
  childId,
  childName,
  showCreateButton = true,
  onCreateGoal,
}: DreamBoardProps) {
  const [dreamBoard, setDreamBoard] = useState<DreamBoardType | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<
    'priority' | 'amount' | 'date' | 'progress'
  >('priority');

  useEffect(() => {
    loadDreamBoard();
  }, [childId]);

  const loadDreamBoard = async () => {
    try {
      const board = await GoalsService.getDreamBoard(childId);
      if (board) {
        setDreamBoard(board);
        setGoals(board.goals);
      }
    } catch (error) {
      console.error('Error loading dream board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalUpdate = (updatedGoal: Goal) => {
    setGoals(prev =>
      prev.map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );

    // Recalculate dream board totals
    if (dreamBoard) {
      const updatedGoals = goals.map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      );

      setDreamBoard({
        ...dreamBoard,
        total_current_amount: updatedGoals.reduce(
          (sum, g) => sum + g.current_amount,
          0
        ),
      });
    }
  };

  const handleContribute = async (amount: number) => {
    // Refresh the dream board to get updated totals
    await loadDreamBoard();
  };

  // Handler para adicionar dinheiro ao sonho
  const handleAddMoney = async (goalId: string, amount: number) => {
    try {
      const response = await fetch('/api/goals/add-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          child_id: childId,
          amount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add money');
      }

      const result = await response.json();
      await loadDreamBoard(); // Refresh para atualizar totais
    } catch (error) {
      console.error('Error adding money to goal:', error);
      alert('Erro ao adicionar dinheiro ao sonho. Tente novamente.');
    }
  };

  // Handler para cancelar sonho
  const handleCancelGoal = async (goalId: string) => {
    try {
      const response = await fetch('/api/goals/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          child_id: childId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel goal');
      }

      const result = await response.json();
      alert(result.message);
      await loadDreamBoard(); // Refresh
    } catch (error) {
      console.error('Error canceling goal:', error);
      alert('Erro ao cancelar sonho. Tente novamente.');
    }
  };

  // Handler para solicitar realização do sonho
  const handleRequestFulfillment = async (goalId: string) => {
    try {
      const response = await fetch('/api/goals/request-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goalId,
          child_id: childId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request fulfillment');
      }

      const result = await response.json();
      alert(
        result.message ||
          '🎉 Pedido enviado! Aguarde a aprovação dos seus pais.'
      );
      await loadDreamBoard(); // Refresh
    } catch (error) {
      console.error('Error requesting fulfillment:', error);
      alert('Erro ao solicitar realização do sonho. Tente novamente.');
    }
  };

  // Calcular progresso do sonho
  const calculateProgress = (goal: Goal) => {
    const percentage =
      goal.target_amount > 0
        ? Math.round((goal.current_amount / goal.target_amount) * 100)
        : 0;

    const remaining_amount = Math.max(
      0,
      goal.target_amount - goal.current_amount
    );

    // Estimar semanas restantes baseado na taxa de poupança
    // Simplificado: assume R$10/semana de poupança média
    const estimated_weeks_remaining =
      remaining_amount > 0 ? Math.ceil(remaining_amount / 10) : 0;

    // Considera "no caminho" se tem mais de 25% do progresso
    const is_on_track = percentage >= 25;

    return {
      percentage,
      remaining_amount,
      estimated_weeks_remaining,
      is_on_track,
    };
  };

  // Filter and sort goals
  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return !goal.is_completed;
    if (filter === 'completed') return goal.is_completed;
    return true;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'amount':
        return b.target_amount - a.target_amount;
      case 'date':
        if (!a.target_date && !b.target_date) return 0;
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return (
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      case 'progress':
        const aProgress =
          a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
        const bProgress =
          b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
        return bProgress - aProgress;
      default:
        return 0;
    }
  });

  const stats = GoalsService.getChildGoalStats
    ? {
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.is_completed).length,
        activeGoals: goals.filter(g => !g.is_completed).length,
        totalTargetAmount: goals.reduce((sum, g) => sum + g.target_amount, 0),
        totalCurrentAmount: goals.reduce((sum, g) => sum + g.current_amount, 0),
        completionRate:
          goals.length > 0
            ? (goals.filter(g => g.is_completed).length / goals.length) * 100
            : 0,
      }
    : null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dream Board Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              ✨ {childName}&apos;s Dream Board
            </h1>
            <p className="text-purple-100">
              Turn your dreams into achievable goals!
            </p>
          </div>
          <div className="text-4xl">🌟</div>
        </div>

        {dreamBoard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{goals.length}</div>
              <div className="text-sm text-purple-200">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {goals.filter(g => g.is_completed).length}
              </div>
              <div className="text-sm text-purple-200">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                R$ {dreamBoard.total_current_amount.toFixed(0)}
              </div>
              <div className="text-sm text-purple-200">Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                R$ {dreamBoard.total_target_amount.toFixed(0)}
              </div>
              <div className="text-sm text-purple-200">Target</div>
            </div>
          </div>
        )}

        {/* Overall Progress */}
        {dreamBoard && dreamBoard.total_target_amount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-200">Overall Progress</span>
              <span className="text-sm text-white">
                {(
                  (dreamBoard.total_current_amount /
                    dreamBoard.total_target_amount) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (dreamBoard.total_current_amount / dreamBoard.total_target_amount) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({goals.filter(g => !g.is_completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({goals.filter(g => g.is_completed).length})
            </button>
          </div>

          {/* Sort and Create */}
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="amount">Sort by Amount</option>
              <option value="date">Sort by Date</option>
              <option value="progress">Sort by Progress</option>
            </select>

            {showCreateButton && onCreateGoal && (
              <button
                onClick={onCreateGoal}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🎯 New Goal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {sortedGoals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {filter === 'all'
              ? 'No goals yet!'
              : filter === 'active'
                ? 'No active goals'
                : 'No completed goals yet'}
          </h2>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? 'Start your financial journey by creating your first goal!'
              : filter === 'active'
                ? 'All your goals are completed! Create new ones to keep growing.'
                : 'Complete your first goal to see it here!'}
          </p>
          {showCreateButton && onCreateGoal && filter === 'all' && (
            <button
              onClick={onCreateGoal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🎯 Create Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={calculateProgress(goal)}
              onAddMoney={handleAddMoney}
              onCancelGoal={handleCancelGoal}
              onRequestFulfillment={handleRequestFulfillment}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Achievement Message */}
      {goals.length > 0 && goals.filter(g => g.is_completed).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-lg font-bold text-green-900">
                Congratulations!
              </h3>
              <p className="text-green-700">
                You&apos;ve completed {goals.filter(g => g.is_completed).length}{' '}
                out of {goals.length} goals! Keep up the great work! 🌟
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
