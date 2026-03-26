<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
// (없음)

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 체크박스 변경 핸들러
const handleChange = (event) => {
  const isChecked = event.target.checked
  const newValue = [...props.modelValue]

  if (isChecked) {
    if (!newValue.includes(props.value)) {
      newValue.push(props.value)
    }
  } else {
    const index = newValue.indexOf(props.value)
    if (index !== -1) {
      newValue.splice(index, 1)
    }
  }

  emit('update:modelValue', newValue)
}
</script>

<template>
  <label class="cursor-pointer group">
    <input
      type="checkbox"
      :checked="modelValue.includes(value)"
      @change="handleChange"
      class="peer hidden"
    />
    <span
      class="px-5 py-3 border border-slate-100 bg-white rounded-2xl text-xs font-bold text-slate-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 peer-checked:border-indigo-200 hover:border-indigo-200 transition-all block"
    >
      {{ label }}
    </span>
  </label>
</template>
