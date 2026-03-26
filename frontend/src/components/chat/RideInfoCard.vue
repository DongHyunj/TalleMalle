<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { ref } from 'vue'
import { Info } from 'lucide-vue-next'
import RideDetailModal from './RideDetailModal.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
defineProps({
  rideInfo: {
    type: Object,
    default: null,
  },
})

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
// 모달 상태 관리
const isRideDetailModalOpen = ref(false)

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 모달 열기 핸들러
const handleOpenModal = () => {
  isRideDetailModalOpen.value = true
}

// 모달 닫기 핸들러
const handleCloseModal = () => {
  isRideDetailModalOpen.value = false
}
</script>

<template>
  <!-- 
      카드 전체 컨테이너 (클릭 가능 영역)
      - @click="handleOpenModal": 클릭 시 모달 열기 함수 호출
      - group: 자식 요소들이 부모의 상태(hover 등)에 반응하도록 그룹 지정
      - cursor-pointer: 클릭 가능 표시
    -->
  <div
    @click="handleOpenModal"
    class="bg-white/90 backdrop-blur p-6 rounded-[2.5rem] shrink-0 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group relative border border-white/50 shadow-sm"
  >
    <!-- 
          우측 상단 'i' 아이콘
          - opacity-0 group-hover:opacity-100: 마우스 오버 시 표시
        -->
    <div class="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <Info class="w-5 h-5 text-indigo-400" />
    </div>

    <!-- 제목 -->
    <h3 class="font-bold text-slate-900 mb-4 text-sm group-hover:text-indigo-600 transition-colors">
      여정 정보
    </h3>

    <!-- 출발지 -> 도착지 시각화 영역 -->
    <div class="space-y-4">
      <!-- 1. 출발지 (Start) -->
      <div class="flex items-start gap-3">
        <!-- 초록색 점 -->
        <div
          class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        ></div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase">Start</p>
          <p class="text-xs font-bold text-slate-700">{{ rideInfo?.route.start || '...' }}</p>
        </div>
      </div>

      <!-- 2. 점선 (연결 고리) -->
      <div class="ml-0.5 border-l-2 border-dashed border-slate-100 h-6"></div>

      <!-- 3. 도착지 (Destination) -->
      <div class="flex items-start gap-3">
        <!-- 빨간색 점 -->
        <div
          class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
        ></div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
          <p class="text-xs font-bold text-slate-700">{{ rideInfo?.route.dest || '...' }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 상세 정보 모달 -->
  <RideDetailModal
    :is-open="isRideDetailModalOpen"
    :ride-info="rideInfo"
    @close="handleCloseModal"
  />
</template>
