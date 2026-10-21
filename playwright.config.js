import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup.js'),

  use: {
    storageState: 'auth.json', 
    
    headless: false, 
  },
});