<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 및 Emits 정의)
 * ==============================================================================
 */
defineProps({
  active: Boolean // 현재 탭의 활성화 여부
})

defineEmits(['click']) // 버튼 클릭 시 부모 컴포넌트로 알림
</script>

<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex-1 py-6 text-sm font-bold border-b-2 transition-all',
      active
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
        : 'border-transparent text-slate-400 hover:text-slate-600 bg-white',
    ]"
  >
    <slot></slot>
  </button>
</template>