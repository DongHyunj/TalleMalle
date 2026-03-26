<script setup>
/**
 * ==============================================================================
 * 1. CONFIG & PROPS
 * ==============================================================================
 */
defineProps({
    label: String,
    modelValue: String,
    placeholder: String
})
const emit = defineEmits(['update:modelValue'])

/**
 * ==============================================================================
 * 2. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 입력 변경 핸들러 (인라인 함수 추출)
const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}
</script>

<template>
    <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400">{{ label }}</label>
        <input :value="modelValue" @input="handleInput" type="text"
            class="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none placeholder-slate-400 border border-slate-100 focus:border-indigo-300 focus:bg-white transition-all"
            :placeholder="placeholder">
    </div>
</template>