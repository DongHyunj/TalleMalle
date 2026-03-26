<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Minus, Plus } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
const props = defineProps({
    label: String,
    modelValue: { type: Number, default: 3 },
    min: { type: Number, default: 2 },
    max: { type: Number, default: 4 }
})

const emit = defineEmits(['update:modelValue'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 카운트 증가/감소 핸들러
const handleUpdateCount = (delta) => {
    let newValue = props.modelValue + delta
    if (newValue < props.min) newValue = props.min
    if (newValue > props.max) newValue = props.max
    emit('update:modelValue', newValue)
}
</script>

<template>
    <div class="space-y-2">
        <label class="text-xs font-bold text-slate-400">{{ label }}</label>
        <div class="flex items-center justify-between w-full p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <button @click="handleUpdateCount(-1)"
                class="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors">
                <Minus class="w-4 h-4" />
            </button>
            <span class="font-bold text-slate-800">{{ modelValue }}명</span>
            <button @click="handleUpdateCount(1)"
                class="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors">
                <Plus class="w-4 h-4" />
            </button>
        </div>
    </div>
</template>