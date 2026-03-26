<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { useRouter } from 'vue-router'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 정의)
 * ==============================================================================
 */
const router = useRouter()

defineProps({
  title: {
    type: String,
    required: true, // 페이지의 메인 제목 (필수)
  },
  description: {
    type: String,
    default: '',    // 제목 하단 서브 설명 (선택)
  },
})
</script>

<template>
  <div class="border-b border-slate-100 bg-white/50 w-full">
    <div class="max-w-5xl mx-auto px-8 py-8">
      
      <div class="flex items-center gap-3">
        <slot name="icon"></slot>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          {{ title }}
        </h1>
      </div>

      <p v-if="description" class="text-sm text-slate-400 font-medium mt-1">
        {{ description }}
      </p>
    </div>
  </div>
</template>