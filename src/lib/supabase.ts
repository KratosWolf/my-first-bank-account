import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Family {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  pin: string;
  avatar: string;
  birth_date?: string; // Data de nascimento (formato: YYYY-MM-DD)
  balance: number;
  total_earned: number;
  total_spent: number;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

// Financial System Types
export interface Transaction {
  id: string;
  child_id: string;
  type:
    | 'earning'
    | 'spending'
    | 'transfer'
    | 'interest'
    | 'allowance'
    | 'goal_deposit'
    | 'goal_interest';
  amount: number;
  description: string;
  category?: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';

  // Transfer fields
  from_child_id?: string;
  to_child_id?: string;

  // Approval fields
  requires_approval: boolean;
  approved_by_parent: boolean;
  parent_note?: string;
  approved_at?: string;

  // Goal integration
  related_goal_id?: string;

  created_at: string;
  updated_at: string;
}

export interface AllowanceConfig {
  id: string;
  child_id: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week: number; // 0=Sunday
  day_of_month: number;
  is_active: boolean;
  next_payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface SpendingCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  requires_approval: boolean;
  spending_limit?: number;
  is_active: boolean;
  created_at: string;
}

export interface ChildSpendingLimit {
  id: string;
  child_id: string;
  category_id: string;
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  requires_approval_over: number;
  is_active: boolean;
  created_at: string;
  category?: SpendingCategory;
}

export interface InterestConfig {
  id: string;
  child_id: string;
  monthly_rate: number; // Taxa mensal em % (0-100). Ex: 9.9 = 9.9% ao mês
  compound_frequency: 'daily' | 'weekly' | 'monthly';
  minimum_balance: number;
  is_active: boolean;
  last_interest_date: string;
  created_at: string;
}

export interface PurchaseRequest {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_note?: string;
  created_at: string;
  updated_at: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | 'saving'
    | 'spending'
    | 'earning'
    | 'goal'
    | 'streak'
    | 'level'
    | 'special';
  criteria: {
    type:
      | 'amount_saved'
      | 'amount_earned'
      | 'transactions_count'
      | 'days_streak'
      | 'goals_completed'
      | 'level_reached'
      | 'special_action';
    threshold: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  created_at: string;
}

export interface ChildBadge {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface ChildStreak {
  id: string;
  child_id: string;
  streak_type:
    | 'daily_save'
    | 'weekly_goal'
    | 'transaction_log'
    | 'lesson_complete';
  current_count: number;
  best_count: number;
  last_activity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LevelSystem {
  level: number;
  xp_required: number;
  title: string;
  benefits: string[];
  badge_reward?: string;
}

// Goals and Dreams Types
export interface Goal {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  category:
    | 'toy'
    | 'game'
    | 'book'
    | 'clothes'
    | 'experience'
    | 'education'
    | 'charity'
    | 'savings'
    | 'other';
  priority: 'low' | 'medium' | 'high';
  target_date?: string;
  image_url?: string;
  is_completed: boolean;
  completed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  child_id: string;
  amount: number;
  contribution_type:
    | 'manual'
    | 'automatic'
    | 'allowance_percentage'
    | 'chore_reward';
  description?: string;
  created_at: string;
}

export interface DreamBoard {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  total_target_amount: number;
  total_current_amount: number;
  goals: Goal[];
  is_shared: boolean; // Can family members see and contribute?
  created_at: string;
  updated_at: string;
}

export interface FamilyGoal {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  category:
    | 'vacation'
    | 'house_improvement'
    | 'family_activity'
    | 'emergency_fund'
    | 'education'
    | 'charity'
    | 'other';
  target_date?: string;
  image_url?: string;
  is_completed: boolean;
  completed_at?: string;
  created_by_child_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyGoalContribution {
  id: string;
  family_goal_id: string;
  child_id: string;
  amount: number;
  contribution_type: 'manual' | 'challenge_reward' | 'streak_bonus';
  description?: string;
  created_at: string;
}

// Chores/Tasks System Types
export interface ChoreTemplate {
  id: string;
  family_id: string;
  name: string;
  description?: string;
  category: 'cleaning' | 'academic' | 'pets' | 'outdoor' | 'helping' | 'other';
  reward_amount: number;
  estimated_minutes?: number;
  age_min: number;
  age_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignedChore {
  id: string;
  chore_template_id: string;
  child_id: string;
  assigned_by_parent_id?: string;
  name: string;
  description?: string;
  reward_amount: number;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  completed_at?: string;
  approved_at?: string;
  approved_by_parent_id?: string;
  rejection_reason?: string;
  notes?: string;
  photo_evidence?: string;
  created_at: string;
  updated_at: string;

  // Related data
  chore_template?: ChoreTemplate;
  child?: Child;
}

export interface ChoreCompletion {
  id: string;
  assigned_chore_id: string;
  child_id: string;
  completion_time_minutes?: number;
  quality_rating?: number; // 1-5 stars from parent
  child_satisfaction?: number; // 1-5 stars from child
  bonus_reward: number;
  completed_at: string;

  // Related data
  assigned_chore?: AssignedChore;
}
