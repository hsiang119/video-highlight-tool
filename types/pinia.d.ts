// Pinia 插件擴展的 TypeScript 定義
import 'pinia'

declare module 'pinia' {
  // 擴展 PiniaCustomProperties 來加入自定義屬性
  export interface PiniaCustomProperties {
    // 由 pinia-logger 插件加入
    $debug: () => void
    $lastUpdate: Ref<Date>
  }
  
  // 擴展 DefineStoreOptionsBase 來支援自定義選項
  export interface DefineStoreOptionsBase<S, Store> {
    // 可以加入自定義的 store 選項
    persist?: boolean | {
      key?: string
      storage?: Storage
      paths?: string[]
    }
  }
}