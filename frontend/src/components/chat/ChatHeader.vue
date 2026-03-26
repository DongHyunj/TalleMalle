<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어 -> 컴포넌트)
 * ==============================================================================
 */
import { ref, inject } from 'vue'
import { MapPin, LogOut, Wifi, WifiOff } from 'lucide-vue-next' // 아이콘

import ExitConfirmModal from './ExitConfirmModal.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Inject 정의)
 * ==============================================================================
 */
// Props 정의
const props = defineProps({
  isConnected: {
    type: Boolean,
    default: false,
  },
  rideInfo: {
    type: Object,
    default: null,
  },
})

// Emits 정의
const emit = defineEmits(['exit'])

// Inject (상위 컴포넌트에서 데이터 주입)
const myUserName = inject('myUserName', '나')

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
// 모달 상태 관리
const isExitModalOpen = ref(false)

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 나가기 버튼 클릭 핸들러 (모달 열기)
const handleExitClick = () => {
  isExitModalOpen.value = true
}

// 나가기 확정 핸들러 (모달 확인 버튼 클릭 시)
const handleConfirmExit = () => {
  emit('exit')
  isExitModalOpen.value = false
}
</script>

<template>
  <!-- 
      헤더 전체 컨테이너
      - flex justify-between: 왼쪽(정보)과 오른쪽(버튼)을 양 끝으로 벌림
      - shrink-0: 화면이 줄어들어도 헤더 높이는 찌그러지지 않게 고정
    -->
  <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 shrink-0">
    <!-- 왼쪽 영역: 아이콘 + 텍스트 -->
    <div class="flex items-center gap-4">
      <!-- 지도 핀 아이콘 박스 -->
      <div
        class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0"
      >
        <MapPin class="w-6 h-6" />
      </div>

      <!-- 텍스트 정보 영역 -->
      <div>
        <div class="flex items-center gap-2">
          <!-- 경로 제목 -->
          <h2 class="font-bold text-slate-900 text-sm md:text-base">
            {{
              rideInfo ? `${rideInfo.route.start} → ${rideInfo.route.dest}` : '경로 정보 로딩 중...'
            }}
          </h2>

          <!-- 연결 상태 배지 -->
          <span
            v-if="isConnected"
            class="flex items-center text-[10px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-bold"
          >
            <Wifi class="w-3 h-3 mr-1" /> LIVE
          </span>
          <span
            v-else
            class="flex items-center text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-bold"
          >
            <WifiOff class="w-3 h-3 mr-1" /> Disconnected
          </span>
        </div>

        <!-- 부가 정보 -->
        <p class="text-xs text-slate-400">
          실시간 채팅방 · <span class="text-indigo-600 font-bold ml-1">{{ myUserName }}</span
          >님 참여중
        </p>
      </div>
    </div>

    <!-- 오른쪽 영역: 나가기 버튼 -->
    <button
      @click="handleExitClick"
      class="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
    >
      <span class="text-xs font-bold">모집 나가기</span>
      <LogOut class="w-4 h-4" />
    </button>

    <!-- 나가기 확인 모달 -->
    <ExitConfirmModal
      :is-open="isExitModalOpen"
      @close="isExitModalOpen = false"
      @confirm="handleConfirmExit"
    />
  </div>
</template>
