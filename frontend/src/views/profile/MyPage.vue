<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
import { UserMinus, History, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/profile'
import RoundBox from '@/components/layout/RoundBox.vue'
import ManagePayment from '@/components/modal/ManagePayment.vue'
import EditProfile from '@/components/modal/EditProfile.vue'
import HistoryEntry from '@/components/entry/HistoryEntry.vue'
import PaymentList from '@/components/list/PaymentList.vue'
import HistoryDetail from '@/components/modal/HistoryDetail.vue'
import LimitReached from '@/components/modal/LimitReached.vue'
import WithdrawConfirm from '@/components/modal/WithdrawConfirm.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const authStore = useAuthStore()
const router = useRouter()

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언) - [변수]
 * ==============================================================================
 */
// 모달 상태 관리
const activeModal = ref('none')

// 데이터 상태 (컴포넌트 로컬 관리)
const rideHistoryList = ref([]) // 탑승 기록 리스트
const currentHistory = ref({}) // 상세 보기용 선택된 기록

// 선택된 결제 데이터 상태
const selectedPayment = ref(null)
const paymentListRef = ref(null) // 결제 수단 목록 Ref

/**
 * ==============================================================================
 * 4. COMPUTED (계산된 속성)
 * ==============================================================================
 */
// 최근 5건의 탑승 기록만 반환
const recentHistory = computed(() => {
  return (rideHistoryList.value || []).slice(0, 5)
})

/**
 * ==============================================================================
 * 5. METHODS - UI INTERACTION (화면 조작) - [기능 함수]
 * ==============================================================================
 */

// 탑승 상세 정보 열기
const openRideDetail = (id) => {
  const selected = rideHistoryList.value.find((item) => item.id === id)
  if (selected) {
    currentHistory.value = selected
    handleModal('history-detail')
  }
}

// 카드 관리 핸들러
const handleManagePayment = (card) => {
  selectedPayment.value = card
  handleModal('manage-payment')
}

// 회원 탈퇴 확인
const handleWithdrawConfirm = () => {
  handleModal('none')
  router.push('login')
}

// 모달 관리 핸들러
const handleModal = (active) => {
  activeModal.value = active
  if (active === 'none' && paymentListRef.value) {
    paymentListRef.value.initBillingList()
  }
}

/**
 * ==============================================================================
 * 6. METHODS - DATA & NETWORK (데이터 통신 및 소켓) - [연동 API 함수]
 * ==============================================================================
 */
// 전체 사용자 정보 Fetch
const fetchAllUserInfo = async () => {
  try {
    const results = await Promise.allSettled([
      api.profile(),
      api.history()
    ])

    const [profileResult, historyResult] = results

    // 1. 프로필 정보 업데이트 (authStore)
    if (profileResult.status === 'fulfilled' && profileResult.value.data?.result) {
      authStore.updateUser(profileResult.value.data.result)
    }

    // 3. 탑승 기록 업데이트 (컴포넌트 로컬 상태)
    if (historyResult.status === 'fulfilled' && historyResult.value.data?.result) {
      // 백엔드 필드명을 컴포넌트 props명으로 매핑
      rideHistoryList.value = historyResult.value.data.result.map((item, index) => ({
        id: item.idx || index,
        start: item.startPointName,
        dest: item.destPointName,
        departure: item.departureTime,
        arrival: item.arrivalTime, // 도착 시간 매핑 추가
        cost: item.amount?.toLocaleString() + '원',
        people: item.currentCapacity || 0,
        isDone: true
      }))
    }
  } catch (error) {
    // console.error('Critical error during fetchAllData:', error)
  }
}

/**
 * ==============================================================================
 * 7. LIFECYCLE (생명주기 훅) - [마운트 관련]
 * ==============================================================================
 */
onMounted(async () => {
  await fetchAllUserInfo()
})
</script>

<template>
  <div class="h-full flex gap-4 p-4 overflow-hidden relative text-slate-900">
    <div class="hidden md:block w-20 shrink-0"></div>

    <div
      class="flex-1 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur border border-white/50 shadow-xl"
    >
      <!-- 헤더 -->
      <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight text-left">
            마이페이지
          </h1>
          <p class="text-sm text-slate-400 font-medium mt-1 text-left">
            나의 동승 기록과 프로필 정보를 관리하세요.
          </p>
        </div>
        <div class="flex gap-4">
          <div class="text-right">
            <p class="text-[10px] font-bold text-slate-400 uppercase">누적 동승</p>
            <p class="text-lg font-black text-indigo-600">
              {{ rideHistoryList?.length || 0 }}회
            </p>
          </div>
        </div>
      </div>

      <!-- 메인 컨테이너 -->
      <div class="flex-1 overflow-y-auto p-8 custom-scroll">
        <div class="max-w-6xl mx-auto grid grid-cols-12 gap-8 w-full">
          <!-- 왼쪽 사이드바 (프로필) -->
          <div class="col-span-12 lg:col-span-4 space-y-6">
            <!-- 프로필 카드 -->
            <RoundBox padding="32px" class="text-center relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-24 bg-slate-50"></div>
              <div class="relative w-28 h-28 mx-auto mb-4 mt-4">
                <img
                  :src="
                    authStore.user?.imageUrl ||
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
                  "
                  class="w-full h-full rounded-full bg-white border-4 border-white shadow-xl object-cover"
                />
              </div>
              <h2 class="text-xl font-bold text-slate-900">
                {{ authStore.user?.nickname || '사용자' }}
              </h2>
              <p class="text-xs text-slate-400 mb-6 text-center tracking-tight leading-relaxed">
                {{ authStore.user?.introduction || '등록된 자기소개가 없습니다.' }}
              </p>
              <button
                @click="handleModal('edit-profile')"
                class="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
              >
                개인정보 수정
              </button>
            </RoundBox>

            <div class="pt-4 flex justify-center">
              <button
                @click="handleModal('withdraw-confirm')"
                class="flex items-center gap-1.5 text-slate-300 hover:text-rose-500 transition-all font-bold text-[11px]"
              >
                <UserMinus class="w-3.5 h-3.5" />
                탈래말래 탈퇴하기
              </button>
            </div>
          </div>

          <!-- 오른쪽 섹션 (기록/결제) -->
          <div class="col-span-12 lg:col-span-8 space-y-6">
            <!-- 결제 수단 영역 -->
            <PaymentList
              ref="paymentListRef"
              @manage-payment="handleManagePayment"
              @modal="handleModal"
            />

            <!-- 탑승 기록 영역 -->
            <RoundBox padding="32px">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-slate-900 flex items-center gap-2 text-left">
                  <History class="w-5 h-5 text-indigo-600" /> 탑승 기록
                </h3>
              </div>

              <div class="max-h-[460px] md:max-h-[240px] overflow-y-auto custom-scroll pr-2">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HistoryEntry
                    v-for="item in rideHistoryList"
                    :key="item.id"
                    v-bind="item"
                    @click="openRideDetail(item.id)"
                  />
                  
                  <div
                    v-if="rideHistoryList?.length === 0"
                    class="flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-sm font-bold col-span-full"
                  >
                    최근 이용 내역이 없습니다.
                  </div>
                </div>
              </div>
            </RoundBox>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달 Teleport -->
    <Teleport to="body">
      <EditProfile v-if="activeModal === 'edit-profile'" @modal="handleModal" />
      <ManagePayment
        v-if="activeModal === 'manage-payment' && selectedPayment"
        :selectedPayment="selectedPayment"
        @modal="handleModal"
      />

      <!-- 탑승 상세 모달 -->
      <HistoryDetail
        v-if="activeModal === 'history-detail' && currentHistory"
        :currentHistory="currentHistory"
        @modal="handleModal"
      />

      <!-- 등록 제한 알림 -->
      <LimitReached v-if="activeModal === 'limit-reached'" @modal="handleModal" />

      <!-- 회원 탈퇴 확인 모달 -->
      <WithdrawConfirm
        v-if="activeModal === 'withdraw-confirm'"
        @modal="handleModal"
        @confirm="handleWithdrawConfirm"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.glass-panel {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
</style>
