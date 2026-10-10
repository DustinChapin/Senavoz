import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.senavoz.app',
  appName: 'SeñaVoz',
  webDir: 'dist/frontend/browser',
  server: {
    // La API está en HTTPS (Vercel).
    androidScheme: 'https',
  },
};

export default config;
