<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Navigation2, Clock, Banknote } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  isDriving: Boolean,
  title: String,
  subTitle: String,
  eta: String,
  fare: Number,
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <header
      v-if="isDriving"
      class="absolute top-0 inset-x-0 bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 z-40 pt-safe px-5 pb-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <Navigation2 class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-base font-black text-white leading-tight">{{ title }}</h2>
            <p class="text-emerald-400 text-xs font-semibold mt-0.5">{{ subTitle }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5"
          >
            <Clock class="w-3.5 h-3.5 text-indigo-300" />
            <span class="text-indigo-200 text-sm font-bold">{{ eta }}</span>
          </div>
          <div
            class="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5"
          >
            <Banknote class="w-3.5 h-3.5 text-amber-400" />
            <span class="text-amber-300 text-sm font-bold font-mono">{{
              fare?.toLocaleString()
            }}</span>
          </div>
        </div>
      </div>
    </header>
  </Transition>
</template>

<style scoped>
.pt-safe {
  padding-top: max(1.25rem, env(safe-area-inset-top));
}
</style>
