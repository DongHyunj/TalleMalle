<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { computed } from 'vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  placeholder: String,
  length: {
    type: Object,
    default: () => ({
      min: 0,
      max: 20,
    }),
  },
  type: {
    type: String,
    default: 'text',
  },
  filterType: {
    type: String,
    default: 'none',
  },
  align: {
    type: String,
    default: 'center',
    validator: (value) => ['left', 'center', 'right'].includes(value),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue', 'input'])

/**
 * ==============================================================================
 * 3. COMPUTED (계산된 속성)
 * ==============================================================================
 */
const alignClass = computed(() => {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return alignment[props.align] || 'text-center'
})

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작) - [기능 함수]
 * ==============================================================================
 */
const handleInput = (event) => {
  if (props.readonly) return // 읽기 전용일 때는 입력 방지

  let val = event.target.value

  switch (props.filterType) {
    case 'numeric':
      val = val.replace(/\D/g, '').slice(0, props.length.max)
      break
    case 'text-only':
      val = val.replace(/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, '').slice(0, props.length.max)
      break
    default:
      val = val.slice(0, props.length.max)
      break
  }

  event.target.value = val

  emits('update:modelValue', event.target.value)
  emits('input', event)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-xs font-bold text-slate-400 mb-2 ml-1">
      {{ label }}
    </label>

    <input
      :id="id"
      :value="modelValue"
      @input="handleInput"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="[
        'w-full px-5 py-4 transition-all duration-200 outline-none rounded-[1.25rem] text-sm font-semibold',
        alignClass,
        readonly
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-700',
      ]"
    />
  </div>
</template>
