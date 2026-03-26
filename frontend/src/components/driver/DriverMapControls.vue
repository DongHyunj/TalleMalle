<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { TrafficCone, Crosshair } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  isTrafficOn: Boolean,
})

defineEmits(['toggle-traffic', 'recenter'])
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <button
      @click="$emit('toggle-traffic')"
      class="w-11 h-11 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center justify-center transition-all active:scale-90"
      :class="isTrafficOn
        ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-indigo-500/30'
        : 'bg-slate-950/70 text-slate-300 border-white/10 hover:bg-slate-800/80'
      "
    >
      <TrafficCone class="w-5 h-5" />
    </button>
    <button
      @click="$emit('recenter')"
      class="w-11 h-11 bg-slate-950/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 flex items-center justify-center text-slate-300 hover:bg-slate-800/80 active:scale-90 transition-all"
    >
      <Crosshair class="w-5 h-5" />
    </button>
  </div>
</template>
