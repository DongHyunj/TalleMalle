<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  theme: { type: String, default: 'indigo' },
})
</script>

<template>
  <div
    class="h-[100dvh] w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0f172a] text-white font-pretendard">
    <div
      class="absolute top-[-10%] right-[-20%] w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-colors duration-500"
      :class="theme === 'emerald' ? 'bg-emerald-600/20' : 'bg-indigo-600/20'"></div>
    <div
      class="absolute bottom-[-10%] left-[-20%] w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-colors duration-500"
      :class="theme === 'emerald' ? 'bg-teal-500/10' : 'bg-blue-500/10'"></div>

    <div class="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <slot></slot>
    </div>
  </div>
</template>