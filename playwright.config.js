import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    storageState: 'auth.json', 
    
    headless: false, 
  },
});