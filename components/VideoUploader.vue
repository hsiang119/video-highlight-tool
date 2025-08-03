<script setup lang="ts">
import type { AiProcessingResult } from '~/types';

// 定義事件，用於通知父元件處理完成
const emit = defineEmits<{
  (e: 'processingComplete', payload: { videoUrl: string; duration: number } & AiProcessingResult): void
}>();

const isProcessing = ref(false);
const errorMessage = ref<string | null>(null);

// 使用客戶端 mock AI composable
const { processMockAI } = useMockAI();

const processVideoFile = async (file: File) => {
  if (!file) return;

  isProcessing.value = true;
  errorMessage.value = null;
  
  const videoUrl = URL.createObjectURL(file);
  const videoElement = document.createElement('video');
  videoElement.src = videoUrl;

  videoElement.onloadedmetadata = async () => {
    try {
      // 使用 composable 而不是 API 調用
      const aiResult = await processMockAI({
        duration: videoElement.duration,
        fileName: file.name,
      });
      
      emit('processingComplete', { videoUrl, duration: videoElement.duration, ...aiResult });
    } catch (error) {
      console.error('AI 處理失敗:', error);
      errorMessage.value = '影片處理失敗，請檢查主控台或稍後再試。';
    } finally {
      isProcessing.value = false;
    }
  };

  videoElement.onerror = () => {
    console.error('影片載入失敗');
    errorMessage.value = '無法讀取影片檔案，請確認檔案格式是否正確。';
    isProcessing.value = false;
    URL.revokeObjectURL(videoUrl);
  };
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    await processVideoFile(file);
  }
};

const handleDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    await processVideoFile(file);
  }
};
</script>

<template>
  <div class="w-[200px] h-[200px] mx-auto">
      <div 
        class="upload-zone h-full flex flex-col items-center justify-center cursor-pointer"
        :class="{ 'pointer-events-none opacity-50': isProcessing }"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
          <!-- 上傳按鈕 -->
          <label  
            class="cursor-pointer btn h-11 min-h-fit min-w-20 rounded-full border-none font-medium text-white shadow-button-lg !outline-none hover:bg-primary/80 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200;"
            :class="{ 'pointer-events-none opacity-50': isProcessing }"
          >
            <input  
              type="file" 
              class="hidden" 
              accept="video/*" 
              @change="handleFileChange"
            />
            {{ '選擇檔案' }}
          </label>
          
          <!-- 支援格式 -->
          <p class="text-xs text-text-tertiary mt-4">
            支援 MP4、WebM、MOV 格式 (建議上傳大於 00:01:10 的影片)
          </p>

      </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="mt-4 alert alert-error">
      <div class="flex items-center">
        <Icon name="mdi:alert-circle-outline" class="h-5 w-5 text-error mr-2" />
        <span class="text-sm">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>