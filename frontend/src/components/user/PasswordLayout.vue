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
 * 2. CONFIG & STORES (Props 및 라우터 설정)
 * ==============================================================================
 */
const router = useRouter()

defineProps({
  title: String,
  description: String,
  showBack: { type: Boolean, default: false },
  icon: [Object, Function] // Lucide 아이콘 객체
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 font-sans">
    
    <div class="bg-white w-full max-w-md rounded-[24px] shadow-xl overflow-hidden relative border border-white/50 p-8">
      
      <button 
        v-if="showBack" 
        @click="router.back()"
        class="absolute top-6 left-6 p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div 
        class="mt-4 flex flex-col items-center text-center" 
        :class="{ 'mt-8': showBack }"
      >
        <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600 ring-8 ring-indigo-50/50">
          <component :is="icon" class="w-8 h-8" v-if="icon" />
        </div>

        <h2 class="text-2xl font-bold text-slate-900">
          {{ title }}
        </h2>

        <p class="text-slate-500 mt-2 text-sm leading-relaxed whitespace-pre-line">
          {{ description }}
        </p>
      </div>

      <div class="mt-8">
        <slot></slot>
      </div>

      <div v-if="$slots.footer" class="mt-8 text-center">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>