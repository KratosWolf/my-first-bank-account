'use client';

import { useState, useEffect } from 'react';
import { GoalsService } from '@/lib/services/goals';
import type { FamilyGoal, FamilyGoalContribution } from '@/lib/supabase';

interface FamilyGoalsProps {
  familyId: string;
  currentChildId?: string;
}

export default function FamilyGoals({
  familyId,
  currentChildId,
}: FamilyGoalsProps) {
  const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>([]);
  const [contributions, setContributions] = useState<
    Record<string, FamilyGoalContribution[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [contributeAmount, setContributeAmount] = useState<
    Record<string, string>
  >({});
  const [contributing, setContributing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFamilyGoals();
  }, [familyId]);

  const loadFamilyGoals = async () => {
    try {
      const goals = await GoalsService.getFamilyGoals(familyId);
      setFamilyGoals(goals);

      // Load contributions for each goal
      const contributionsData: Record<string, FamilyGoalContribution[]> = {};
      for (const goal of goals) {
        const goalContributions = await GoalsService.getFamilyGoalContributions(
          goal.id
        );
        contributionsData[goal.id] = goalContributions;
      }
      setContributions(contributionsData);
    } catch (error) {
      console.error('Error loading family goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (goalId: string) => {
    if (!currentChildId) return;

    const amount = parseFloat(contributeAmount[goalId] || '0');
    if (amount <= 0) return;

    setContributing(prev => ({ ...prev, [goalId]: true }));

    try {
      const contribution = await GoalsService.contributeToFamilyGoal(
        goalId,
        currentChildId,
        amount,
        'manual',
        `Family goal contribution of R$ ${amount.toFixed(2)}`
      );

      if (contribution) {
        // Update local state
        setFamilyGoals(prev =>
          prev.map(goal =>
            goal.id === goalId
              ? { ...goal, current_amount: goal.current_amount + amount }
              : goal
          )
        );

        setContributions(prev => ({
          ...prev,
          [goalId]: [contribution, ...(prev[goalId] || [])],
        }));

        setContributeAmount(prev => ({ ...prev, [goalId]: '' }));
      }
    } catch (error) {
      console.error('Error contributing to family goal:', error);
    } finally {
      setContributing(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const getCategoryInfo = (category: FamilyGoal['category']) => {
    const categories = {
      vacation: { emoji: '🏖️', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      house_improvement: {
        emoji: '🏠',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
      },
      family_activity: {
        emoji: '🎯',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
      },
      emergency_fund: {
        emoji: '🛡️',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      },
      education: {
        emoji: '🎓',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100',
      },
      charity: { emoji: '❤️', color: 'text-pink-700', bgColor: 'bg-pink-100' },
      other: { emoji: '⭐', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };
    return categories[category] || categories.other;
  };

  const getProgress = (goal: FamilyGoal) => {
    const percentage =
      goal.target_amount > 0
        ? (goal.current_amount / goal.target_amount) * 100
        : 0;
    const remaining = Math.max(0, goal.target_amount - goal.current_amount);
    const isCompleted = goal.current_amount >= goal.target_amount;
    return { percentage, remaining, isCompleted };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 Family Goals</h2>
        <div className="text-3xl">🎯</div>
      </div>

      {familyGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Family Goals Yet
          </h3>
          <p className="text-gray-600">
            Create family goals that everyone can contribute to and achieve
            together!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {familyGoals.map(goal => {
            const categoryInfo = getCategoryInfo(goal.category);
            const progress = getProgress(goal);
            const goalContributions = contributions[goal.id] || [];

            return (
              <div
                key={goal.id}
                className={`border-2 rounded-xl p-6 transition-all ${
                  goal.is_completed
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${categoryInfo.bgColor}`}>
                      <span className="text-2xl">{categoryInfo.emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {goal.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.color}`}
                        >
                          {goal.category.replace('_', ' ')}
                        </span>
                        {goal.target_date && (
                          <span className="text-sm text-gray-500">
                            📅 Target:{' '}
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {goal.is_completed && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      🎉 Completed!
                    </div>
                  )}
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-gray-600 mb-4">{goal.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      Family Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.isCompleted
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : 'bg-gradient-to-r from-blue-400 to-purple-500'
                      }`}
                      style={{
                        width: `${Math.min(progress.percentage, 100)}%`,
                      }}
                    >
                      {progress.isCompleted && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-green-600">
                      R$ {goal.current_amount.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      R$ {goal.target_amount.toFixed(2)}
                    </span>
                  </div>

                  {!progress.isCompleted && (
                    <p className="text-sm text-gray-500 mt-1">
                      R$ {progress.remaining.toFixed(2)} remaining to reach the
                      family goal
                    </p>
                  )}
                </div>

                {/* Contribution Form */}
                {!goal.is_completed && currentChildId && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Contribute to Family Goal
                    </h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={contributeAmount[goal.id] || ''}
                        onChange={e =>
                          setContributeAmount(prev => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                        placeholder="Amount (R$)"
                        min="0.01"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        disabled={
                          contributing[goal.id] ||
                          !contributeAmount[goal.id] ||
                          parseFloat(contributeAmount[goal.id] || '0') <= 0
                        }
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        {contributing[goal.id] ? '...' : 'Contribute'}
                      </button>
                    </div>

                    {/* Quick amounts */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Quick amounts:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[25, 50, 100, 200].map(amount => (
                          <button
                            key={amount}
                            onClick={() =>
                              setContributeAmount(prev => ({
                                ...prev,
                                [goal.id]: amount.toString(),
                              }))
                            }
                            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-full transition-colors"
                          >
                            R$ {amount}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Contributions */}
                {goalContributions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Recent Contributions
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {goalContributions.slice(0, 5).map(contribution => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {(contribution as any).child?.avatar || '👤'}
                            </span>
                            <span className="font-medium">
                              {(contribution as any).child?.name ||
                                'Family Member'}
                            </span>
                            <span className="text-gray-500">contributed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-green-600">
                              R$ {contribution.amount.toFixed(2)}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(
                                contribution.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Celebration */}
                {goal.is_completed && goal.completed_at && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="font-bold text-green-900">
                          Family Goal Achieved!
                        </p>
                        <p className="text-green-700 text-sm">
                          Completed on{' '}
                          {new Date(goal.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
