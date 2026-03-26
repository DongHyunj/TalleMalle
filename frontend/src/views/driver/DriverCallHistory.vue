<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Navigation, CheckCircle, ArrowLeft, Wallet, RefreshCw } from 'lucide-vue-next'
import driverApi from '@/api/driver'

const router = useRouter()
const history = ref([])
const isLoading = ref(false)
const historyPage = ref(0)
const hasMoreHistory = ref(false)
const totalEstimatedFare = ref(0)
const totalHistoryCount = ref(0)

const fetchHistory = async (append = false) => {
  isLoading.value = true
  try {
    if (!append) {
      historyPage.value = 0
    }
    const res = await driverApi.getCallHistory({
      page: historyPage.value,
      size: 20,
    })
    const raw = res.data
    // 페이징 객체 | 구버전 배열 | BaseResponse.result 모두 허용
    const body = raw?.result != null ? raw.result : raw
    let chunk = []
    if (Array.isArray(body)) {
      chunk = body
    } else if (Array.isArray(body?.content)) {
      chunk = body.content
    }
    if (append) {
      history.value = [...history.value, ...chunk]
    } else {
      history.value = chunk
    }
    if (Array.isArray(body)) {
      totalEstimatedFare.value = chunk.reduce((s, c) => s + (c.estimatedFare || 0), 0)
      totalHistoryCount.value = chunk.length
      hasMoreHistory.value = false
    } else {
      totalEstimatedFare.value = body?.totalEstimatedFare ?? 0
      totalHistoryCount.value = body?.totalElements ?? chunk.length
      hasMoreHistory.value = body?.last === false
    }
  } catch (error) {
    // console.error('운행 내역 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMoreHistory = async () => {
  if (!hasMoreHistory.value || isLoading.value) return
  historyPage.value += 1
  await fetchHistory(true)
}

onMounted(() => fetchHistory())
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 bg-gray-50 h-full overflow-y-auto pb-20">

    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-2xl font-bold text-gray-800 flex-1">운행 내역</h1>
      <button @click="fetchHistory" class="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-emerald-500 transition-colors">
        <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-5 h-5" />
      </button>
    </div>

    <div v-if="history.length > 0 || totalHistoryCount > 0" class="bg-emerald-600 rounded-2xl p-5 mb-6 shadow-lg shadow-emerald-200">
      <p class="text-emerald-100 text-sm font-medium mb-1">누적 예상 수익</p>
      <p class="text-white text-3xl font-black font-mono">{{ totalEstimatedFare.toLocaleString() }} <span class="text-xl font-normal">원</span></p>
      <p class="text-emerald-200 text-xs mt-1">총 {{ totalHistoryCount }}건 운행 완료</p>
    </div>

    <div v-if="isLoading && history.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p>불러오는 중...</p>
    </div>

    <div v-else-if="history.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
      <CheckCircle class="w-12 h-12 mb-4 opacity-30" />
      <p class="font-medium">완료된 운행 내역이 없습니다.</p>
    </div>

    <ul v-else class="space-y-4">
      <li
        v-for="call in history"
        :key="call.callIdx"
        class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
      >
        <div class="flex justify-between items-start mb-4">
          <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" /> 운행 완료
          </span>
          <span class="text-xs text-gray-400 font-mono">#{{ call.callIdx }}</span>
        </div>

        <div class="space-y-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <MapPin class="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs text-gray-400">출발</p>
              <p class="font-semibold text-gray-800 text-sm">{{ call.startLocation }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Navigation class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p class="text-xs text-gray-400">도착</p>
              <p class="font-semibold text-gray-800 text-sm">{{ call.endLocation }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
          <Wallet class="w-4 h-4 text-amber-500" />
          <span class="text-amber-600 font-bold">{{ (call.estimatedFare || 0).toLocaleString() }} 원</span>
        </div>
      </li>
    </ul>

    <div v-if="hasMoreHistory" class="mt-6 flex justify-center">
      <button
        type="button"
        class="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:border-emerald-400 hover:text-emerald-700 transition-colors"
        :disabled="isLoading"
        @click="loadMoreHistory"
      >
        더 보기
      </button>
    </div>
  </div>
</template>