<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MapPin, Navigation, Users, Wallet, Phone, CheckCircle, CreditCard } from 'lucide-vue-next'
import driverApi from '@/api/driver'

const route = useRoute()
const router = useRouter()
const callIdx = route.params.callIdx

const settlement = ref(null)
const isLoading = ref(true)
const error = ref('')

const chargeLoading = ref(false)
const chargeError = ref('')
const chargeDone = ref(false)

const participantCount = computed(() => settlement.value?.participants?.length ?? 0)

const canCharge = computed(
  () =>
    settlement.value?.recruitIdx != null &&
    participantCount.value > 0 &&
    !chargeLoading.value &&
    !chargeDone.value,
)

onMounted(async () => {
  try {
    const res = await driverApi.getSettlement(callIdx)
    const body = res.data?.result ?? res.data
    settlement.value = body
  } catch (e) {
    error.value = '정산 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})

async function requestCharge() {
  if (!canCharge.value) return
  chargeError.value = ''
  chargeLoading.value = true
  try {
    const total = settlement.value?.totalFare ?? 0
    await driverApi.chargePayment({
      recruitIdx: settlement.value.recruitIdx,
      commission: total,
      serviceFee: 0,
    })
    chargeDone.value = true
  } catch (e) {
    chargeError.value = e.response?.data?.message || e.message || '결제에 실패했습니다.'
  } finally {
    chargeLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

      <!-- 헤더 -->
      <div class="bg-indigo-600 px-8 py-8 text-center">
        <CheckCircle class="w-14 h-14 text-white mx-auto mb-3" />
        <h1 class="text-2xl font-black text-white">운행 완료</h1>
        <p class="text-indigo-200 mt-1 text-sm">수고하셨습니다!</p>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>정산 정보 불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="text-center py-20 text-gray-500">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="settlement" class="p-6 space-y-5">

        <!-- 경로 -->
        <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
          <div class="absolute left-9 top-10 bottom-10 w-0.5 bg-gray-300"></div>
          <div class="flex items-start gap-3 mb-5 relative z-10">
            <div class="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
              <MapPin class="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium mb-0.5">출발지</p>
              <p class="text-base font-bold text-gray-900">{{ settlement.startLocation }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 relative z-10">
            <div class="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
              <Navigation class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium mb-0.5">도착지</p>
              <p class="text-base font-bold text-gray-900">{{ settlement.endLocation }}</p>
            </div>
          </div>
        </div>

        <!-- 요금 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <Wallet class="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
            <p class="text-xs text-amber-700 font-medium mb-1">총 요금</p>
            <p class="text-xl font-black text-amber-800">
              {{ (settlement.totalFare || 0).toLocaleString() }}<span class="text-sm font-normal ml-0.5">원</span>
            </p>
          </div>
          <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
            <Users class="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
            <p class="text-xs text-indigo-700 font-medium mb-1">
              <template v-if="participantCount === 0">인당 분담 (탑승객 0명)</template>
              <template v-else>인당 요금 ({{ participantCount }}명 · 1/N 기준)</template>
            </p>
            <p class="text-xl font-black text-indigo-800">
              <template v-if="participantCount === 0">—</template>
              <template v-else>{{ (settlement.farePerPerson || 0).toLocaleString() }}<span class="text-sm font-normal ml-0.5">원</span></template>
            </p>
          </div>
        </div>

        <!-- 탑승객 목록 -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <Users class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-semibold text-gray-600">탑승객 ({{ participantCount }}명)</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="(p, i) in settlement.participants"
              :key="i"
              class="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {{ (p.nickname || '?').charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-800 truncate">{{ p.nickname || '이름 없음' }}</p>
                  <a
                    :href="`tel:${p.phoneNumber}`"
                    class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-0.5"
                  >
                    <Phone class="w-3.5 h-3.5" />
                    {{ p.phoneNumber || '-' }}
                  </a>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-xs text-gray-500 font-medium">분담</p>
                <p class="text-lg font-black text-indigo-800">
                  {{ (p.shareAmount ?? settlement.farePerPerson ?? 0).toLocaleString() }}<span class="text-xs font-semibold ml-0.5">원</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p v-if="chargeError" class="text-sm text-red-600 text-center font-medium">{{ chargeError }}</p>
        <p v-else-if="chargeDone" class="text-sm text-emerald-700 text-center font-semibold">
          탑승객 결제가 완료되었습니다.
        </p>

        <!-- 결제 → 홈 -->
        <div class="space-y-3">
          <button
            type="button"
            :disabled="!canCharge"
            class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold text-base rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            @click="requestCharge"
          >
            <CreditCard class="w-5 h-5" />
            {{ chargeLoading ? '결제 처리 중…' : chargeDone ? '결제 완료됨' : '탑승객 결제하기' }}
          </button>
          <button
            type="button"
            class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base rounded-xl transition-all shadow-sm"
            @click="router.push('/driverpage')"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
