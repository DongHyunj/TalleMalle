<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ArrowRight, Loader2 } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  text: String,
  isLoading: Boolean,
  themeColor: { type: String, default: 'emerald' },
})
</script>

<template>
  <button type="submit" :disabled="isLoading" :class="[
    'w-full py-4 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed',
    themeColor === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40'
      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40',
  ]">
    <template v-if="!isLoading">
      <span>{{ text }}</span>
      <ArrowRight class="w-5 h-5" />
    </template>
    <template v-else>
      <Loader2 class="w-6 h-6 animate-spin" />
      <span>처리 중...</span>
    </template>
  </button>
</template>