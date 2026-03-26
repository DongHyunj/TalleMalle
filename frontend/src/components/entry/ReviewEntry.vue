<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { Quote, Star } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
  >
    <div class="flex items-center gap-3 mb-4">
      <img
        :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.from}`"
        class="w-10 h-10 rounded-full bg-white border"
      />
      <div>
        <p class="text-xs font-bold text-slate-800">{{ review.from }}님</p>
        <p class="text-[10px] text-slate-400">{{ review.departure }} → {{ review.destination }}</p>
      </div>
    </div>

    <Quote class="absolute top-6 right-6 w-4 h-4 text-slate-200" />

    <p class="text-sm text-slate-600 leading-relaxed italic">"{{ review.contents }}"</p>

    <div class="mt-4 flex gap-1">
      <Star
        v-for="i in 5"
        :key="i"
        class="w-3 h-3"
        :class="i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'"
      />
    </div>
  </div>
</template>

<style scoped>
p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
