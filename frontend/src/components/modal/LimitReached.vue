<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { AlertCircle } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const emits = defineEmits(['modal'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 모달 닫기 핸들러
const handleClose = () => {
  emits('modal', 'none')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
  >
    <div
      class="bg-white w-full max-w-xs rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
    >
      <div class="p-8 text-center">
        <div
          class="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle class="w-8 h-8 text-amber-500" />
        </div>
        <h2 class="text-lg font-extrabold text-slate-900 mb-2">등록 제한</h2>
        <p class="text-sm text-slate-500 font-medium leading-relaxed">
          결제 수단은 최대 <span class="text-indigo-600 font-bold">2개</span>까지<br />등록할 수
          있습니다.
        </p>
      </div>
      <div class="p-4 pt-0">
        <button
          @click="handleClose"
          class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
