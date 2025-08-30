import { supabase } from '@/lib/supabase';
import { StorageAdapter } from './storage-adapter';
import { GoalsService } from './goals';
import { LeaderboardService } from './leaderboard';
import type { Child } from '@/lib/supabase';

export interface FamilyAnalytics {
  overview: {
    total_children: number;
    total_balance: number;
    total_earned: number;
    total_spent: number;
    average_age: number;
    family_savings_rate: number;
  };
  
  performance: {
    most_active_child: ChildPerformance;
    highest_earner: ChildPerformance;
    best_saver: ChildPerformance;
    fastest_goal_achiever: ChildPerformance;
  };
  
  trends: {
    weekly_earnings: WeeklyTrend[];
    monthly_spending: MonthlyTrend[];
    goal_completion_rate: number;
    chore_completion_rate: number;
  };
  
  insights: {
    educational: string[];
    recommendations: string[];
    achievements: string[];
    alerts: string[];
  };
  
  predictions: {
    next_month_earnings: number;
    goal_completion_dates: GoalPrediction[];
    savings_milestone: SavingsMilestone;
  };
}

export interface ChildPerformance {
  child_id: string;
  child_name: string;
  child_avatar: string;
  metric_value: number;
  metric_description: string;
  improvement_percentage: number;
}

export interface WeeklyTrend {
  week_start: string;
  total_earned: number;
  chores_completed: number;
  goals_progress: number;
  family_ranking: number;
}

export interface MonthlyTrend {
  month: string;
  spending: number;
  savings: number;
  categories: { [category: string]: number };
}

export interface GoalPrediction {
  goal_id: string;
  goal_title: string;
  child_name: string;
  estimated_completion: string;
  confidence_level: 'high' | 'medium' | 'low';
  suggested_actions: string[];
}

export interface SavingsMilestone {
  current_total: number;
  next_milestone: number;
  milestone_name: string;
  estimated_date: string;
  celebration_suggestion: string;
}

export interface EducationalInsight {
  title: string;
  description: string;
  category: 'financial_literacy' | 'goal_setting' | 'spending_habits' | 'saving_strategies';
  urgency: 'high' | 'medium' | 'low';
  action_items: string[];
}

export class AnalyticsService {
  
  // Get comprehensive family analytics
  static async getFamilyAnalytics(familyId: string): Promise<FamilyAnalytics> {
    try {
      const children = await StorageAdapter.getChildren(familyId);
      
      if (children.length === 0) {
        return this.getEmptyAnalytics();
      }

      const [overview, performance, trends, insights, predictions] = await Promise.all([
        this.calculateOverview(children),
        this.calculatePerformance(children, familyId),
        this.calculateTrends(children, familyId),
        this.generateInsights(children, familyId),
        this.generatePredictions(children, familyId)
      ]);

      return {
        overview,
        performance,
        trends,
        insights,
        predictions
      };

    } catch (error) {
      console.error('Error getting family analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  // Calculate overview statistics
  private static async calculateOverview(children: Child[]) {
    const totalBalance = children.reduce((sum, child) => sum + (child.balance || 0), 0);
    const totalEarned = children.reduce((sum, child) => sum + (child.total_earned || 0), 0);
    const totalSpent = children.reduce((sum, child) => sum + (child.total_spent || 0), 0);
    
    // Simulate average age (could come from child profiles)
    const averageAge = 10; // Placeholder
    
    const savingsRate = totalEarned > 0 ? (totalBalance / totalEarned) * 100 : 0;

    return {
      total_children: children.length,
      total_balance: totalBalance,
      total_earned: totalEarned,
      total_spent: totalSpent,
      average_age: averageAge,
      family_savings_rate: Math.round(savingsRate * 10) / 10
    };
  }

  // Calculate performance metrics
  private static async calculatePerformance(children: Child[], familyId: string): Promise<FamilyAnalytics['performance']> {
    // Most active (highest XP)
    const mostActive = children.reduce((max, child) => 
      (child.xp || 0) > (max.xp || 0) ? child : max, children[0]);

    // Highest earner
    const highestEarner = children.reduce((max, child) => 
      (child.total_earned || 0) > (max.total_earned || 0) ? child : max, children[0]);

    // Best saver (highest balance/earned ratio)
    const bestSaver = children.reduce((max, child) => {
      const childRate = (child.total_earned || 0) > 0 ? (child.balance || 0) / (child.total_earned || 0) : 0;
      const maxRate = (max.total_earned || 0) > 0 ? (max.balance || 0) / (max.total_earned || 0) : 0;
      return childRate > maxRate ? child : max;
    }, children[0]);

    // Get goals data for goal achiever
    const goalStats = await GoalsService.getFamilyGoalsStats(familyId);
    const fastestGoalAchiever = children[0]; // Simplified - could be enhanced

    return {
      most_active_child: {
        child_id: mostActive.id,
        child_name: mostActive.name,
        child_avatar: mostActive.avatar,
        metric_value: mostActive.xp || 0,
        metric_description: 'XP acumulados',
        improvement_percentage: 15 // Simulated improvement
      },
      highest_earner: {
        child_id: highestEarner.id,
        child_name: highestEarner.name,
        child_avatar: highestEarner.avatar,
        metric_value: highestEarner.total_earned || 0,
        metric_description: 'Total ganho',
        improvement_percentage: 23
      },
      best_saver: {
        child_id: bestSaver.id,
        child_name: bestSaver.name,
        child_avatar: bestSaver.avatar,
        metric_value: Math.round(((bestSaver.balance || 0) / Math.max(bestSaver.total_earned || 1, 1)) * 100),
        metric_description: 'Taxa de economia (%)',
        improvement_percentage: 8
      },
      fastest_goal_achiever: {
        child_id: fastestGoalAchiever.id,
        child_name: fastestGoalAchiever.name,
        child_avatar: fastestGoalAchiever.avatar,
        metric_value: goalStats.completed_goals,
        metric_description: 'Metas concluídas',
        improvement_percentage: 12
      }
    };
  }

  // Calculate trends
  private static async calculateTrends(children: Child[], familyId: string): Promise<FamilyAnalytics['trends']> {
    // Simulate weekly trends
    const weeklyTrends: WeeklyTrend[] = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      
      weeklyTrends.push({
        week_start: weekStart.toISOString().split('T')[0],
        total_earned: Math.floor(Math.random() * 200) + 50,
        chores_completed: Math.floor(Math.random() * 15) + 5,
        goals_progress: Math.floor(Math.random() * 30) + 10,
        family_ranking: Math.floor(Math.random() * 5) + 1
      });
    }

    // Simulate monthly spending trends
    const monthlyTrends: MonthlyTrend[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    for (const month of months) {
      monthlyTrends.push({
        month,
        spending: Math.floor(Math.random() * 150) + 30,
        savings: Math.floor(Math.random() * 100) + 20,
        categories: {
          'Brinquedos': Math.floor(Math.random() * 50) + 10,
          'Eletrônicos': Math.floor(Math.random() * 80) + 20,
          'Roupas': Math.floor(Math.random() * 40) + 5,
          'Experiências': Math.floor(Math.random() * 60) + 15
        }
      });
    }

    return {
      weekly_earnings: weeklyTrends,
      monthly_spending: monthlyTrends,
      goal_completion_rate: 78, // Simulated
      chore_completion_rate: 85  // Simulated
    };
  }

  // Generate educational insights
  private static async generateInsights(children: Child[], familyId: string): Promise<FamilyAnalytics['insights']> {
    const insights = {
      educational: [] as string[],
      recommendations: [] as string[],
      achievements: [] as string[],
      alerts: [] as string[]
    };

    // Educational insights based on family data
    const totalBalance = children.reduce((sum, child) => sum + (child.balance || 0), 0);
    const totalEarned = children.reduce((sum, child) => sum + (child.total_earned || 0), 0);
    const savingsRate = totalEarned > 0 ? (totalBalance / totalEarned) * 100 : 0;

    if (savingsRate > 70) {
      insights.educational.push('Parabéns! Sua família tem uma excelente taxa de economia (>70%)');
      insights.achievements.push('🏆 Super Poupadores: Taxa de economia familiar excepcional!');
    } else if (savingsRate > 50) {
      insights.educational.push('Boa taxa de economia! Continuem assim para atingir 70%');
      insights.recommendations.push('Definir uma meta familiar de 70% de taxa de economia');
    } else {
      insights.educational.push('Oportunidade: Foquem em aumentar a taxa de economia da família');
      insights.recommendations.push('Revisar gastos e criar metas de economia mais desafiadoras');
      insights.alerts.push('⚠️ Taxa de economia abaixo de 50% - revisar hábitos de gasto');
    }

    // Activity insights
    const avgXP = children.reduce((sum, child) => sum + (child.xp || 0), 0) / children.length;
    if (avgXP > 200) {
      insights.achievements.push('🌟 Família Super Ativa: Média de XP acima de 200!');
    }

    // Goal insights
    const goalStats = await GoalsService.getFamilyGoalsStats(familyId);
    if (goalStats.active_goals === 0) {
      insights.alerts.push('📋 Nenhuma meta ativa - hora de sonhar com novos objetivos!');
      insights.recommendations.push('Criar pelo menos uma meta para cada criança');
    }

    // Level progression insights
    const avgLevel = children.reduce((sum, child) => sum + (child.level || 1), 0) / children.length;
    if (avgLevel >= 3) {
      insights.achievements.push('📈 Família Experiente: Nível médio acima de 3!');
    }

    return insights;
  }

  // Generate predictions
  private static async generatePredictions(children: Child[], familyId: string): Promise<FamilyAnalytics['predictions']> {
    const totalEarned = children.reduce((sum, child) => sum + (child.total_earned || 0), 0);
    const monthlyAverage = totalEarned / 3; // Assume 3 months of data

    // Next month earnings prediction
    const nextMonthEarnings = Math.round(monthlyAverage * 1.1); // 10% growth assumption

    // Goal predictions
    const goalStats = await GoalsService.getFamilyGoalsStats(familyId);
    const goalPredictions: GoalPrediction[] = [];
    
    if (goalStats.active_goals > 0) {
      goalPredictions.push({
        goal_id: 'sample-goal',
        goal_title: 'Nintendo Switch',
        child_name: children[0]?.name || 'Criança',
        estimated_completion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence_level: 'medium',
        suggested_actions: [
          'Completar 2 tarefas extras por semana',
          'Economizar R$ 30 por semana',
          'Revisar gastos desnecessários'
        ]
      });
    }

    // Savings milestone
    const currentTotal = children.reduce((sum, child) => sum + (child.balance || 0), 0);
    const nextMilestone = currentTotal < 100 ? 100 : 
                         currentTotal < 500 ? 500 :
                         currentTotal < 1000 ? 1000 : 2000;

    const milestoneNames: { [key: number]: string } = {
      100: 'Primeiro Centenário',
      500: 'Meio Milhar',
      1000: 'Mil Reais Club',
      2000: 'Super Poupadores'
    };

    return {
      next_month_earnings: nextMonthEarnings,
      goal_completion_dates: goalPredictions,
      savings_milestone: {
        current_total: currentTotal,
        next_milestone: nextMilestone,
        milestone_name: milestoneNames[nextMilestone] || 'Marco Especial',
        estimated_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        celebration_suggestion: 'Pizza em família ou passeio especial!'
      }
    };
  }

  // Get detailed child analytics
  static async getChildAnalytics(childId: string): Promise<any> {
    try {
      const child = await StorageAdapter.getChildById(childId);
      if (!child) return null;

      const childGoals = await GoalsService.getChildGoals(childId);
      
      return {
        overview: {
          name: child.name,
          avatar: child.avatar,
          level: child.level || 1,
          xp: child.xp || 0,
          balance: child.balance || 0,
          total_earned: child.total_earned || 0,
          total_spent: child.total_spent || 0,
          savings_rate: child.total_earned > 0 ? ((child.balance || 0) / child.total_earned) * 100 : 0
        },
        goals: {
          active_goals: childGoals.filter(g => g.is_active && !g.is_completed).length,
          completed_goals: childGoals.filter(g => g.is_completed).length,
          total_goal_value: childGoals.reduce((sum, g) => sum + g.target_amount, 0),
          average_progress: childGoals.length > 0 
            ? childGoals.reduce((sum, g) => sum + GoalsService.calculateProgress(g).percentage, 0) / childGoals.length 
            : 0
        },
        recommendations: this.getChildRecommendations(child, childGoals),
        predictions: {
          next_level_date: this.predictNextLevel(child),
          next_goal_completion: this.predictNextGoalCompletion(childGoals)
        }
      };

    } catch (error) {
      console.error('Error getting child analytics:', error);
      return null;
    }
  }

  // Export analytics data
  static async exportAnalytics(familyId: string, format: 'json' | 'csv'): Promise<string> {
    const analytics = await this.getFamilyAnalytics(familyId);
    
    if (format === 'json') {
      return JSON.stringify(analytics, null, 2);
    }
    
    // CSV format (simplified)
    const csvData = [
      'Metric,Value',
      `Total Children,${analytics.overview.total_children}`,
      `Total Balance,R$ ${analytics.overview.total_balance.toFixed(2)}`,
      `Total Earned,R$ ${analytics.overview.total_earned.toFixed(2)}`,
      `Savings Rate,${analytics.overview.family_savings_rate}%`,
      `Goal Completion Rate,${analytics.trends.goal_completion_rate}%`,
      `Chore Completion Rate,${analytics.trends.chore_completion_rate}%`
    ].join('\n');
    
    return csvData;
  }

  // Helper methods
  private static getEmptyAnalytics(): FamilyAnalytics {
    return {
      overview: {
        total_children: 0,
        total_balance: 0,
        total_earned: 0,
        total_spent: 0,
        average_age: 0,
        family_savings_rate: 0
      },
      performance: {
        most_active_child: { child_id: '', child_name: '', child_avatar: '', metric_value: 0, metric_description: '', improvement_percentage: 0 },
        highest_earner: { child_id: '', child_name: '', child_avatar: '', metric_value: 0, metric_description: '', improvement_percentage: 0 },
        best_saver: { child_id: '', child_name: '', child_avatar: '', metric_value: 0, metric_description: '', improvement_percentage: 0 },
        fastest_goal_achiever: { child_id: '', child_name: '', child_avatar: '', metric_value: 0, metric_description: '', improvement_percentage: 0 }
      },
      trends: {
        weekly_earnings: [],
        monthly_spending: [],
        goal_completion_rate: 0,
        chore_completion_rate: 0
      },
      insights: {
        educational: [],
        recommendations: [],
        achievements: [],
        alerts: []
      },
      predictions: {
        next_month_earnings: 0,
        goal_completion_dates: [],
        savings_milestone: {
          current_total: 0,
          next_milestone: 100,
          milestone_name: 'Primeiro Centenário',
          estimated_date: new Date().toISOString().split('T')[0],
          celebration_suggestion: 'Comemore o primeiro marco!'
        }
      }
    };
  }

  private static getChildRecommendations(child: Child, goals: any[]): string[] {
    const recommendations = [];
    
    if ((child.xp || 0) < 100) {
      recommendations.push('Complete mais tarefas para ganhar XP e subir de nível');
    }
    
    if (goals.length === 0) {
      recommendations.push('Crie sua primeira meta financeira');
    }
    
    const savingsRate = child.total_earned > 0 ? ((child.balance || 0) / child.total_earned) * 100 : 0;
    if (savingsRate < 30) {
      recommendations.push('Tente economizar mais - meta de 50% do que você ganha');
    }
    
    return recommendations;
  }

  private static predictNextLevel(child: Child): string {
    const currentXP = child.xp || 0;
    const currentLevel = child.level || 1;
    const xpForNextLevel = Math.floor(100 * Math.pow(1.5, currentLevel));
    const xpNeeded = xpForNextLevel - currentXP;
    
    // Assuming 15 XP per week average
    const weeksNeeded = Math.ceil(xpNeeded / 15);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksNeeded * 7));
    
    return targetDate.toISOString().split('T')[0];
  }

  private static predictNextGoalCompletion(goals: any[]): string | null {
    const activeGoals = goals.filter(g => g.is_active && !g.is_completed);
    if (activeGoals.length === 0) return null;
    
    // Find goal with highest progress
    const closestGoal = activeGoals.reduce((closest, goal) => {
      const progress = GoalsService.calculateProgress(goal);
      const closestProgress = GoalsService.calculateProgress(closest);
      return progress.percentage > closestProgress.percentage ? goal : closest;
    });
    
    const progress = GoalsService.calculateProgress(closestGoal);
    return new Date(Date.now() + (progress.estimated_weeks_remaining * 7 * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
  }
}