<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Clock } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
defineProps({
    label: String,
    modelValue: String
})
const emit = defineEmits(['update:modelValue'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 선택 변경 핸들러 (인라인 함수 추출)
const handleChange = (event) => {
    emit('update:modelValue', event.target.value)
}
</script>

<template>
    <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400">{{ label }}</label>

        <div class="relative">
            <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />

            <input type="time" :value="modelValue" @input="handleChange"
                class="time-input relative w-full pl-11 py-4 pr-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border border-slate-100 focus:border-indigo-300 transition-all cursor-pointer" />
        </div>
    </div>
</template>

<style scoped>
.time-input::-webkit-calendar-picker-indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    color: transparent;
    cursor: pointer;
    z-index: 1;
}
</style>