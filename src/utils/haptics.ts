import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'
) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // Graceful fallback
  }
};
