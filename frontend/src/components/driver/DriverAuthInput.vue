<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  errorMessage: String,
  icon: Object,
})

defineEmits(['update:modelValue', 'blur'])
</script>

<template>
  <div class="space-y-1">
    <label class="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">
      {{ label }}
    </label>
    <div
      class="input-group flex items-center bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
      <component :is="icon" class="w-5 h-5 text-slate-500 mr-3 transition-colors" />
      <input :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')" :placeholder="placeholder"
        class="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full font-medium" required />
    </div>
    <Transition name="shake">
      <p v-if="errorMessage" class="text-xs text-red-400 ml-2 mt-1 font-medium">
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.shake-enter-active {
  animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>