<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Plus, Minus, LocateFixed } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
// 부모에게 받을 데이터 (유저 정보)
defineProps({
    nickname: { type: String, default: 'Guest' }
})

// 부모에게 보낼 버튼 신호
const emit = defineEmits(['zoomIn', 'zoomOut', 'moveLocation'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 줌 인 핸들러
const handleZoomIn = () => emit('zoomIn')

// 줌 아웃 핸들러
const handleZoomOut = () => emit('zoomOut')

// 내 위치 이동 핸들러
const handleMoveLocation = () => emit('moveLocation')
</script>
<template>
    <div class="absolute top-4 right-4 flex flex-col gap-3 pointer-events-auto z-20 items-end">
        <div
            class="bg-white/90 backdrop-blur p-2.5 rounded-2xl flex items-center gap-3 pr-5 shadow-sm border border-white/50">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                {{ nickname.substring(0, 2) }}
            </div>
            <div class="hidden md:flex flex-col">
                <span class="text-sm font-bold text-slate-900">{{ nickname }}</span>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <button @click="handleZoomIn"
                class="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center hover:text-indigo-600 shadow-sm transition-colors">
                <Plus class="w-5 h-5" />
            </button>
            <button @click="handleZoomOut"
                class="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center hover:text-indigo-600 shadow-sm transition-colors">
                <Minus class="w-5 h-5" />
            </button>
            <button @click="handleMoveLocation"
                class="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mt-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                <LocateFixed class="w-5 h-5" />
            </button>
        </div>
    </div>
</template>