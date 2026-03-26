<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ChevronRight } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 정의)
 * ==============================================================================
 */
defineProps({
  label: String,    // 메인 텍스트
  subLabel: String, // 아래 작은 설명 텍스트
  to: String,       // 이동할 경로 (없으면 클릭 불가)
  showArrow: {      // to가 없어도 화살표를 강제로 보여줄지 여부
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="w-full py-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-xl px-2 group cursor-pointer"
  >
    <div class="flex flex-col">
      <span class="text-sm font-medium text-slate-700">{{ label }}</span>
      <p v-if="subLabel" class="text-xs text-slate-400 mt-1">{{ subLabel }}</p>
    </div>
    
    <div class="flex items-center gap-3">
      <slot name="right"></slot>

      <ChevronRight 
        v-if="to || showArrow" 
        class="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform" 
      />
    </div>
  </component>
</template>