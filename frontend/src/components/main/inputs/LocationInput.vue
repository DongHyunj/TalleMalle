<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, watch } from 'vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
// 부모에게 받을 데이터
const props = defineProps({
    label: String,
    modelValue: String, // 입력창에 표시될 텍스트
    placeholder: String,
    labelColor: { type: String, default: 'text-slate-500' }
})

// 부모에게 보낼 이벤트 정의
// 'update:modelValue': 텍스트 업데이트 (v-model용)
// 'select-location': 장소 선택 시 좌표 정보 전달용
const emit = defineEmits(['update:modelValue', 'select-location'])

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
// 검색 상태 변수
const searchResults = ref([]) // 검색 결과 리스트
const showDropdown = ref(false) // 드롭다운 표시 여부

// 타이머 변수
let timer = null

/**
 * ==============================================================================
 * 4. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 장소 검색 핸들러 (카카오 API, 디바운싱 적용)
const handleInput = (e) => {
    const keyword = e.target.value

    // 1. 입력된 텍스트를 부모에게 알림
    emit('update:modelValue', keyword)

    // 타이핑할 때마다 기존에 예약된 0.3초 뒤 검색 취소
    if (timer) {
        clearTimeout(timer)
    }

    // 새로운 0.3초 뒤 검색 예약
    timer = setTimeout(() => {
        // 검색어가 없으면 초기화하고 종료
        if (!keyword.trim()) {
            searchResults.value = []
            showDropdown.value = false
            return
        }

        // 카카오 API 로드 확인
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            // console.error("카카오 지도 API가 로드되지 않았습니다.")
            return
        }

        // 검색 객체 생성 및 실행
        const ps = new window.kakao.maps.services.Places()

        // 키워드로 장소 검색 실행
        ps.keywordSearch(keyword, (data, status, pagination) => {
            if (status === window.kakao.maps.services.Status.OK) {
                // 성공 시 결과 저장 및 드롭다운 열기
                searchResults.value = data
                showDropdown.value = true
            } else {
                // 실패하거나 결과 없으면 리스트 비우기
                searchResults.value = []
                showDropdown.value = false
            }
        })
    }, 300)
}

// 장소 선택 핸들러
const handleSelectPlace = (place) => {
    // 입력창 텍스트를 선택한 장소 이름으로 변경
    emit('update:modelValue', place.place_name)

    // 부모에게 상세 정보(좌표 포함) 전달
    // 카카오 API는 x가 경도(lng), y가 위도(lat)입니다.
    emit('select-location', {
        name: place.place_name,
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        address: place.road_address_name || place.address_name
    })

    // 드롭다운 닫기
    showDropdown.value = false
}
</script>

<template>
    <div
        class="relative bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all">

        <span class="text-[10px] font-bold block mb-1" :class="labelColor">{{ label }}</span>

        <input :value="modelValue" @input="handleInput" type="text"
            class="w-full bg-transparent font-bold text-slate-800 outline-none placeholder-slate-400"
            :placeholder="placeholder">

        <div v-if="showDropdown && searchResults.length > 0"
            class="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-[200px] overflow-y-auto custom-scroll">
            <ul>
                <li v-for="place in searchResults" :key="place.id" @click="handleSelectPlace(place)"
                    class="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0">
                    <div class="text-sm font-bold text-slate-800">{{ place.place_name }}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5 truncate">
                        {{ place.road_address_name || place.address_name }}
                    </div>
                </li>
            </ul>
        </div>

    </div>
</template>

<style scoped>
/* 드롭다운 스크롤바 스타일 */
.custom-scroll::-webkit-scrollbar {
    width: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
}
</style>