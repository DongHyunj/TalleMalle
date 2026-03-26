<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { AlertTriangle } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const emits = defineEmits(['modal', 'confirm'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 모달 닫기 핸들러
const handleClose = () => {
  emits('modal', 'none')
}

// 탈퇴 확정 핸들러
const hanldeConfirm = () => {
  emits('confirm')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
  >
    <!-- 배경 클릭 시 닫기 방지(내부 클릭 전파 방지) -->
    <div
      class="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      @click.stop
    >
      <div class="p-8 text-center">
        <div class="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-8 h-8 text-rose-500" />
        </div>
        <h2 class="text-lg font-extrabold text-slate-900 mb-2">정말 탈퇴하시겠습니까?</h2>
        <p class="text-sm text-slate-500 font-medium leading-relaxed">
          탈퇴 시 사용자의 모든 데이터가 삭제되며<br />
          <span class="text-rose-500 font-bold">복구가 불가능</span>합니다.
        </p>
      </div>
      <div class="p-6 pt-0 flex gap-3">
        <button
          @click="handleClose"
          class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          취소
        </button>
        <button
          @click="hanldeConfirm"
          class="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all"
        >
          탈퇴 확정
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
