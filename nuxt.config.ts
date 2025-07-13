import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  modules: ['nuxt-mcp'],
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: true
  },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/video-highlight-tool-vue/' : '/'
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
    }
  }
})
