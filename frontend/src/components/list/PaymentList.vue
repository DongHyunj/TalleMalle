<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import api from '@/api/payment'

// Components
import RoundBox from '@/components/layout/RoundBox.vue'
import PaymentEntry from '@/components/entry/PaymentEntry.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const emits = defineEmits(['manage-payment'])
const paymentInst = shallowRef(null)
const clientKey = 'test_ck_Gv6LjeKD8aYKA6qPb5QL8wYxAdXy'
const billingList = reactive([])

/**
 * ==============================================================================
 * 3. COMPUTED (계산된 속성)
 * ==============================================================================
 */

/**
 * ==============================================================================
 * 4. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */

// 토스 페이먼츠 SDK 초기회
const initTossPaymentsSDK = async () => {
  const tossPayments = TossPayments(clientKey)
  const keyRes = await api.key()
  const customerKey = keyRes.data.result.customerKey
  paymentInst.value = tossPayments.payment({ customerKey })
}

// 결제 수단 초기화
const initBillingList = async () => {
  const listRes = await api.list()
  const { defaultBilling, otherBillings } = listRes.data.result.billingGroup

  billingList.length = 0

  if (defaultBilling) billingList.push(defaultBilling)
  if (otherBillings) billingList.push(...otherBillings)
}
// 결제 수단 추가 핸들러
const handleRegisterPayment = async () => {
  await paymentInst.value.requestBillingAuth({
    method: 'CARD', // 자동결제(빌링)는 카드만 지원합니다
    successUrl: window.location.origin + '/payment/approve', // 요청이 성공하면 리다이렉트되는 URL
    failUrl: window.location.origin + '/payment/fail', // 요청이 실패하면 리다이렉트되는 URL
    customerEmail: 'customer123@gmail.com',
    customerName: '김토스',
  })
}

onMounted(() => {
  initTossPaymentsSDK()
  initBillingList()
})

// 결제 수단 관리(수정/삭제) 핸들러
const handleManagePayment = (billing, isDefault) => {
  emits('manage-payment', { ...billing, isDefault })
}

defineExpose({
  initBillingList
})
</script>

<template>
  <RoundBox padding="32px" class="flex-none">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-bold text-slate-900 flex items-center gap-2 text-left">
        <CreditCard class="w-5 h-5 text-indigo-600" /> 나의 결제 수단
      </h3>
      <button
        @click="handleRegisterPayment"
        class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
      >
        카드 추가
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PaymentEntry
        v-for="(billing, index) in billingList"
        :key="billing.idx"
        :billing="billing"
        :is-default="index === 0"
        @click="handleManagePayment(billing, index === 0)"
      />

      <!-- 데이터가 없을 때 -->
      <div
        v-if="billingList.length === 0"
        class="flex items-center justify-center p-5 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-sm font-bold col-span-full"
      >
        등록된 결제 수단이 없습니다.
      </div>
    </div>
  </RoundBox>
</template>
