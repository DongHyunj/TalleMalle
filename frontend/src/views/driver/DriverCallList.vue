<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Navigation, RefreshCw, Car, ArrowLeft, Clock } from 'lucide-vue-next'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import driverApi from '@/api/driver'

dayjs.extend(utc)
dayjs.extend(timezone)

const formatDeparture = (iso) => {
  if (!iso) return null
  return dayjs(iso).tz('Asia/Seoul').format('M/D HH:mm')
}
import { useWebSocket } from '@/composables/useWebSocket'

const router = useRouter()
const calls = ref([])
const myCall = ref(null)
const isLoading = ref(false)
const showUpdateAlert = ref(false) // 🌟 실시간 알림 상태

const { connect, disconnect } = useWebSocket()
const wsUrl = import.meta.env.VITE_WS_URL

// 데이터 로드
const fetchMyCall = async () => {
  try {
    const res = await driverApi.getMyCall()
    myCall.value = res.data
  } catch (error) {
    myCall.value = null
  }
}

const fetchCalls = async () => {
  isLoading.value = true
  try {
    const res = await driverApi.getCallList({ page: 0, size: 50 })
    calls.value = res.data.content ?? res.data
    showUpdateAlert.value = false 
  } catch (error) {
    // console.error('콜 목록 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

const initData = async () => {
  await Promise.all([fetchMyCall(), fetchCalls()])
}

const goToDetail = (callIdx) => {
  router.push(`/driver/call/${callIdx}`)
}

onMounted(async () => {
  await initData()

  connect(wsUrl, async (message) => {
    const data = JSON.parse(message.data)
    if (data.type === 'recruitFull') {
      await initData() // 새로고침
      showUpdateAlert.value = true
      setTimeout(() => {
        showUpdateAlert.value = false
      }, 3000)
    }
  })
})

// 🌟 언마운트 시 연결 해제
onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 bg-gray-50 h-[100dvh] overflow-y-auto overscroll-y-contain pb-20 relative">
    
    <Transition name="fade">
      <div v-if="showUpdateAlert" class="fixed top-20 left-4 right-4 z-50">
        <button 
          @click="initData"
          class="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl shadow-xl font-bold active:scale-[0.98] transition-all"
        >
          <RefreshCw class="w-5 h-5 animate-spin" /> 새로운 배차 정보가 있습니다.
        </button>
      </div>
    </Transition>

    <div class="flex items-center gap-3 mb-6">
      <button
        type="button"
        @click="router.back()"
        class="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="뒤로 가기"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-2xl font-bold text-gray-800 flex-1">배차 관리</h1>
      <button
        type="button"
        @click="initData"
        class="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-emerald-500 transition-colors"
        aria-label="새로고침"
      >
        <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-5 h-5" />
      </button>
    </div>

    <div v-if="myCall" class="mb-8">
      <h2 class="text-sm font-bold text-indigo-600 mb-3 flex items-center gap-1">
        <Car class="w-4 h-4" /> 수락한 콜
      </h2>
      <div 
        @click="goToDetail(myCall.callIdx)"
        class="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-200 cursor-pointer active:scale-[0.98] transition-all border border-indigo-400"
      >
        <div class="flex justify-between items-start mb-3">
          <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-indigo-600">콜 승인</span>
          <span class="text-xs text-indigo-200">#{{ myCall.callIdx }}</span>
        </div>
        <div class="flex items-center gap-3 text-white">
          <MapPin class="w-5 h-5 text-indigo-200 shrink-0" />
          <span class="font-bold text-xl truncate">{{ myCall.startLocation }}</span>
        </div>
      </div>
    </div>

    <h2 class="text-sm font-bold text-gray-500 mb-3">주변 대기 콜</h2>
    
    <div v-if="isLoading && calls.length === 0" class="text-center py-10 text-gray-400">목록을 업데이트 중입니다...</div>
    
    <div v-else-if="calls.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
      <Navigation class="w-12 h-12 mb-4 opacity-50" />
      <p>현재 대기 중인 콜이 없습니다.</p>
    </div>

    <ul v-else class="space-y-4">
      <li 
        v-for="call in calls" 
        :key="call.callIdx"
        @click="goToDetail(call.callIdx)"
        class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500 active:scale-[0.98] transition-all"
      >
        <div class="flex justify-between items-start mb-3">
          <span class="px-2.5 py-1 text-xs font-bold rounded-lg"
            :class="call.status === 'WAITING' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
            {{ call.status === 'WAITING' ? '대기 중' : '취소됨' }}
          </span>
          <span class="text-xs text-gray-400">#{{ call.callIdx }}</span>
        </div>
        <div class="flex items-center gap-3 text-gray-800">
          <MapPin class="w-5 h-5 text-emerald-500 shrink-0" />
          <span class="font-medium text-lg truncate">{{ call.startLocation }}</span>
        </div>
        <div
          v-if="formatDeparture(call.departureTime)"
          class="mt-2 flex items-center gap-1.5 text-sm text-gray-500"
        >
          <Clock class="w-4 h-4 shrink-0 text-gray-400" />
          <span>출발 {{ formatDeparture(call.departureTime) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>