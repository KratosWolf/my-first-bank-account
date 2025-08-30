'use client';

import { useState } from 'react';
import { GoalsService } from '@/lib/services/goals';
import type { Goal } from '@/lib/supabase';

interface CreateGoalFormProps {
  childId: string;
  onGoalCreated: (goal: Goal) => void;
  onCancel: () => void;
}

export default function CreateGoalForm({ childId, onGoalCreated, onCancel }: CreateGoalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: 'toy' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    target_date: '',
    image_url: ''
  });
  const [creating, setCreating] = useState(false);

  const categories: Array<{ key: Goal['category']; label: string; emoji: string }> = [
    { key: 'toy', label: 'Toys & Games', emoji: '🧸' },
    { key: 'game', label: 'Video Games', emoji: '🎮' },
    { key: 'book', label: 'Books', emoji: '📚' },
    { key: 'clothes', label: 'Clothes', emoji: '👕' },
    { key: 'experience', label: 'Experiences', emoji: '🎢' },
    { key: 'education', label: 'Education', emoji: '🎓' },
    { key: 'charity', label: 'Charity', emoji: '❤️' },
    { key: 'savings', label: 'Savings', emoji: '🐷' },
    { key: 'other', label: 'Other', emoji: '⭐' }
  ];

  const priorities: Array<{ key: Goal['priority']; label: string; color: string }> = [
    { key: 'low', label: 'Low Priority', color: 'text-gray-600' },
    { key: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { key: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target_amount) return;

    setCreating(true);
    try {
      const goalData = {
        child_id: childId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        target_amount: parseFloat(formData.target_amount),
        category: formData.category,
        priority: formData.priority,
        target_date: formData.target_date || undefined,
        image_url: formData.image_url.trim() || undefined,
        is_active: true
      };

      const newGoal = await GoalsService.createGoal(goalData);
      
      if (newGoal) {
        onGoalCreated(newGoal);
        // Reset form
        setFormData({
          title: '',
          description: '',
          target_amount: '',
          category: 'toy',
          priority: 'medium',
          target_date: '',
          image_url: ''
        });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">🎯 Create New Goal</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="What do you want to save for?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={255}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Tell us more about your goal..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Amount (R$) *
          </label>
          <input
            type="number"
            value={formData.target_amount}
            onChange={(e) => handleChange('target_amount', e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(category => (
              <button
                key={category.key}
                type="button"
                onClick={() => handleChange('category', category.key)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.category === category.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{category.emoji}</div>
                <div className="text-xs font-medium">{category.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex space-x-3">
            {priorities.map(priority => (
              <button
                key={priority.key}
                type="button"
                onClick={() => handleChange('priority', priority.key)}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  formData.priority === priority.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${priority.color}`}>
                  {priority.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={formData.target_date}
            onChange={(e) => handleChange('target_date', e.target.value)}
            min={today}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            When do you want to reach this goal?
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (Optional)
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add a picture to visualize your goal
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={creating || !formData.title || !formData.target_amount}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {creating ? '✨ Creating Goal...' : '🎯 Create Goal'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Goal Setting Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set realistic amounts that you can achieve</li>
          <li>• Choose a specific target date to stay motivated</li>
          <li>• High priority goals should be your focus</li>
          <li>• Add a description to remember why this goal is important</li>
        </ul>
      </div>
    </div>
  );
}