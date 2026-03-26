<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { AlertTriangle } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

// Emits 정의
const emit = defineEmits(['close', 'confirm'])

/**
 * ==============================================================================
 * 3. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 닫기 핸들러
const handleClose = () => {
  emit('close')
}

// 확인(나가기) 핸들러
const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<template>
  <Teleport to="body">
    <!-- 배경 오버레이 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity"
      @click="handleClose"
    >
      <!-- 모달 컨텐츠 -->
      <div
        class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 flex flex-col items-center text-center animate-scale-up"
        @click.stop
      >
        <!-- 아이콘 -->
        <div
          class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4"
        >
          <AlertTriangle class="w-8 h-8" />
        </div>

        <!-- 텍스트 -->
        <h3 class="text-lg font-bold text-slate-900 mb-2">채팅방을 나가시겠습니까?</h3>
        <p class="text-sm text-slate-500 mb-8 leading-relaxed">
          채팅방을 나가면 이 모집에서 나가집니다.
          <br />다시 복구할 수 없습니다.
        </p>

        <!-- 버튼 그룹 -->
        <div class="flex gap-3 w-full">
          <button
            @click="handleClose"
            class="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
          >
            취소
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-rose-600 transition-all"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-up {
  animation: scale-up 0.2s ease-out forwards;
}
</style>
