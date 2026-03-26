<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 및 초기 설정)
 * ==============================================================================
 */
const router = useRouter()

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="h-full flex gap-4 p-4 overflow-hidden relative">
    <div class="hidden md:block w-20 shrink-0"></div>

    <div class="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col bg-white/90 backdrop-blur border border-white/50 shadow-xl">
      
      <div class="p-8 border-b border-slate-100 flex items-center gap-4 bg-white/50">
        <button 
          @click="router.back()"
          class="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ title }}</h1>
          <p v-if="description" class="text-sm text-slate-400 font-medium mt-1">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scroll p-8">
        <div class="w-full flex flex-col items-center">
          <slot></slot>
        </div>
      </div>

      <div v-if="$slots.footer" class="p-8 border-t border-slate-100 bg-white/50 flex justify-end gap-3">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 커스텀 스크롤바 */
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>