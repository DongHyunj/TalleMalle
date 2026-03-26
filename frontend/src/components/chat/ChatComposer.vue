<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { ref } from 'vue'
import { Image, Send } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Emits 정의
const emit = defineEmits(['send-message', 'send-image'])

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
const inputMessage = ref('')
const fileInput = ref(null)

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 메시지 전송 핸들러
const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return

  emit('send-message', inputMessage.value)

  // 전송 후 초기화
  inputMessage.value = ''
}

// 파일 업로드 트리거 (숨겨진 input 클릭)
const handleTriggerFileUpload = () => {
  fileInput.value?.click()
}

// 파일 선택 핸들러
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }
  emit('send-image', file)
  event.target.value = '' // 초기화 (같은 파일 다시 선택 가능하도록)
}
</script>

<template>
  <div class="relative shrink-0 z-20">
    <!-- 숨겨진 파일 인풋 -->
    <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange" />

    <div class="p-6 bg-white border-t border-slate-50">
      <div
        class="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-transparent focus-within:border-indigo-100 focus-within:bg-white transition-all"
      >
        <!-- 이미지 업로드 버튼 -->
        <button
          @click="handleTriggerFileUpload"
          class="p-2 text-slate-400 hover:text-indigo-600 transition-all focus:outline-none"
        >
          <Image class="w-6 h-6" />
        </button>

        <!-- 텍스트 입력창 -->
        <input
          v-model="inputMessage"
          @keyup.enter="handleSendMessage"
          type="text"
          placeholder="메시지를 입력하세요..."
          class="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 py-2"
        />

        <!-- 전송 버튼 -->
        <button
          @click="handleSendMessage"
          class="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition-all"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
