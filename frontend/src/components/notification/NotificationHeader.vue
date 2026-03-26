<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ArrowLeft, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const router = useRouter()
defineEmits(['markAllRead'])

/**
 * ==============================================================================
 * 3. METHODS - FUNCTIONAL
 * ==============================================================================
 */
const goBack = () => {
    router.back()
}
</script>

<template>
    <div class="p-10 pb-6 border-b border-slate-50">
        <div class="max-w-4xl mx-auto w-full flex justify-between items-end">
            <div>
                <div class="flex items-center gap-2 md:hidden mb-4">
                    <button @click="goBack" class="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft class="w-6 h-6" />
                    </button>
                </div>
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">알림 센터</h1>
                <p class="text-sm text-slate-400 font-medium mt-2">새로운 소식과 활동 내역을 확인하세요.</p>
            </div>
            <button @click="$emit('markAllRead')"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1 active:scale-95">
                <Check class="w-3 h-3" /> 모두 읽음
            </button>
        </div>
    </div>
</template>