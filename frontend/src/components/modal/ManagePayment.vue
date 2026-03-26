<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { CreditCard, Trash2, Check } from 'lucide-vue-next'
import api from '@/api/payment'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */

const props = defineProps({
  selectedPayment: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['modal'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 모달 닫기 핸들러
const handleClose = () => {
  emits('modal', 'none')
}

// 기본 결제 수단 설정 핸들러
const setAsDefaultPayment = async () => {
  if (props.selectedPayment) {
    await api.defaultBilling(props.selectedPayment.idx)
    handleClose()
  }
}

// 결제 수단 삭제 핸들러
const deletePaymentMethod = async () => {
  if (props.selectedPayment) {
    const res = await api.revoke(props.selectedPayment.idx)
    handleClose()
    return res;
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[170] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
  >
    <!-- 모달 외부 클릭 시 닫기 위해 @click.stop 및 이벤트 버블링 관리 -->
    <div class="w-full max-w-md animate-in fade-in zoom-in duration-300" @click.stop>
      <div
        class="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        @click="handleClose"
      >
        <!-- 카드 정보 헤더 -->
        <div class="p-8 text-center border-b border-slate-50" @click.stop>
          <div
            class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4"
          >
            <CreditCard class="w-8 h-8 text-slate-400" />
          </div>
          <h2 class="text-lg font-extrabold text-slate-900 mb-1">결제 수단 관리</h2>
          <p class="text-sm text-slate-400 font-medium">
            {{ selectedPayment?.alias }}
          </p>
        </div>

        <!-- 관리 버튼 영역 -->
        <div class="p-4 grid grid-cols-1 gap-2" @click.stop>
          <button
            v-if="!selectedPayment?.isDefault"
            @click="setAsDefaultPayment"
            class="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            <Check class="w-4 h-4" /> 기본 결제 수단으로 설정
          </button>
          <div v-else class="flex items-center justify-center gap-2 py-4 text-indigo-600 font-bold text-sm">
            <Check class="w-4 h-4" /> 현재 기본 결제 수단입니다
          </div>
          <button
            v-if="!selectedPayment?.isDefault"
            @click="deletePaymentMethod"
            class="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition-all"
          >
            <Trash2 class="w-4 h-4" /> 삭제하기
          </button>
          <button @click="handleClose" class="w-full py-4 text-slate-400 font-bold text-sm">
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
