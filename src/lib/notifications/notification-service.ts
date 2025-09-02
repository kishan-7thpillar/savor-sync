import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { ToastActionElement } from '@/components/ui/toast';

// Define notification types that match toast variants
export type NotificationType = 'info' | 'success' | 'warning' | 'default' | 'destructive' | 'error';

// Define toast variant type to match available variants in the toast component
type ToastVariantType = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  created_at: string;
}

export class NotificationService {
  private supabase = createClient();
  private subscription: RealtimeChannel | null = null;
  private userId: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        this.userId = user.id;
        this.subscribeToNotifications();
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
    this.subscribeToNotifications();
  }

  private subscribeToNotifications() {
    if (!this.userId) return;

    // Unsubscribe from any existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Subscribe to notifications table for real-time updates
    this.subscription = this.supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          this.showNotification(notification);
        }
      )
      .subscribe();
  }

  private showNotification(notification: Notification) {
    // Map 'error' type to 'destructive' for toast compatibility
    const toastVariant = notification.type === 'error' ? 'destructive' : notification.type as ToastVariantType;
    
    // Create toast without action since we can't create React elements here
    toast({
      title: notification.title,
      description: notification.message,
      variant: toastVariant,
      // We can't create a proper ToastActionElement here since it requires JSX
      // Instead, we'll handle link clicks through the description or in the UI layer
    });

    // Mark notification as read after showing it
    this.markAsRead(notification.id).catch(console.error);
  }

  public async getNotifications(limit = 10, offset = 0): Promise<Notification[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  public async getUnreadCount(): Promise<number> {
    if (!this.userId) return 0;

    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  public async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  public async markAllAsRead(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', this.userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  public async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert({
          ...notification,
          read: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  public unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();
