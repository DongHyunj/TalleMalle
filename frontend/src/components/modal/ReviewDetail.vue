<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { X, Star } from 'lucide-vue-next' // Star 아이콘도 사용되므로 추가

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  currentReview: {
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
</script>

<template>
  <div
    class="fixed inset-0 z-[190] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
  >
    <!-- 배경 클릭 시 닫기 방지 (내부 클릭 이벤트 버블링 차단) -->
    <div
      class="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
      @click.stop
    >
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-xl font-bold text-slate-900">리뷰 상세</h2>
        <button @click="handleClose">
          <X class="w-6 h-6 text-slate-400 hover:text-slate-600 transition-colors" />
        </button>
      </div>
      <div class="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
        <div class="flex items-center gap-4">
          <img
            :src="currentReview.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'"
            class="w-16 h-16 rounded-[1.5rem] bg-slate-50 border-4 border-white shadow-lg object-cover"
          />
          <div class="text-left">
            <p class="text-lg font-bold text-slate-900">{{ currentReview.from }}님</p>
            <div class="flex gap-0.5 mt-1">
              <Star
                v-for="i in 5"
                :key="i"
                class="w-4 h-4"
                :class="
                  i <= (currentReview.rating || 5)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                "
              />
            </div>
          </div>
        </div>
        <div class="bg-indigo-50 px-4 py-2 rounded-2xl">
          <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
            Manner Score
          </p>
          <p class="text-sm font-black text-indigo-600">
            + {{ (currentReview.rating || 5) * 2 }}pt
          </p>
        </div>
      </div>
      <div class="mb-8 text-left space-y-3">
        <h4 class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          동승 경로 정보
        </h4>
        <div class="flex items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div class="flex flex-col items-center gap-1">
            <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
            <div class="w-0.5 h-4 bg-slate-200"></div>
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <div class="flex-1 text-sm font-bold text-slate-700">
            <p>{{ currentReview.departure }}</p>
            <p class="mt-1">{{ currentReview.destination }}</p>
          </div>
        </div>
      </div>
      <div class="bg-slate-50 p-6 rounded-xl mb-10">
        <p class="text-base text-slate-600 leading-relaxed text-left">
          "{{ currentReview.contents }}"
        </p>
      </div>
      <button
        @click="handleClose"
        class="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all"
      >
        확인
      </button>
    </div>
  </div>
</template>

<style scoped></style>
