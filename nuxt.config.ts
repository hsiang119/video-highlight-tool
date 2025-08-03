// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  modules: ['@nuxtjs/tailwindcss', 'nuxt-mcp', '@pinia/nuxt', '@nuxt/icon'],
  devtools: { enabled: true },
  
  // Disable SSR for GitHub Pages deployment
  ssr: false,
  
  // Configure for GitHub Pages deployment
  nitro: {
    preset: 'github_pages'
  },
  
  typescript: {
    strict: true,
    typeCheck: true
  },
  
  // Nuxt 3 Runtime Config
  runtimeConfig: {
    // 私有配置（只在伺服器端可用）
    apiSecret: '',
    
    // 公開配置（客戶端和伺服器端都可用）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      appVersion: '1.0.0'
    }
  },
  app: {
    // Set base URL based on environment (use NUXT_APP_BASE_URL in GitHub Actions)
    baseURL: process.env.NUXT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? '/video-highlight-tool-vue/' : '/'),
    buildAssetsDir: 'assets',
    head: {
      htmlAttrs: {
        'data-theme': 'dark'
      }
    }
  },
  css: ['~/assets/css/main.css']
})
