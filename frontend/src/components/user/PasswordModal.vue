<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 및 Emits 정의)
 * ==============================================================================
 */
defineProps({
  isOpen: Boolean,
  title: String,
  description: String,
  buttonText: { type: String, default: '확인' },
  icon: [Object, Function],
  iconClass: { type: String, default: 'bg-indigo-50 text-indigo-600' }
})

defineEmits(['confirm']) // 확인 버튼 클릭 시 부모에게 알림
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
    <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" :class="iconClass">
        <component :is="icon" class="w-8 h-8" v-if="icon" />
      </div>
      
      <h3 class="text-xl font-bold text-slate-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-500 mb-8 leading-relaxed whitespace-pre-line">
        <slot name="description">{{ description }}</slot>
      </p>

      <button 
        @click="$emit('confirm')" 
        class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>