import { Task } from '../types';
import { TODAY_IST } from '../utils/dateUtils';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface DueTaskSummary {
  urgentTasks: Task[];
  allPendingToday: Task[];
  hasUrgent: boolean;
  message: string;
}

class NotificationService {
  private lastAlertTime = 0;

  public isSupported(): boolean {
    if (Capacitor.isNativePlatform()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async getPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display === 'granted') return 'granted';
        if (status.display === 'denied') return 'denied';
        return 'default';
      } catch {
        return 'default';
      }
    }
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission as 'granted' | 'denied' | 'default';
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') return 'granted';
        if (result.display === 'denied') return 'denied';
        return 'default';
      } catch {
        return 'denied';
      }
    }
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch {
      return 'denied';
    }
  }

  public async sendNotification(title: string, body: string): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 100) },
              sound: undefined,
            },
          ],
        });
        return true;
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (e) {
        console.warn('Could not display system notification:', e);
      }
    }
    return false;
  }

  public checkPendingTasks(tasks: Task[]): DueTaskSummary {
    const todayTasks = tasks.filter((t) => t.date === TODAY_IST);
    const pendingToday = todayTasks.filter((t) => !t.completed);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const urgentTasks = pendingToday.filter((task) => {
      if (!task.dueTime) {
        return currentHour >= 18;
      }

      const timeLower = task.dueTime.toLowerCase();
      const parts = timeLower.split(' ');
      const timePart = parts[0];
      const modifier = parts[1];
      const [hoursStr, minutesStr] = timePart.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr || '0', 10);

      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const dueMinutes = hours * 60 + minutes;
      return dueMinutes - currentTimeMinutes <= 120;
    });

    let message = '';
    if (urgentTasks.length > 0) {
      const firstTask = urgentTasks[0];
      message =
        urgentTasks.length === 1
          ? `"${firstTask.title}" needs to be finished before the day ends!`
          : `You have ${urgentTasks.length} tasks needing completion today including "${firstTask.title}"!`;
    } else if (pendingToday.length > 0) {
      message = `${pendingToday.length} task${pendingToday.length > 1 ? 's' : ''} left for today.`;
    }

    return {
      urgentTasks,
      allPendingToday: pendingToday,
      hasUrgent: urgentTasks.length > 0 || (currentHour >= 19 && pendingToday.length > 0),
      message,
    };
  }

  public async triggerTaskAlertIfDue(tasks: Task[], notificationsEnabled: boolean): Promise<void> {
    if (!notificationsEnabled) return;

    const now = Date.now();
    if (now - this.lastAlertTime < 10 * 60 * 1000) return;

    const summary = this.checkPendingTasks(tasks);
    if (summary.hasUrgent && summary.urgentTasks.length > 0) {
      const sent = await this.sendNotification('LifeTrack Task Reminder ⏳', summary.message);
      if (sent) {
        this.lastAlertTime = now;
      }
    }
  }
}

export const notificationService = new NotificationService();
