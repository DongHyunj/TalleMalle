<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Navigation2, Rocket, MessageCircle, MessageCircleCode } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
const props = defineProps({
    routeInfo: {
        type: String, default: '경로 미지정'
    },
    buttonState: {
        type: Object,
        default: () => ({
            text: '모집 시작', disabled: false, isJoined: false
        })
    }
})

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 모집 생성 버튼 클릭 핸들러
const handleActionClick = () => {
    if (!props.buttonState.disabled) {
        emit('actionClick')
    }
}

const emit = defineEmits(['actionClick'])
</script>

<template>
    <div
        class="hidden md:flex absolute bottom-8 right-8 z-10 justify-end pointer-events-auto transition-all duration-500 ease-in-out">
        <div
            class="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] flex items-center justify-between gap-12 border border-white/50 shadow-xl w-full max-w-4xl">

            <div class="flex-1 flex items-center gap-6 pl-4">
                <div :class="buttonState.isJoined ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'"
                    class="p-3 rounded-2xl transition-colors">
                    <Navigation2 class="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">경로 정보</span>
                    <span class="text-lg font-bold text-slate-800">{{ routeInfo }}</span>
                </div>
            </div>

            <button @click="handleActionClick"
                :class="buttonState.isJoined ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-indigo-600'"
                class="text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl whitespace-nowrap">
                <span>{{ buttonState.text }}</span>
                <MessageCircle v-if="buttonState.isJoined" class="w-5 h-5" />
                <Rocket v-else class="w-5 h-5" />
            </button>

        </div>
    </div>
</template>