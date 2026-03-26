<script setup>
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: '접근 오류' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
})

const emit = defineEmits(['confirm'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      @click="emit('confirm')"
    >
      <div
        class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 flex flex-col items-center text-center animate-scale-up"
        @click.stop
      >
        <div
          class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4"
        >
          <AlertTriangle class="w-8 h-8" />
        </div>

        <h3 class="text-lg font-bold text-slate-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-slate-500 mb-8 leading-relaxed whitespace-pre-line">
          {{ message }}
        </p>

        <div class="flex w-full">
          <button
            @click="emit('confirm')"
            class="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes scale-up {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-up {
  animation: scale-up 0.2s ease-out forwards;
}
</style>
