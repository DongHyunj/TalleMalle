<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: { type: Number, required: true }, // 백엔드 기준 (0부터 시작)
  totalPages: { type: Number, required: true }, // 전체 페이지 수
})

const emit = defineEmits(['page-change'])

// 페이지 클릭 핸들러
const changePage = (page) => {
  if (page >= 0 && page < props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

// 화면에 보여줄 페이지 번호 계산 (현재 페이지 주변 5개만 표시)
const pageNumbers = computed(() => {
  const pages = []
  const maxVisible = 5

  let start = Math.max(0, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages - 1, start + maxVisible - 1)

  // 페이지 개수가 적을 때 시작점 보정
  if (end - start + 1 < maxVisible) {
    start = Math.max(0, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div v-if="totalPages > 0" class="flex justify-center items-center gap-2 mt-6 pb-4">
    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 0"
      class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <button
      v-for="page in pageNumbers"
      :key="page"
      @click="changePage(page)"
      :class="[
        'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
        currentPage === page
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-100',
      ]"
    >
      {{ page + 1 }}
    </button>

    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages - 1"
      class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>