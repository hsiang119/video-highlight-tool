// Nuxt 3 全域 middleware - 會在每次路由變更時執行
export default defineNuxtRouteMiddleware((to, from) => {
  // 這裡可以加入分析追蹤邏輯
  if (import.meta.client) {
    console.log(`Navigation: ${from.path} -> ${to.path}`)
  }
})