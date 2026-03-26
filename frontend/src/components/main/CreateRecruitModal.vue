<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

// 분리한 컴포넌트들 가져오기
import LocationInput from '@/components/main/inputs/LocationInput.vue'
import TimeSelect from '@/components/main/inputs/TimeSelect.vue'
import MemberCounter from '@/components/main/inputs/MemberCounter.vue'
import Textarea from '@/components/main/inputs/Textarea.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits)
 * ==============================================================================
 */
defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'submit'])

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
// 현재 시간에서 10분 뒤의 시간을 'HH:mm' 형태로 반환하는 함수
const getDefaultTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

// 폼 데이터
const form = ref({
    start: '',
    startLat: null,
    startLng: null,
    dest: '',
    destLat: null,
    destLng: null,
    time: getDefaultTime(),
    maxMember: 3,
    description: ''
})

/**
 * ==============================================================================
 * 4. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 모달 닫기 핸들러
const handleClose = () => {
    emit('close')
}

// 출발지 선택 시 좌표 저장 핸들러
const handleStartSelect = (location) => {
    // console.log("출발지 선택됨:", location)
    form.value.start = location.name
    form.value.startLat = location.lat
    form.value.startLng = location.lng
}

// 목적지 선택 시 좌표 저장 핸들러
const handleDestSelect = (location) => {
    // console.log("목적지 선택됨:", location)
    form.value.dest = location.name
    form.value.destLat = location.lat
    form.value.destLng = location.lng
}

// 폼 제출 핸들러
const handleFormSubmit = () => {
    const { start, startLat, startLng, dest, destLat, destLng, time, maxMember, description } = form.value

    if (!start || !dest) {
        alert('출발지와 목적지를 입력해주세요.')
        return
    }
    if (!startLat || !destLat) {
        alert('목록에서 정확한 장소를 선택해주세요.')
        return
    }

    emit('submit', {
        start,
        startLat,
        startLng,
        dest,
        destLat,
        destLng,
        time,
        max: maxMember,
        description
    })
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen"
            class="fixed inset-0 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm z-[100]">
            <div
                class="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 class="text-xl font-bold text-slate-900">동승 모집하기</h2>
                    <button @click="handleClose"
                        class="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">

                    <div class="grid grid-cols-2 gap-3">
                        <LocationInput label="출발지" v-model="form.start" @select-location="handleStartSelect"
                            placeholder="장소 검색" label-color="text-emerald-500" />
                        <LocationInput label="목적지" v-model="form.dest" @select-location="handleDestSelect"
                            placeholder="장소 검색" label-color="text-rose-500" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <TimeSelect label="출발 시간" v-model="form.time" />
                        <MemberCounter label="모집 인원" v-model="form.maxMember" />
                    </div>

                    <Textarea label="하고 싶은 말" v-model="form.description" placeholder="예: 짐이 조금 있어요" />
                </div>

                <div class="p-6 border-t border-slate-100 bg-white">
                    <button @click="handleFormSubmit"
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                        모집 시작하기
                    </button>
                </div>

            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 5px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>