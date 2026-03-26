<script setup>
/**
 * ==============================================================================
 * 1. CONFIG & PROPS
 * ==============================================================================
 */
defineProps({
    item: { type: Object, required: true },
    isSelected: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

/**
 * ==============================================================================
 * 2. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 아이템 클릭 핸들러
const handleClick = () => {
    emit('click')
}
</script>

<template>
    <div @click="handleClick" class="p-5 rounded-3xl border shadow-sm cursor-pointer transition-all duration-200"
        :class="isSelected
            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
            : 'bg-white border-slate-100 hover:bg-slate-50'">
        <div class="flex justify-between mb-2">
            <span class="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded">
                {{ item.time }} 출발
            </span>
            <span class="text-[10px] text-slate-400">
                {{ item.cur }}/{{ item.max }}명
            </span>
        </div>
        <p class="font-bold text-slate-800">{{ item.start }} → {{ item.dest }}</p>
    </div>
</template>