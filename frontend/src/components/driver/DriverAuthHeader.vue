<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  title: String,
  subtitle: String,
  icon: Object,
  theme: { type: String, default: 'indigo' },
})
</script>

<template>
  <div class="text-center mb-10">
    <div
      class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-300"
      :class="theme === 'emerald'
        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
        : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/30'
        ">
      <component :is="icon" class="w-10 h-10 text-white" />
    </div>
    <h1 class="text-3xl font-black mb-2 tracking-tight">{{ title }}</h1>
    <p class="text-slate-400">{{ subtitle }}</p>
  </div>
</template>