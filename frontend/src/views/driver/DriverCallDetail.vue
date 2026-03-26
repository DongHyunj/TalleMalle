<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MapPin,
  Navigation,
  CheckCircle,
  ArrowLeft,
  XCircle,
  AlertCircle,
  Info,
  Timer,
  Route,
  Wallet,
} from 'lucide-vue-next'
import driverApi from '@/api/driver'

const route = useRoute()
const router = useRouter()
const callDetail = ref(null)
const hasActiveCall = ref(false)
const isLoading = ref(true)
const isProcessing = ref(false)

const callIdx = route.params.id

const modalState = ref({
  show: false,
  type: 'alert',
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  onConfirm: null,
  onCancel: null,
})

const showModal = (options) => {
  modalState.value = {
    show: true,
    type: options.type || 'alert',
    title: options.title || '알림',
    message: options.message || '',
    confirmText: options.confirmText || '확인',
    cancelText: options.cancelText || '닫기',
    onConfirm: options.onConfirm || null,
    onCancel: options.onCancel || null,
  }
}

const handleModalConfirm = () => {
  if (modalState.value.onConfirm) modalState.value.onConfirm()
  modalState.value.show = false
}

const handleModalCancel = () => {
  if (modalState.value.onCancel) modalState.value.onCancel()
  modalState.value.show = false
}

const initData = async () => {
  isLoading.value = true
  try {
    try {
      const myCallRes = await driverApi.getMyCall()
      if (
        myCallRes.data &&
        myCallRes.data.callIdx !== Number(callIdx) &&
        myCallRes.data.status?.toUpperCase() === 'ACCEPTED'
      ) {
        hasActiveCall.value = true
      }
    } catch (e) {
      hasActiveCall.value = false
    }

    const res = await driverApi.getCallDetail(callIdx)
    callDetail.value = res.data
  } catch (error) {
    showModal({
      type: 'alert',
      title: '오류 발생',
      message: '정보를 불러오지 못했습니다.',
      onConfirm: () => router.back(),
    })
  } finally {
    isLoading.value = false
  }
}

const acceptCall = () => {
  if (hasActiveCall.value) {
    showModal({
      type: 'alert',
      title: '수락 불가',
      message: '이미 진행 중인 운행이 있습니다.\n기존 운행을 종료하거나 취소해주세요.',
    })
    return
  }
  showModal({
    type: 'confirm',
    title: '콜 수락',
    message: '이 콜을 수락하시겠습니까?',
    confirmText: '수락하기',
    onConfirm: async () => {
      isProcessing.value = true
      try {
        await driverApi.acceptCall(callIdx)
        showModal({
          type: 'alert',
          title: '수락 완료',
          message: '콜 수락이 완료되었습니다!',
          onConfirm: () => router.push('/driverpage'),
        })
      } catch (error) {
        showModal({
          type: 'alert',
          title: '수락 실패',
          message: error.response?.data?.message || '콜 수락에 실패했습니다.',
          onConfirm: () => initData(),
        })
      } finally {
        isProcessing.value = false
      }
    },
  })
}

const cancelCall = () => {
  showModal({
    type: 'confirm',
    title: '콜 취소',
    message: '정말 이 콜을 취소하시겠습니까?\n취소 시 패널티가 발생할 수 있습니다.',
    confirmText: '취소하기',
    onConfirm: async () => {
      isProcessing.value = true
      try {
        await driverApi.cancelCall(callIdx)
        showModal({
          type: 'alert',
          title: '취소 완료',
          message: '콜이 안전하게 취소되었습니다.',
          onConfirm: () => router.back(),
        })
      } catch (error) {
        showModal({
          type: 'alert',
          title: '취소 실패',
          message: error.response?.data?.message || '콜 취소에 실패했습니다.',
          onConfirm: () => initData(),
        })
      } finally {
        isProcessing.value = false
      }
    },
  })
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div
    class="h-screen w-full bg-slate-100 p-4 sm:p-8 flex items-center justify-center font-sans text-gray-800"
  >
    <div
      class="w-full max-w-3xl bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col max-h-[95vh] overflow-hidden"
    >
      <header
        class="shrink-0 bg-slate-50 px-8 py-5 border-b border-gray-200 flex items-center gap-4"
      >
        <button
          @click="router.back()"
          class="text-gray-500 hover:text-gray-800 transition-colors bg-white border border-gray-200 p-2 rounded-lg hover:shadow-sm"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold text-gray-900">콜 상세 정보</h1>
      </header>

      <div
        v-if="isLoading"
        class="flex-1 flex flex-col items-center justify-center p-20 text-gray-500"
      >
        <div
          class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-lg">정보를 불러오는 중입니다...</p>
      </div>

      <div v-else-if="callDetail" class="flex-1 overflow-y-auto p-8">
        <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <span
              class="px-4 py-1.5 text-sm font-bold rounded-full"
              :class="{
                'bg-emerald-100 text-emerald-800':
                  !callDetail.status || callDetail.status?.toUpperCase() === 'WAITING',
                'bg-indigo-100 text-indigo-800': callDetail.status?.toUpperCase() === 'ACCEPTED',
                'bg-rose-100 text-rose-800': callDetail.status?.toUpperCase() === 'CANCELED',
              }"
            >
              {{
                !callDetail.status || callDetail.status?.toUpperCase() === 'WAITING'
                  ? '대기 중'
                  : callDetail.status?.toUpperCase() === 'ACCEPTED'
                    ? '수락됨'
                    : '취소됨'
              }}
            </span>
            <span class="text-gray-400 font-mono text-sm">Call ID: #{{ callDetail.callIdx }}</span>
          </div>
        </div>

        <div class="bg-gray-50 rounded-xl p-8 mb-8 border border-gray-100 relative">
          <div class="absolute left-10 top-12 bottom-12 w-0.5 bg-gray-300"></div>

          <div class="flex items-start gap-4 mb-8 relative z-10">
            <div class="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              <MapPin class="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">출발지</p>
              <p class="text-xl font-bold text-gray-900">{{ callDetail.startLocation }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4 relative z-10">
            <div class="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              <Navigation class="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">도착지</p>
              <p class="text-xl font-bold text-gray-900">{{ callDetail.endLocation }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-sm">
            <Route class="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p class="text-sm text-gray-500 font-medium mb-1">예상 거리</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ (callDetail.distance || 0).toFixed(1) }}
              <span class="text-base font-normal text-gray-500">km</span>
            </p>
          </div>
          <div class="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-sm">
            <Timer class="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <p class="text-sm text-gray-500 font-medium mb-1">예상 시간</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ callDetail.duration || 0 }}
              <span class="text-base font-normal text-gray-500">분</span>
            </p>
          </div>
          <div class="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center shadow-sm">
            <Wallet class="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <p class="text-sm text-amber-800 font-medium mb-1">예상 금액</p>
            <p class="text-2xl font-bold text-amber-700">
              {{ (callDetail.estimatedFare || 0).toLocaleString() }}
              <span class="text-base font-normal">원</span>
            </p>
          </div>
        </div>

        <div
          v-if="
            hasActiveCall &&
            (!callDetail.status ||
              callDetail.status?.toUpperCase() === 'WAITING' ||
              callDetail.status?.toUpperCase() === 'CANCELED')
          "
          class="p-4 bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-3"
        >
          <AlertCircle class="w-6 h-6 text-amber-600 shrink-0" />
          <p class="text-amber-800 font-medium">
            현재 진행 중인 콜이 있어 새로운 콜을 수락할 수 없습니다.
          </p>
        </div>
      </div>

      <div
        v-if="callDetail"
        class="shrink-0 bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end gap-4"
      >
        <button
          v-if="!callDetail.status || callDetail.status?.toUpperCase() !== 'ACCEPTED'"
          @click="acceptCall"
          :disabled="isProcessing || hasActiveCall"
          class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold rounded-xl flex items-center gap-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
        >
          <CheckCircle class="w-5 h-5" />
          {{ isProcessing ? '처리 중...' : '이 콜 수락하기' }}
        </button>

        <button
          v-if="callDetail.status?.toUpperCase() === 'ACCEPTED'"
          @click="cancelCall"
          :disabled="isProcessing"
          class="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          <XCircle class="w-5 h-5" />
          {{ isProcessing ? '처리 중...' : '운행 취소하기' }}
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="modalState.show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center"
        >
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            :class="
              modalState.type === 'confirm'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            "
          >
            <Info v-if="modalState.type === 'confirm'" class="w-8 h-8" />
            <AlertCircle v-else class="w-8 h-8" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ modalState.title }}</h3>
          <p class="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-8">
            {{ modalState.message }}
          </p>
          <div class="w-full flex gap-3">
            <button
              v-if="modalState.type === 'confirm'"
              @click="handleModalCancel"
              class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              @click="handleModalConfirm"
              class="flex-1 py-3 text-white font-bold rounded-xl transition-colors"
              :class="
                modalState.title.includes('취소')
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              "
            >
              {{ modalState.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>