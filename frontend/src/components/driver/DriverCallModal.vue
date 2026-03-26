<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  show: Boolean,
  departure: String,
  destination: String
})

defineEmits(['accept', 'reject'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div
      class="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden p-8 text-center shadow-2xl animate-in zoom-in duration-300">
      <h3 class="text-2xl font-black text-slate-900 mb-2">새로운 콜이 도착했습니다</h3>

      <p class="text-slate-500 mb-8 text-lg font-medium">
        {{ departure || '출발지 미정' }} → {{ destination || '도착지 미정' }}
      </p>

      <div class="flex gap-3">
        <button @click="$emit('reject')" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">
          거절
        </button>
        <button @click="$emit('accept')"
          class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200">
          수락
        </button>
      </div>
    </div>
  </div>
</template>