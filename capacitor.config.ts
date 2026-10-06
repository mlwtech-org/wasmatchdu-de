import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wasmatchdu.app',
  appName: 'JanataTv IPTV',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
