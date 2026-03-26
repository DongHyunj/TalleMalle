<script setup>
/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
    // 선택된 상태(true)인지 아닌지(false)
    active: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <button type="button" class="text-sm pb-2 transition-all capitalize relative" :class="active
        ? 'font-bold text-indigo-600 border-b-2 border-indigo-600'
        : 'font-medium text-slate-400 hover:text-slate-600'">
        <slot />
    </button>
</template>