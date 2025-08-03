// 使用 Nuxt 3 的 useState 來管理全域狀態
export const useAppLoading = () => useState<boolean>('app.loading', () => false)
export const useAppError = () => useState<string | null>('app.error', () => null)

// 處理全域 loading 狀態
export const useLoadingState = () => {
  const loading = useAppLoading()
  const error = useAppError()

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (value: string | null) => {
    error.value = value
  }

  const clearError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    setLoading,
    setError,
    clearError
  }
}