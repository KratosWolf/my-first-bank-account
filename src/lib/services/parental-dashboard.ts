import { supabase } from '@/lib/supabase';
import { StorageAdapter } from './storage-adapter';
import { StatementsService } from './statements';
import { AnalyticsService } from './analytics';
import { GoalsService } from './goals';
import { NotificationService } from './notifications';
import type { Child } from '@/lib/supabase';

export interface ParentalOverview {
  family_summary: {
    total_children: number;
    total_family_balance: number;
    total_monthly_allowance: number;
    active_goals_count: number;
    completed_tasks_this_week: number;
    pending_approvals: number;
    family_financial_health: number;
  };
  children_summary: Array<{
    child: Child;
    current_balance: number;
    weekly_earnings: number;
    weekly_spending: number;
    active_goals: number;
    completed_tasks: number;
    current_level: number;
    health_score: number;
    status: 'excellent' | 'good' | 'needs_attention' | 'concerning';
    last_activity: string;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'transaction' | 'goal_achieved' | 'level_up' | 'task_completed' | 'spending_alert';
    child_name: string;
    child_avatar: string;
    title: string;
    description: string;
    amount?: number;
    timestamp: string;
    requires_attention: boolean;
  }>;
  pending_approvals: Array<{
    id: string;
    type: 'spending_request' | 'goal_withdrawal' | 'large_purchase';
    child_name: string;
    child_avatar: string;
    title: string;
    amount: number;
    description: string;
    requested_at: string;
    category: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
  alerts_and_insights: Array<{
    id: string;
    type: 'spending_pattern' | 'savings_milestone' | 'educational_opportunity' | 'behavior_change';
    severity: 'info' | 'warning' | 'success' | 'urgent';
    title: string;
    message: string;
    child_affected?: string;
    suggested_actions: string[];
    created_at: string;
  }>;
}

export interface ChildControls {
  child_id: string;
  spending_limits: {
    daily_limit: number;
    weekly_limit: number;
    monthly_limit: number;
    category_limits: Record<string, number>;
  };
  approval_requirements: {
    require_approval_above: number;
    auto_approve_categories: string[];
    blocked_categories: string[];
    restricted_times: Array<{
      start_time: string;
      end_time: string;
      days: string[];
    }>;
  };
  allowance_config: {
    base_allowance: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    bonus_multipliers: Record<string, number>;
    automatic_distribution: boolean;
    next_allowance_date: string;
  };
  educational_settings: {
    age_appropriate_content: boolean;
    financial_lessons_enabled: boolean;
    goal_setting_guidance: boolean;
    spending_insights_enabled: boolean;
  };
}

export interface FamilySettings {
  family_id: string;
  general_settings: {
    currency: 'BRL' | 'USD' | 'EUR';
    timezone: string;
    language: 'pt-BR' | 'en-US' | 'es-ES';
    family_name: string;
    notification_preferences: {
      email_notifications: boolean;
      push_notifications: boolean;
      weekly_reports: boolean;
      achievement_alerts: boolean;
    };
  };
  financial_education: {
    savings_rate_target: number;
    interest_rate_simulation: number;
    financial_goals_encouraged: boolean;
    spending_tracking_mandatory: boolean;
  };
  parental_controls: {
    require_parent_approval_above: number;
    blocked_websites: string[];
    restricted_spending_times: Array<{
      start_time: string;
      end_time: string;
      days: string[];
    }>;
    maximum_daily_screen_rewards: number;
  };
}

export interface ParentalReport {
  period: string;
  family_performance: {
    total_savings: number;
    total_earnings: number;
    total_spending: number;
    savings_rate: number;
    financial_health_trend: 'improving' | 'stable' | 'declining';
  };
  child_reports: Array<{
    child: Child;
    performance: {
      tasks_completed: number;
      goals_achieved: number;
      savings_amount: number;
      spending_patterns: Record<string, number>;
      behavioral_insights: string[];
      recommendations: string[];
    };
  }>;
  educational_progress: {
    lessons_completed: number;
    skills_developed: string[];
    areas_for_improvement: string[];
  };
  alerts_summary: {
    spending_alerts: number;
    goal_alerts: number;
    behavioral_alerts: number;
    positive_highlights: number;
  };
}

export class ParentalDashboardService {

  // Get comprehensive dashboard overview
  static async getDashboardOverview(familyId: string): Promise<ParentalOverview> {
    try {
      // Get all family children
      const children = await StorageAdapter.getChildren(familyId);
      if (children.length === 0) {
        return this.getEmptyDashboardOverview();
      }

      // Calculate family summary
      const totalBalance = children.reduce((sum, child) => sum + child.balance, 0);
      const activeGoals = await this.getActiveGoalsCount(children);
      const weeklyTasks = await this.getWeeklyTasksCount(children);
      const pendingCount = await this.getPendingApprovalsCount(familyId);

      // Get children summary with health scores
      const childrenSummary = await Promise.all(
        children.map(child => this.getChildSummary(child))
      );

      // Get recent family activity
      const recentActivity = await this.getRecentFamilyActivity(familyId);

      // Get pending approvals
      const pendingApprovals = await this.getPendingApprovals(familyId);

      // Generate alerts and insights
      const alerts = await this.generateAlertsAndInsights(familyId, children);

      return {
        family_summary: {
          total_children: children.length,
          total_family_balance: totalBalance,
          total_monthly_allowance: this.calculateMonthlyAllowance(children),
          active_goals_count: activeGoals,
          completed_tasks_this_week: weeklyTasks,
          pending_approvals: pendingCount,
          family_financial_health: this.calculateFamilyHealthScore(children)
        },
        children_summary: childrenSummary,
        recent_activity: recentActivity,
        pending_approvals: pendingApprovals,
        alerts_and_insights: alerts
      };

    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      return this.getEmptyDashboardOverview();
    }
  }

  // Get child-specific controls and settings
  static async getChildControls(childId: string): Promise<ChildControls> {
    try {
      // Try to get from Supabase first
      if (await this.isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('child_controls')
          .select('*')
          .eq('child_id', childId)
          .single();

        if (!error && data) {
          return this.mapToChildControls(data);
        }
      }

      // Fallback to localStorage or default settings
      return this.getDefaultChildControls(childId);

    } catch (error) {
      console.error('Error getting child controls:', error);
      return this.getDefaultChildControls(childId);
    }
  }

  // Update child controls
  static async updateChildControls(childId: string, controls: Partial<ChildControls>): Promise<boolean> {
    try {
      // Try Supabase first
      if (await this.isSupabaseAvailable()) {
        const { error } = await supabase
          .from('child_controls')
          .upsert({ child_id: childId, ...controls }, { onConflict: 'child_id' });

        if (!error) {
          // Create notification for settings update
          await NotificationService.createNotification({
            recipient_id: childId,
            recipient_type: 'child',
            type: 'info',
            title: '⚙️ Configurações Atualizadas',
            message: 'Seus pais atualizaram algumas configurações da sua conta.',
            data: { controls_updated: true },
            priority: 'low'
          });

          return true;
        }
      }

      // Fallback to localStorage
      const storageKey = `child-controls-${childId}`;
      localStorage.setItem(storageKey, JSON.stringify(controls));
      return true;

    } catch (error) {
      console.error('Error updating child controls:', error);
      return false;
    }
  }

  // Get family settings
  static async getFamilySettings(familyId: string): Promise<FamilySettings> {
    try {
      if (await this.isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('family_settings')
          .select('*')
          .eq('family_id', familyId)
          .single();

        if (!error && data) {
          return this.mapToFamilySettings(data);
        }
      }

      return this.getDefaultFamilySettings(familyId);

    } catch (error) {
      console.error('Error getting family settings:', error);
      return this.getDefaultFamilySettings(familyId);
    }
  }

  // Update family settings
  static async updateFamilySettings(familyId: string, settings: Partial<FamilySettings>): Promise<boolean> {
    try {
      if (await this.isSupabaseAvailable()) {
        const { error } = await supabase
          .from('family_settings')
          .upsert({ family_id: familyId, ...settings }, { onConflict: 'family_id' });

        return !error;
      }

      // Fallback to localStorage
      localStorage.setItem(`family-settings-${familyId}`, JSON.stringify(settings));
      return true;

    } catch (error) {
      console.error('Error updating family settings:', error);
      return false;
    }
  }

  // Approve or reject pending requests
  static async handleApprovalRequest(
    requestId: string,
    approved: boolean,
    parentNote?: string
  ): Promise<boolean> {
    try {
      // Get the request details first
      const request = await this.getApprovalRequest(requestId);
      if (!request) return false;

      if (approved) {
        // Execute the approved action (spending, goal withdrawal, etc.)
        await this.executeApprovedAction(request);

        // Create success notification for child
        await NotificationService.createNotification({
          recipient_id: request.child_id,
          recipient_type: 'child',
          type: 'success',
          title: '✅ Solicitação Aprovada!',
          message: `Sua solicitação "${request.title}" foi aprovada pelos pais.`,
          data: { 
            request_id: requestId,
            amount: request.amount,
            approved: true,
            parent_note: parentNote 
          },
          priority: 'high'
        });
      } else {
        // Create rejection notification for child
        await NotificationService.createNotification({
          recipient_id: request.child_id,
          recipient_type: 'child',
          type: 'info',
          title: '❌ Solicitação Rejeitada',
          message: `Sua solicitação "${request.title}" não foi aprovada.`,
          data: { 
            request_id: requestId,
            approved: false,
            parent_note: parentNote || 'Converse com seus pais para entender o motivo.' 
          },
          priority: 'medium'
        });
      }

      // Update request status
      await this.updateApprovalRequestStatus(requestId, approved ? 'approved' : 'rejected', parentNote);

      return true;

    } catch (error) {
      console.error('Error handling approval request:', error);
      return false;
    }
  }

  // Generate comprehensive parental report
  static async generateParentalReport(
    familyId: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<ParentalReport> {
    try {
      const children = await StorageAdapter.getChildren(familyId);
      const dateRange = this.getDateRangeForPeriod(period);

      // Get family performance data
      const familyAnalytics = await AnalyticsService.getFamilyAnalytics(familyId);

      // Get individual child reports
      const childReports = await Promise.all(
        children.map(child => this.generateChildReport(child, dateRange))
      );

      // Calculate educational progress
      const educationalProgress = await this.calculateEducationalProgress(familyId, dateRange);

      // Generate alerts summary
      const alertsSummary = await this.generateAlertsSummary(familyId, dateRange);

      return {
        period: this.formatPeriodName(period),
        family_performance: {
          total_savings: familyAnalytics.overview.total_balance,
          total_earnings: familyAnalytics.overview.total_earned || 0,
          total_spending: familyAnalytics.overview.total_spent || 0,
          savings_rate: familyAnalytics.overview.family_savings_rate || 0,
          financial_health_trend: this.determineTrend(familyAnalytics.weekly_trends)
        },
        child_reports: childReports,
        educational_progress: educationalProgress,
        alerts_summary: alertsSummary
      };

    } catch (error) {
      console.error('Error generating parental report:', error);
      return this.getEmptyParentalReport(period);
    }
  }

  // Get spending alerts for parents
  static async getSpendingAlerts(familyId: string): Promise<Array<{
    child: Child;
    alert_type: 'over_limit' | 'unusual_pattern' | 'large_purchase' | 'category_concern';
    severity: 'low' | 'medium' | 'high';
    message: string;
    amount?: number;
    suggestions: string[];
  }>> {
    try {
      const children = await StorageAdapter.getChildren(familyId);
      const alerts: Array<any> = [];

      for (const child of children) {
        // Check spending limits
        const controls = await this.getChildControls(child.id);
        const recentSpending = await this.getRecentSpending(child.id, 7); // Last 7 days

        // Check daily/weekly limits
        if (recentSpending.daily_total > controls.spending_limits.daily_limit) {
          alerts.push({
            child,
            alert_type: 'over_limit',
            severity: 'high',
            message: `${child.name} excedeu o limite diário de gastos`,
            amount: recentSpending.daily_total,
            suggestions: [
              'Revise os limites diários',
              'Converse sobre planejamento de gastos',
              'Considere pausar gastos hoje'
            ]
          });
        }

        // Check unusual spending patterns
        const spendingPattern = await this.analyzeSpendingPattern(child.id);
        if (spendingPattern.is_unusual) {
          alerts.push({
            child,
            alert_type: 'unusual_pattern',
            severity: 'medium',
            message: `Padrão de gastos incomum detectado para ${child.name}`,
            suggestions: [
              'Verifique as últimas transações',
              'Converse sobre os gastos recentes',
              'Ajuste limites se necessário'
            ]
          });
        }
      }

      return alerts;

    } catch (error) {
      console.error('Error getting spending alerts:', error);
      return [];
    }
  }

  // Private helper methods
  private static async getChildSummary(child: Child) {
    const weeklyEarnings = await this.getWeeklyEarnings(child.id);
    const weeklySpending = await this.getWeeklySpending(child.id);
    const activeGoals = await this.getChildActiveGoals(child.id);
    const completedTasks = await this.getWeeklyTasksForChild(child.id);
    const healthScore = this.calculateChildHealthScore(child, weeklyEarnings, weeklySpending);

    return {
      child,
      current_balance: child.balance,
      weekly_earnings: weeklyEarnings,
      weekly_spending: weeklySpending,
      active_goals: activeGoals,
      completed_tasks: completedTasks,
      current_level: child.level,
      health_score: healthScore,
      status: this.determineChildStatus(healthScore, child),
      last_activity: await this.getLastActivity(child.id)
    };
  }

  private static calculateChildHealthScore(child: Child, earnings: number, spending: number): number {
    let score = 70; // Base score

    // Savings ratio
    const savingsRatio = child.balance / Math.max(child.total_earned, 1);
    score += savingsRatio * 20;

    // Recent activity
    if (earnings > 0) score += 10;
    if (spending < earnings) score += 10;

    // Level progression
    score += Math.min(child.level * 2, 10);

    return Math.min(Math.max(score, 0), 100);
  }

  private static determineChildStatus(
    healthScore: number, 
    child: Child
  ): 'excellent' | 'good' | 'needs_attention' | 'concerning' {
    if (healthScore >= 85) return 'excellent';
    if (healthScore >= 70) return 'good';
    if (healthScore >= 50) return 'needs_attention';
    return 'concerning';
  }

  private static async getRecentFamilyActivity(familyId: string) {
    // Mock implementation - would integrate with transactions and achievements
    return [
      {
        id: 'activity-1',
        type: 'level_up' as const,
        child_name: 'João',
        child_avatar: '👦',
        title: 'Subiu de nível!',
        description: 'João alcançou o nível 5 completando tarefas',
        timestamp: new Date().toISOString(),
        requires_attention: false
      }
    ];
  }

  private static async getPendingApprovals(familyId: string) {
    // Mock implementation - would get real pending requests
    return [];
  }

  private static async generateAlertsAndInsights(familyId: string, children: Child[]) {
    const alerts: ParentalOverview['alerts_and_insights'] = [];

    // Analyze each child for patterns
    for (const child of children) {
      // Spending pattern analysis
      if (child.balance < 20) {
        alerts.push({
          id: `alert-low-balance-${child.id}`,
          type: 'spending_pattern',
          severity: 'warning',
          title: 'Saldo Baixo',
          message: `${child.name} está com saldo baixo. Considere revisar os gastos recentes.`,
          child_affected: child.name,
          suggested_actions: [
            'Revisar últimas transações',
            'Conversar sobre economia',
            'Ajustar mesada se necessário'
          ],
          created_at: new Date().toISOString()
        });
      }

      // Savings milestone
      if (child.balance >= 100) {
        alerts.push({
          id: `alert-savings-${child.id}`,
          type: 'savings_milestone',
          severity: 'success',
          title: 'Meta de Poupança',
          message: `${child.name} alcançou R$ ${child.balance.toFixed(2)} em poupança! Hora de celebrar.`,
          child_affected: child.name,
          suggested_actions: [
            'Parabenizar o progresso',
            'Discutir próximas metas',
            'Considerar recompensa especial'
          ],
          created_at: new Date().toISOString()
        });
      }
    }

    return alerts;
  }

  private static getDefaultChildControls(childId: string): ChildControls {
    return {
      child_id: childId,
      spending_limits: {
        daily_limit: 50,
        weekly_limit: 200,
        monthly_limit: 500,
        category_limits: {
          'toys': 100,
          'snacks': 30,
          'games': 80,
          'books': 50
        }
      },
      approval_requirements: {
        require_approval_above: 25,
        auto_approve_categories: ['books', 'school'],
        blocked_categories: [],
        restricted_times: []
      },
      allowance_config: {
        base_allowance: 50,
        frequency: 'weekly',
        bonus_multipliers: {
          'excellent_grades': 1.2,
          'extra_chores': 1.1,
          'good_behavior': 1.05
        },
        automatic_distribution: true,
        next_allowance_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      educational_settings: {
        age_appropriate_content: true,
        financial_lessons_enabled: true,
        goal_setting_guidance: true,
        spending_insights_enabled: true
      }
    };
  }

  private static getDefaultFamilySettings(familyId: string): FamilySettings {
    return {
      family_id: familyId,
      general_settings: {
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        family_name: 'Família',
        notification_preferences: {
          email_notifications: true,
          push_notifications: true,
          weekly_reports: true,
          achievement_alerts: true
        }
      },
      financial_education: {
        savings_rate_target: 20,
        interest_rate_simulation: 0.5,
        financial_goals_encouraged: true,
        spending_tracking_mandatory: true
      },
      parental_controls: {
        require_parent_approval_above: 30,
        blocked_websites: [],
        restricted_spending_times: [],
        maximum_daily_screen_rewards: 120
      }
    };
  }

  // Utility methods
  private static getEmptyDashboardOverview(): ParentalOverview {
    return {
      family_summary: {
        total_children: 0,
        total_family_balance: 0,
        total_monthly_allowance: 0,
        active_goals_count: 0,
        completed_tasks_this_week: 0,
        pending_approvals: 0,
        family_financial_health: 0
      },
      children_summary: [],
      recent_activity: [],
      pending_approvals: [],
      alerts_and_insights: []
    };
  }

  private static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('children').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Placeholder implementations for complex calculations
  private static async getActiveGoalsCount(children: Child[]): Promise<number> {
    let total = 0;
    for (const child of children) {
      const goals = await GoalsService.getChildGoals(child.id, false);
      total += goals.filter(g => g.is_active && !g.is_completed).length;
    }
    return total;
  }

  private static async getWeeklyTasksCount(children: Child[]): Promise<number> {
    // Mock implementation - would integrate with tasks service
    return children.length * Math.floor(Math.random() * 10) + 5;
  }

  private static async getPendingApprovalsCount(familyId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 5);
  }

  private static calculateMonthlyAllowance(children: Child[]): number {
    return children.length * 200; // Default R$ 200/month per child
  }

  private static calculateFamilyHealthScore(children: Child[]): number {
    if (children.length === 0) return 0;

    const totalBalance = children.reduce((sum, child) => sum + child.balance, 0);
    const totalEarned = children.reduce((sum, child) => sum + child.total_earned, 0);
    const savingsRate = totalEarned > 0 ? (totalBalance / totalEarned) * 100 : 0;

    let healthScore = 60; // Base score
    healthScore += Math.min(savingsRate, 40); // Up to 40 points for savings rate

    return Math.min(Math.max(healthScore, 0), 100);
  }

  private static async getWeeklyEarnings(childId: string): Promise<number> {
    // Mock implementation - would calculate from recent transactions
    return Math.floor(Math.random() * 100) + 20;
  }

  private static async getWeeklySpending(childId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 80) + 10;
  }

  private static async getChildActiveGoals(childId: string): Promise<number> {
    const goals = await GoalsService.getChildGoals(childId, false);
    return goals.filter(g => g.is_active && !g.is_completed).length;
  }

  private static async getWeeklyTasksForChild(childId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 15) + 5;
  }

  private static async getLastActivity(childId: string): Promise<string> {
    // Mock implementation - would get from recent transactions/activities
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  private static mapToChildControls(data: any): ChildControls {
    return data; // Would properly map from database structure
  }

  private static mapToFamilySettings(data: any): FamilySettings {
    return data; // Would properly map from database structure
  }

  private static getDateRangeForPeriod(period: 'week' | 'month' | 'quarter'): { from: string; to: string } {
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
    }
    
    return { from: now.toISOString().split('T')[0], to };
  }

  private static formatPeriodName(period: 'week' | 'month' | 'quarter'): string {
    const names = {
      week: 'Última Semana',
      month: 'Último Mês', 
      quarter: 'Últimos 3 Meses'
    };
    return names[period];
  }

  private static getEmptyParentalReport(period: string): ParentalReport {
    return {
      period: this.formatPeriodName(period as any),
      family_performance: {
        total_savings: 0,
        total_earnings: 0,
        total_spending: 0,
        savings_rate: 0,
        financial_health_trend: 'stable'
      },
      child_reports: [],
      educational_progress: {
        lessons_completed: 0,
        skills_developed: [],
        areas_for_improvement: []
      },
      alerts_summary: {
        spending_alerts: 0,
        goal_alerts: 0,
        behavioral_alerts: 0,
        positive_highlights: 0
      }
    };
  }

  // Additional helper methods would be implemented based on specific needs
  private static async getApprovalRequest(requestId: string): Promise<any> {
    // Would fetch from database/storage
    return null;
  }

  private static async executeApprovedAction(request: any): Promise<void> {
    // Would execute the approved transaction
  }

  private static async updateApprovalRequestStatus(requestId: string, status: string, note?: string): Promise<void> {
    // Would update the request status
  }

  private static async generateChildReport(child: Child, dateRange: any): Promise<any> {
    // Would generate detailed child report
    return {
      child,
      performance: {
        tasks_completed: 0,
        goals_achieved: 0,
        savings_amount: child.balance,
        spending_patterns: {},
        behavioral_insights: [],
        recommendations: []
      }
    };
  }

  private static async calculateEducationalProgress(familyId: string, dateRange: any): Promise<any> {
    return {
      lessons_completed: 0,
      skills_developed: [],
      areas_for_improvement: []
    };
  }

  private static async generateAlertsSummary(familyId: string, dateRange: any): Promise<any> {
    return {
      spending_alerts: 0,
      goal_alerts: 0,
      behavioral_alerts: 0,
      positive_highlights: 0
    };
  }

  private static determineTrend(weeklyTrends: any): 'improving' | 'stable' | 'declining' {
    return 'stable'; // Would calculate based on trends
  }

  private static async getRecentSpending(childId: string, days: number): Promise<any> {
    return { daily_total: 0, weekly_total: 0 };
  }

  private static async analyzeSpendingPattern(childId: string): Promise<any> {
    return { is_unusual: false };
  }

  // ============ INTEREST CONFIGURATION MANAGEMENT ============
  
  static async getInterestConfig(childId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('interest_config')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching interest config:', error);
        return null;
      }

      // Se não existe, retornar configuração padrão
      if (!data) {
        return {
          child_id: childId,
          monthly_rate: 0.01, // 1% ao mês
          annual_rate: 0.01,  // Deprecated
          minimum_balance: 10.00,
          is_active: true,
          compound_frequency: 'monthly'
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting interest config:', error);
      return null;
    }
  }

  static async updateInterestConfig(childId: string, config: {
    monthly_rate?: number;
    minimum_balance?: number;
    is_active?: boolean;
  }): Promise<boolean> {
    try {
      // Primeiro, tentar buscar configuração existente
      const { data: existingConfig } = await supabase
        .from('interest_config')
        .select('*')
        .eq('child_id', childId)
        .single();
      
      if (!existingConfig) {
        // Criar nova configuração
        const { error } = await supabase
          .from('interest_config')
          .insert([{
            child_id: childId,
            monthly_rate: config.monthly_rate || 0.01,
            annual_rate: config.monthly_rate || 0.01, // Manter compatibilidade
            minimum_balance: config.minimum_balance || 10.00,
            is_active: config.is_active !== undefined ? config.is_active : true,
            compound_frequency: 'monthly'
          }]);

        if (error) {
          console.error('Error creating interest config:', error);
          return false;
        }
      } else {
        // Atualizar configuração existente
        const updateData: any = {};
        if (config.monthly_rate !== undefined) {
          updateData.monthly_rate = config.monthly_rate;
          updateData.annual_rate = config.monthly_rate; // Manter compatibilidade
        }
        if (config.minimum_balance !== undefined) {
          updateData.minimum_balance = config.minimum_balance;
        }
        if (config.is_active !== undefined) {
          updateData.is_active = config.is_active;
        }

        const { error } = await supabase
          .from('interest_config')
          .update(updateData)
          .eq('child_id', childId);

        if (error) {
          console.error('Error updating interest config:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating interest config:', error);
      return false;
    }
  }

  // ============ ALLOWANCE CONFIGURATION MANAGEMENT ============
  
  static async getAllowanceConfig(childId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('allowance_config')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching allowance config:', error);
        return null;
      }

      // Se não existe, retornar configuração padrão
      if (!data) {
        return {
          child_id: childId,
          amount: 25.00,
          frequency: 'weekly',
          day_of_week: 1, // Monday
          day_of_month: 1,
          is_active: true,
          next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting allowance config:', error);
      return null;
    }
  }

  static async updateAllowanceConfig(childId: string, config: {
    amount?: number;
    frequency?: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    is_active?: boolean;
  }): Promise<boolean> {
    try {
      // Primeiro, tentar buscar configuração existente
      const { data: existingConfig } = await supabase
        .from('allowance_config')
        .select('*')
        .eq('child_id', childId)
        .single();
      
      if (!existingConfig) {
        // Criar nova configuração
        const nextPaymentDate = this.calculateNextPaymentDate(
          config.frequency || 'weekly',
          config.day_of_week || 1,
          config.day_of_month || 1
        );

        const { error } = await supabase
          .from('allowance_config')
          .insert([{
            child_id: childId,
            amount: config.amount || 25.00,
            frequency: config.frequency || 'weekly',
            day_of_week: config.day_of_week || 1,
            day_of_month: config.day_of_month || 1,
            is_active: config.is_active !== undefined ? config.is_active : true,
            next_payment_date: nextPaymentDate
          }]);

        if (error) {
          console.error('Error creating allowance config:', error);
          return false;
        }
      } else {
        // Atualizar configuração existente
        const updateData: any = {};
        if (config.amount !== undefined) updateData.amount = config.amount;
        if (config.frequency !== undefined) updateData.frequency = config.frequency;
        if (config.day_of_week !== undefined) updateData.day_of_week = config.day_of_week;
        if (config.day_of_month !== undefined) updateData.day_of_month = config.day_of_month;
        if (config.is_active !== undefined) updateData.is_active = config.is_active;

        // Recalcular próxima data de pagamento se necessário
        if (config.frequency || config.day_of_week || config.day_of_month) {
          updateData.next_payment_date = this.calculateNextPaymentDate(
            config.frequency || existingConfig.frequency,
            config.day_of_week !== undefined ? config.day_of_week : existingConfig.day_of_week,
            config.day_of_month !== undefined ? config.day_of_month : existingConfig.day_of_month
          );
        }

        const { error } = await supabase
          .from('allowance_config')
          .update(updateData)
          .eq('child_id', childId);

        if (error) {
          console.error('Error updating allowance config:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating allowance config:', error);
      return false;
    }
  }

  private static calculateNextPaymentDate(
    frequency: 'daily' | 'weekly' | 'monthly',
    dayOfWeek: number,
    dayOfMonth: number
  ): string {
    const now = new Date();
    let nextDate = new Date(now);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        // Set to next occurrence of dayOfWeek (0=Sunday, 1=Monday, etc.)
        const currentDay = nextDate.getDay();
        const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
        nextDate.setDate(nextDate.getDate() + daysUntilNext);
        break;
      case 'monthly':
        // Set to next occurrence of dayOfMonth
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
        break;
    }

    return nextDate.toISOString().split('T')[0];
  }
}