<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MapPin, Navigation, ListFilter } from 'lucide-vue-next'
import RecruitListItem from './RecruitListItem.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
const props = defineProps({
    recruitList: { type: Array, default: () => [] },
    isOpen: Boolean,
    selectedId: Number,
    isSocketConnected: Boolean
})

const emit = defineEmits(['expand', 'select', 'search', 'load-more'])

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
const startInput = ref('')
const destInput = ref('')

const startSearchResults = ref([]) // 출발지 검색 결과 목록
const showDropdown = ref(false)    // 드롭다운 표시 여부
let searchTimeout = null

const destSearchResults = ref([]) // 목적지 검색 결과 목록
const showDestDropdown = ref(false) // 목적지 드롭다운 표시 여부
let destSearchTimeout = null // 목적지용 디바운싱 타이머

let isSelecting = false
let lastStartKeyword = ''
let lastDestKeyword = ''

// 무한 스크롤 관찰자
const observerTarget = ref(null)
let observer = null

/**
 * ==============================================================================
 * 4. COMPUTED
 * ==============================================================================
 */
const filteredList = computed(() => {
    return props.recruitList.filter(item => {
        const s = startInput.value.trim()
        const d = destInput.value.trim()
        return (!s || item.start.includes(s)) && (!d || item.dest.includes(d))
    })
})

/**
 * ==============================================================================
 * 5. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 패널 확장 요청 핸들러
const handleExpand = () => {
    emit('expand')
}

// 리스트 아이템 선택 핸들러
const handleSelectItem = (item) => {
    emit('select', item)
}

// 출발지 카카오 장소 검색 API 호출 (글자를 입력할 때마다 실행)
const handleInputSearch = (e) => {
    if (isSelecting) {
        return
    }

    const keyword = e.target.value.trim()

    if (keyword == lastStartKeyword) {
        return
    }

    lastStartKeyword = keyword

    if (!keyword) {
        startSearchResults.value = []
        showDropdown.value = false
        return
    }

    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // 타이핑할 때마다 API 호출하는 걸 방지하기 위해 0.3초 대기 (디바운싱)
    searchTimeout = setTimeout(() => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            return
        }

        const ps = new window.kakao.maps.services.Places()

        ps.keywordSearch(keyword, (data, status) => {
            if (isSelecting) {
                return
            }

            if (status === window.kakao.maps.services.Status.OK) {
                startSearchResults.value = data
                showDropdown.value = true
            } else {
                startSearchResults.value = []
                showDropdown.value = false
            }
        })
    }, 100)
}

// 드롭다운에서 장소를 클릭했을 때 실행
const handleSelectPlace = (place) => {
    isSelecting = true

    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    startInput.value = place.place_name
    showDropdown.value = false

    // 선택 즉시 지도 이동
    emit('search', place.place_name)

    setTimeout(() => {
        isSelecting = false
    }, 300)
}

// 목적지 카카오 장소 검색 API 호출
const handleDestInputSearch = (e) => {
    if (isSelecting) {
        return
    }

    const keyword = e.target.value.trim()

    if (keyword === lastDestKeyword) {
        return
    }

    lastDestKeyword = keyword

    if (!keyword) {
        destSearchResults.value = []
        showDestDropdown.value = false
        return
    }

    if (destSearchTimeout) {
        clearTimeout(destSearchTimeout)
    }

    destSearchTimeout = setTimeout(() => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            return
        }

        const ps = new window.kakao.maps.services.Places()

        ps.keywordSearch(keyword, (data, status) => {
            if (isSelecting) {
                return
            }

            if (status === window.kakao.maps.services.Status.OK) {
                destSearchResults.value = data // 자르지 않고 전체 데이터 저장
                showDestDropdown.value = true
            } else {
                destSearchResults.value = []
                showDestDropdown.value = false
            }
        })
    }, 300)
}

// 목적지 드롭다운에서 장소를 클릭했을 때 실행
const handleSelectDestPlace = (place) => {
    isSelecting = true

    if (destSearchTimeout) {
        clearTimeout(destSearchTimeout)
    }

    destInput.value = place.place_name
    showDestDropdown.value = false
    // 목적지는 지도 이동(emit) 없이, destInput 값만 바뀌면
    // computed(filteredList)가 알아서 리스트를 필터링

    setTimeout(() => {
        isSelecting = false
    }, 300)
}

// 검색 버튼용 함수
const handleSearchSubmit = () => {
    const keyword = startInput.value.trim()
    if (keyword) {
        emit('search', keyword)
        showDropdown.value = false
    } else {
        alert("출발지를 입력해주세요.")
    }
}

// 외부 클릭 감지 핸들러
const handleOutsideClick = (e) => {
    // 출발지 드롭다운이 열려있고, 클릭한 곳이 출발지 검색 영역이 아니라면 닫기
    if (showDropdown.value && !e.target.closest('.start-search-group')) {
        showDropdown.value = false
    }
    // 목적지 드롭다운이 열려있고, 클릭한 곳이 목적지 검색 영역이 아니라면 닫기
    if (showDestDropdown.value && !e.target.closest('.dest-search-group')) {
        showDestDropdown.value = false
    }
}

// 컴포넌트가 화면에 나타날 때 클릭 감지기 켜기
onMounted(() => {
    document.addEventListener('click', handleOutsideClick);

    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && props.recruitList.length > 0) {
            emit('load-more');
        }
    }, { threshold: 0.1 });

    if (observerTarget.value) {
        observer.observe(observerTarget.value);
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);

    if (observer) {
        observer.disconnect();
        observer = null;
    }
})
</script>

<template>
    <div class="glass-panel w-full md:w-[380px] h-full rounded-[2.5rem] flex flex-col overflow-hidden pointer-events-auto bg-white/90 backdrop-blur-md border border-white/50 shadow-xl transition-transform duration-300"
        :class="{ 'translate-y-0': isOpen, 'translate-y-[calc(100%-150px)] md:translate-y-0': !isOpen }">

        <div class="p-6 md:p-8 border-b border-slate-100 shrink-0">
            <h1 class="text-xl md:text-2xl font-bold text-slate-900 mb-4 flex justify-between items-center">
                탈래말래
                <span v-if="isSocketConnected"
                    class="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">Online</span>
                <span v-else class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Offline</span>
            </h1>
            <div class="space-y-3">
                <div class="relative group start-search-group">
                    <MapPin class="absolute left-4 top-3.5 w-4 h-4 text-emerald-500 z-10" />
                    <input v-model="startInput" @focus="handleExpand" @input="handleInputSearch"
                        @keyup.enter="handleSearchSubmit" type="text" placeholder="출발지"
                        class="relative z-10 w-full pl-11 pr-4 py-3.5 bg-slate-50/50 rounded-2xl text-sm border border-transparent focus:bg-white focus:border-indigo-100 outline-none" />

                    <div v-if="showDropdown && startSearchResults.length > 0"
                        class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-[300px] overflow-y-auto custom-scroll">

                        <div v-for="place in startSearchResults" :key="place.id" @click="handleSelectPlace(place)"
                            class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors">
                            <p class="text-sm font-bold text-slate-800">{{ place.place_name }}</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">{{ place.address_name }}</p>
                        </div>
                    </div>
                </div>
                <div class="relative group dest-search-group">
                    <Navigation class="absolute left-4 top-3.5 w-4 h-4 text-rose-500 z-10" />
                    <input v-model="destInput" @focus="handleExpand" @input="handleDestInputSearch" type="text"
                        placeholder="목적지"
                        class="relative z-10 w-full pl-11 pr-4 py-3.5 bg-slate-50/50 rounded-2xl text-sm border border-transparent focus:bg-white focus:border-indigo-100 outline-none" />

                    <div v-if="showDestDropdown && destSearchResults.length > 0"
                        class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-[300px] overflow-y-auto custom-scroll">
                        <div v-for="place in destSearchResults" :key="place.id" @click="handleSelectDestPlace(place)"
                            class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors">
                            <p class="text-sm font-bold text-slate-800">{{ place.place_name }}</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">{{ place.address_name }}</p>
                        </div>
                    </div>
                </div>
                <button @click="handleSearchSubmit"
                    class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2">
                    <ListFilter class="w-4 h-4" />
                    조건에 맞는 모집 찾기
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scroll p-6 space-y-4">
            <h3 class="font-bold text-slate-800 text-lg px-1 mb-2">실시간 모집 ({{ filteredList.length }})</h3>

            <div v-if="filteredList.length === 0" class="py-10 text-center text-slate-400 text-sm">
                조건에 맞는 모집 글이 없습니다.
            </div>

            <RecruitListItem v-for="item in filteredList" :key="item.id" :item="item"
                :is-selected="selectedId === item.id" @click="handleSelectItem(item)" />

            <div ref="observerTarget" class="h-4 w-full shrink-0"></div>
        </div>
    </div>
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