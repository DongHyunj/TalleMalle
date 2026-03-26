<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { computed } from 'vue'
import { useRecruitStore } from '@/stores/recruit'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const recruitStore = useRecruitStore()

// 부모에게 받을 데이터
const props = defineProps({
    recruit: Object,        // 선택된 모집글 정보 (없으면 null)
    isOpen: Boolean,        // 패널 열림 여부
})

// 부모에게 보낼 신호
const emit = defineEmits(['close', 'join', 'leave'])

/**
 * ==============================================================================
 * 3. COMPUTED
 * ==============================================================================
 */
// --- 버튼 상태 계산 로직 (디자인 클래스 포함) ---
const joinButtonState = computed(() => {
    if (!props.recruit) {
        return { text: '정보 없음', disabled: true, class: 'bg-slate-300 text-slate-500 cursor-not-allowed' }
    }

    // 스케줄러가 기사님을 호출한 상태일 때
    if (props.recruit.status === 'CALLING') {
        return { text: '🚕 기사님 호출 중', disabled: true, class: 'bg-amber-500 text-white shadow-amber-200 cursor-not-allowed' }
    }

    // 내가 이 방의 주인이나 참여자일 때 -> [복귀 가능]
    if (recruitStore.recruitId === props.recruit.id) {
        return { text: '채팅방으로 복귀', disabled: false, class: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' }
    }

    // 인원이 다 찼을 때 (기사님 호출 전) -> [마감]
    if (props.recruit.cur >= props.recruit.max) {
        return { text: '모집이 마감되었습니다', disabled: true, class: 'bg-slate-300 text-slate-500 cursor-not-allowed' }
    }

    // 내가 아무것도 안하고 있을 때 -> [입장 가능]
    if (recruitStore.status === 'IDLE') {
        return { text: '동승 채팅방 입장', disabled: false, class: 'bg-slate-900 hover:bg-indigo-600 text-white' }
    }

    if (props.recruit.status === 'DRIVING') {
        return { text: '🚕 부릉 부릉~', disabled: true, class: 'bg-emerald-500 text-white shadow-emerald-200 cursor-not-allowed' }
    }

    // 내가 다른 방에 있을 때 -> [입장 불가]
    return { text: '다른 모집 참여 중', disabled: true, class: 'bg-slate-300 text-slate-500 cursor-not-allowed' }
})
</script>

<template>
    <div class="glass-panel h-full rounded-[2.5rem] flex flex-col pointer-events-auto overflow-hidden transition-all duration-300 ml-4 bg-white/90 backdrop-blur-md border border-white/50 shadow-xl"
        :class="isOpen ? 'w-full md:w-[400px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 pointer-events-none'">

        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-lg">상세 정보</h3>
        </div>

        <div v-if="recruit" class="flex-1 overflow-y-auto custom-scroll p-8 space-y-8">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span
                        class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                        {{ recruit.time }} 출발
                    </span>
                    <span class="text-sm font-bold text-slate-500">
                        <span :class="recruit.cur >= recruit.max ? 'text-rose-500' : 'text-indigo-600'">
                            {{ recruit.cur }}
                        </span> / {{ recruit.max }}명
                    </span>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 leading-tight">
                    {{ recruit.start }} → {{ recruit.dest }}
                </h2>
            </div>

            <p class="text-[14px] text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-3xl">
                {{ recruit.description || '별도의 설명이 없습니다.' }}
            </p>
        </div>

        <div class="p-8 bg-slate-50/50 border-t border-slate-100">
            <!-- 채팅방 입장 버튼 -->
            <button @click="!joinButtonState.disabled && emit('join')" :disabled="joinButtonState.disabled"
                :class="joinButtonState.class" class="w-full font-bold py-5 rounded-2xl transition-all shadow-xl">
                {{ joinButtonState.text }}
            </button>
            <!-- 나가기 버튼 -->
            <button v-if="recruitStore.recruitId === recruit?.id" @click="emit('leave')"
                class="w-full font-bold py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors mt-5">
                이 모집에서 나가기
            </button>
        </div>
    </div>
</template>

<style scoped>
/* 원본 스크롤바 스타일 유지 */
.custom-scroll::-webkit-scrollbar {
    width: 5px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>