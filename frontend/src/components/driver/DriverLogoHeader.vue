<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Zap } from 'lucide-vue-next'
</script>

<template>
  <div class="absolute top-5 left-5 z-30 select-none pointer-events-none">
    <div class="flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-xl border border-white/10 pl-2.5 pr-5 py-2.5 rounded-2xl shadow-2xl">
      <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 via-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
        <Zap class="w-4 h-4 text-white fill-white" />
      </div>
      <div class="leading-none">
        <p class="text-white font-black text-base tracking-tight">탈래말래</p>
        <p class="text-indigo-400 font-bold text-[9px] tracking-[0.25em] mt-0.5">DRIVER MODE</p>
      </div>
      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse ml-1"></div>
    </div>
  </div>
</template>
