<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { KeyRound, Lock, CheckCircle2, Check } from 'lucide-vue-next'
import AuthBaseInput from '@/components/user/AuthBaseInput.vue'
import PasswordLayout from '@/components/user/PasswordLayout.vue'
import PasswordModal from '@/components/user/PasswordModal.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const router = useRouter()

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 관리)
 * ==============================================================================
 */
const password = ref('')
const passwordConfirm = ref('')
const isModalOpen = ref(false)

// 입력 필드별 에러 메시지 상태 관리
const inputError = reactive({
  password: { errorMessage: null },
  confirm: { errorMessage: null }
})

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (기능 및 UI 로직)
 * ==============================================================================
 */
// [실시간 유효성 검사] 입력 값에 따라 버튼 활성화 여부를 계산
const isFormValid = computed(() => {
  // 비밀번호 규칙: 영문 소문자, 숫자, 특수문자(!@$) 포함 및 8자 이상
  const hasLower = /[a-z]/.test(password.value)
  const hasNumber = /[0-9]/.test(password.value)
  const hasSpecial = /[!@$]/.test(password.value)
  const isLenValid = password.value.length >= 8

  const isPasswordValid = hasLower && hasNumber && hasSpecial && isLenValid
  
  // 비밀번호 확인: 입력 값이 존재하고 메인 비밀번호와 일치하는지 확인
  const isConfirmValid = password.value === passwordConfirm.value && passwordConfirm.value !== ''

  return isPasswordValid && isConfirmValid
})

// [검사 규칙] 새 비밀번호 입력란 Blur 시 호출
const passwordRules = () => {
  const hasLower = /[a-z]/.test(password.value)
  const hasNumber = /[0-9]/.test(password.value)
  const hasSpecial = /[!@$]/.test(password.value)

  if (!password.value) {
    inputError.password.errorMessage = '새 비밀번호를 입력해주세요.'
  } else if (password.value.length < 8) {
    inputError.password.errorMessage = '비밀번호는 8자 이상이어야 합니다.'
  } else if (!(hasLower && hasNumber && hasSpecial)) {
    inputError.password.errorMessage = '영문 소문자, 숫자, 특수문자(!@$)를 모두 포함해야 합니다.'
  } else {
    inputError.password.errorMessage = null
  }
}

// [검사 규칙] 비밀번호 확인 입력란 Blur 시 호출
const confirmRules = () => {
  if (!passwordConfirm.value) {
    inputError.confirm.errorMessage = '비밀번호 확인을 입력해주세요.'
  } else if (password.value !== passwordConfirm.value) {
    inputError.confirm.errorMessage = '비밀번호가 일치하지 않습니다.'
  } else {
    inputError.confirm.errorMessage = null
  }
}

/**
 * ==============================================================================
 * 5. METHODS - API SERVICE METHODS (서버 연동)
 * ==============================================================================
 */
// 비밀번호 재설정 최종 요청
const handleReset = async () => {
  if (!isFormValid.value) return

  try {
    // API 연동 시 실제 재설정 로직이 들어갈 자리입니다.
    // 성공 시 결과 알림 모달을 오픈합니다.
    isModalOpen.value = true
  } catch (error) {
    // console.error('비밀번호 변경 실패:', error)
    window.alert('변경 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}
</script>

<template>
  <PasswordLayout
    title="비밀번호 재설정"
    description="새로운 비밀번호를 입력해주세요."
    :icon="KeyRound"
  >
    <form @submit.prevent="handleReset" class="space-y-5">
      <AuthBaseInput 
        v-model="password"
        label="새 비밀번호"
        label-class="text-xs text-slate-400 uppercase"
        type="password"
        placeholder="8자 이상, 소문자/숫자/특수문자 포함"
        :icon="Lock"
        :error="inputError.password.errorMessage"
        @blur="passwordRules"
      />

      <AuthBaseInput 
        v-model="passwordConfirm"
        label="비밀번호 확인"
        label-class="text-xs text-slate-400 uppercase"
        type="password"
        placeholder="비밀번호 재입력"
        :icon="Check"
        :error="inputError.confirm.errorMessage"
        @blur="confirmRules"
      />

      <button 
        type="submit"
        :disabled="!isFormValid"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
      >
        변경 완료
      </button>
    </form>
  </PasswordLayout>

  <PasswordModal
    :is-open="isModalOpen"
    title="변경 완료"
    description="비밀번호가 성공적으로 변경되었습니다.
    새 비밀번호로 로그인해주세요."
    button-text="로그인하러 가기"
    :icon="CheckCircle2"
    icon-class="bg-emerald-100 text-emerald-600"
    @confirm="router.push('/login')"
  />
</template>