<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { X } from 'lucide-vue-next' // 아이콘 라이브러리 추가 필요

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  currentHistory: {
    type: Object,
    required: true,
  },
})
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

// 날짜 포맷팅 유틸리티
const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  const week = ['일', '월', '화', '수', '목', '금', '토']
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const day = week[date.getDay()]
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')

  return `${yyyy}.${mm}.${dd} (${day}) ${hh}:${min}`
}
</script>

<template>
  <div
    class="fixed inset-0 z-[180] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
  >
    <div
      class="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
      @click="handleClose"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-900">탑승 상세 정보</h2>
        <button @click.stop="handleClose">
          <X class="w-6 h-6 text-slate-400" />
        </button>
      </div>
      <div class="space-y-4 mb-8 text-left" @click.stop>
        <div class="flex justify-between py-2 border-b border-slate-50">
          <span class="text-slate-400 text-sm">경로</span>
          <span class="text-slate-800 font-bold text-sm text-right"
            >{{ currentHistory.start }} → {{ currentHistory.dest }}</span
          >
        </div>
        <div class="flex flex-col py-2 border-b border-slate-50 gap-2">
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">출발 시각</span>
            <span class="text-slate-800 font-bold text-sm text-right">
              {{ formatDateTime(currentHistory.departure) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">도착 시각</span>
            <span class="text-slate-800 font-bold text-sm text-right">
              {{ formatDateTime(currentHistory.arrival) }}
            </span>
          </div>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-50">
          <span class="text-slate-400 text-sm">결제 금액</span>
          <span class="text-slate-800 font-bold text-sm text-right">{{ currentHistory.cost }}</span>
        </div>
      </div>
      <button
        @click.stop="handleClose"
        class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
      >
        확인
      </button>
    </div>
  </div>
</template>

<style scoped></style>
