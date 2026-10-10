import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.senavoz.app',
  appName: 'SeñaVoz',
  webDir: 'dist/frontend/browser',
  server: {
    // Permite llamar a una API http en desarrollo. Con una API https se puede dejar 'https' y quitar cleartext.
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
