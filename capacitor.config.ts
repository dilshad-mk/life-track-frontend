import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifetrack.app',
  appName: 'LifeTrack',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#020617',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#020617',
    },
    LocalNotifications: {
      iconColor: '#6366F1',
    },
  },
};

export default config;
