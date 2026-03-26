<script setup>
import { TrendingUp } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  income: { type: Number, default: 0 },
})
</script>

<template>
  <div class="bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl">
    <div class="flex items-center gap-1.5 mb-1">
      <TrendingUp class="w-3 h-3 text-emerald-400" />
      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">오늘 수익</span>
    </div>
    <div class="flex items-baseline gap-1">
      <span class="text-2xl font-black text-white font-mono tracking-tight tabular-nums">{{ income.toLocaleString() }}</span>
      <span class="text-xs font-bold text-emerald-400 mb-0.5">원</span>
    </div>
  </div>
</template>
