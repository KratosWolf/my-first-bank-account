import { supabase } from '@/lib/supabase';

export interface Notification {
  id?: string;
  recipient_id: string; // child or parent ID
  recipient_type: 'child' | 'parent';
  type: 'achievement' | 'chore_completed' | 'level_up' | 'streak' | 'reward' | 'reminder';
  title: string;
  message: string;
  data?: {
    achievement?: any;
    chore_id?: string;
    level?: number;
    streak_count?: number;
    reward_amount?: number;
    [key: string]: any;
  };
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  expires_at?: string;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        // Fallback to in-memory notification for development
        return this.createInMemoryNotification(notification);
      }

      // Send real-time notification if possible
      this.sendRealTimeNotification(data);
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return this.createInMemoryNotification(notification);
    }
  }

  // Get notifications for a user
  static async getNotifications(recipientId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting notifications:', error);
        return this.getInMemoryNotifications(recipientId);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return this.getInMemoryNotifications(recipientId);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(recipientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Get unread notification count
  static async getUnreadCount(recipientId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Achievement-specific notification creators
  static async notifyAchievement(childId: string, parentId: string, achievement: any): Promise<void> {
    // Notify child
    await this.createNotification({
      recipient_id: childId,
      recipient_type: 'child',
      type: 'achievement',
      title: `🎉 Nova Conquista: ${achievement.title}`,
      message: achievement.description,
      data: { achievement },
      priority: 'high',
      expires_at: this.getExpirationDate(7) // Expire in 7 days
    });

    // Notify parent
    await this.createNotification({
      recipient_id: parentId,
      recipient_type: 'parent',
      type: 'achievement',
      title: `🏆 Conquista Desbloqueada!`,
      message: `Seu filho desbloqueou a conquista "${achievement.title}"`,
      data: { achievement, child_id: childId },
      priority: 'medium',
      expires_at: this.getExpirationDate(3)
    });
  }

  static async notifyLevelUp(childId: string, parentId: string, newLevel: number, xpReward?: number): Promise<void> {
    // Notify child
    await this.createNotification({
      recipient_id: childId,
      recipient_type: 'child',
      type: 'level_up',
      title: `⭐ Subiu de Nível!`,
      message: `Parabéns! Você alcançou o nível ${newLevel}!`,
      data: { level: newLevel, xp_reward: xpReward },
      priority: 'high',
      expires_at: this.getExpirationDate(7)
    });

    // Notify parent
    await this.createNotification({
      recipient_id: parentId,
      recipient_type: 'parent',
      type: 'level_up',
      title: `🎉 Nível ${newLevel} Alcançado!`,
      message: `Seu filho subiu para o nível ${newLevel}!`,
      data: { level: newLevel, child_id: childId },
      priority: 'medium',
      expires_at: this.getExpirationDate(3)
    });
  }

  static async notifyStreak(childId: string, parentId: string, streakCount: number): Promise<void> {
    if (streakCount < 3) return; // Only notify for significant streaks

    // Notify child
    await this.createNotification({
      recipient_id: childId,
      recipient_type: 'child',
      type: 'streak',
      title: `🔥 Sequência de ${streakCount} dias!`,
      message: `Incrível! Você completou tarefas por ${streakCount} dias seguidos!`,
      data: { streak_count: streakCount },
      priority: streakCount >= 7 ? 'high' : 'medium',
      expires_at: this.getExpirationDate(5)
    });

    // Notify parent
    await this.createNotification({
      recipient_id: parentId,
      recipient_type: 'parent',
      type: 'streak',
      title: `🔥 Sequência Impressionante!`,
      message: `Seu filho mantém uma sequência de ${streakCount} dias completando tarefas!`,
      data: { streak_count: streakCount, child_id: childId },
      priority: 'medium',
      expires_at: this.getExpirationDate(3)
    });
  }

  static async notifyChoreCompleted(childId: string, parentId: string, choreName: string, rewardAmount: number): Promise<void> {
    // Notify parent only (child gets immediate feedback in app)
    await this.createNotification({
      recipient_id: parentId,
      recipient_type: 'parent',
      type: 'chore_completed',
      title: `✅ Tarefa Concluída!`,
      message: `Tarefa "${choreName}" foi concluída e aguarda aprovação.`,
      data: { chore_name: choreName, reward_amount: rewardAmount, child_id: childId },
      priority: 'medium',
      expires_at: this.getExpirationDate(1)
    });
  }

  // Helper methods
  private static getExpirationDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  // Fallback in-memory notification system for development
  private static inMemoryNotifications: Notification[] = [];

  private static createInMemoryNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      is_read: false
    };

    this.inMemoryNotifications.unshift(newNotification);
    
    // Keep only last 100 notifications in memory
    if (this.inMemoryNotifications.length > 100) {
      this.inMemoryNotifications = this.inMemoryNotifications.slice(0, 100);
    }

    console.log('📬 In-memory notification created:', newNotification.title);
    return newNotification;
  }

  private static getInMemoryNotifications(recipientId: string): Notification[] {
    return this.inMemoryNotifications
      .filter(n => n.recipient_id === recipientId)
      .slice(0, 20);
  }

  // Real-time notification sending (placeholder for future implementation)
  private static sendRealTimeNotification(notification: Notification): void {
    // This could be implemented with:
    // - WebSocket connections
    // - Server-Sent Events
    // - Push notifications (service worker)
    // - Email notifications
    
    console.log('📡 Real-time notification sent:', notification.title);
    
    // For now, just show in console for development
    if (typeof window !== 'undefined') {
      // Could trigger a browser notification here
      console.log(`🔔 ${notification.title}: ${notification.message}`);
    }
  }

  // Subscribe to real-time notifications (Supabase realtime)
  static subscribeToNotifications(recipientId: string, callback: (notification: Notification) => void) {
    try {
      const subscription = supabase
        .channel(`notifications:${recipientId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${recipientId}`
          },
          (payload) => {
            console.log('📨 Real-time notification received:', payload.new);
            callback(payload.new as Notification);
          }
        )
        .subscribe();

      return subscription;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }

  // Cleanup expired notifications
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', now);

      if (error) {
        console.error('Error cleaning up expired notifications:', error);
      } else {
        console.log('✨ Expired notifications cleaned up');
      }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}