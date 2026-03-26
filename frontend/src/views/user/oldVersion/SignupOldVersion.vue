<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Check, User } from 'lucide-vue-next'
import AuthBaseInput from '@/components/user/AuthBaseInput.vue'
import AuthLayout from '@/components/user/AuthLayout.vue'
import api from '@/api/user/index.js'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어)
 * ==============================================================================
 */
const router = useRouter()

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 및 Computed)
 * ==============================================================================
 */
// 회원가입 폼 데이터
const signupForm = reactive({
  email: '',
  name: '',
  password: '',
})

// 비밀번호 확인용 단일 상태
const passwordConfirm = ref('')

// 에러 메시지 및 유효성 상태
const signupInputError = reactive({
  email: { errorMessage: null, isValid: false },
  name: { errorMessage: null, isValid: false },
  password: { errorMessage: null, isValid: false },
})

// 전체 폼 유효성 검사 (Computed)
const isFormValid = computed(() => {
  // 1. 이메일 정규식 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailRegex.test(signupForm.email)

  // 2. 이름 확인
  const isNameValid = signupForm.name.trim().length > 0

  // 3. 비밀번호 복잡도 확인
  const hasLower = /[a-z]/.test(signupForm.password)
  const hasNumber = /[0-9]/.test(signupForm.password)
  const hasSpecial = /[!@$]/.test(signupForm.password)
  const isLenValid = signupForm.password.length >= 8
  const isPasswordValid = hasLower && hasNumber && hasSpecial && isLenValid

  // 4. 비밀번호 일치 확인
  const isConfirmValid =
    signupForm.password === passwordConfirm.value && passwordConfirm.value !== ''

  return isEmailValid && isNameValid && isPasswordValid && isConfirmValid
})

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (기능 및 UI 로직)
 * ==============================================================================
 */
// --- UI 메시지 표시용 ---
const emailRules = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!signupForm.email) {
    signupInputError.email.errorMessage = '이메일을 입력해주세요.'
    signupInputError.email.isValid = false
  } else if (!emailRegex.test(signupForm.email)) {
    signupInputError.email.errorMessage = '올바른 이메일 형식이 아닙니다.'
    signupInputError.email.isValid = false
  } else {
    signupInputError.email.errorMessage = null
    signupInputError.email.isValid = true
  }
}

const nicknameRules = () => {
  if (!signupForm.name.trim()) {
    signupInputError.name.errorMessage = '닉네임을 입력해주세요.'
    signupInputError.name.isValid = false
  } else {
    signupInputError.name.errorMessage = null
    signupInputError.name.isValid = true
  }
}

const passwordRules = () => {
  const hasLower = /[a-z]/.test(signupForm.password)
  const hasNumber = /[0-9]/.test(signupForm.password)
  const hasSpecial = /[!@$]/.test(signupForm.password)

  if (signupForm.password.length < 8) {
    signupInputError.password.errorMessage = '패스워드는 8글자 이상 입력해야합니다.'
    signupInputError.password.isValid = false
  } else if (!(hasLower && hasNumber && hasSpecial)) {
    signupInputError.password.errorMessage =
      '비밀번호는 영문 소문자, 숫자, 특수문자(!@$)를 모두 포함해야합니다.'
    signupInputError.password.isValid = false
  } else {
    signupInputError.password.errorMessage = ''
    signupInputError.password.isValid = true
  }
}

/**
 * ==============================================================================
 * 5. METHODS - API & NETWORK (서버 연동)
 * ==============================================================================
 */
// --- 회원가입 처리 ---
const handleSignup = async () => {
  if (!isFormValid.value) return

  try {
    const res = await api.signup(signupForm)
    
    // 성공 시 처리 (HTTP 200, 201 등 2xx 응답)
    // console.log('Signup Response:', res)
    alert('회원가입이 완료되었습니다. 로그인해주세요.')
    router.push('/login')

  } catch (error) {
    // API 서버에서 오는 400, 500번대 에러는 모두 이쪽으로 들어옵니다.
    // console.error('회원가입 실패:', error)
    const message = error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
    alert(message)
  }
}
</script>

<template>
  <div class="signup-page-wrapper">
    <AuthLayout :key="$route.path">
      <template #header>
        <h2 class="text-xl font-bold text-slate-900">회원가입</h2>
        <p class="text-slate-500 mt-2 text-sm">간편하게 가입하고 서비스를 이용해보세요.</p>
      </template>

      <form class="p-8 pt-4 space-y-5" @submit.prevent="handleSignup">
        <AuthBaseInput
          v-model="signupForm.email"
          label="이메일 계정"
          type="email"
          placeholder="example@tallemalle.com"
          :icon="Mail"
          :error="signupInputError.email.errorMessage"
          @blur="emailRules"
        />

        <AuthBaseInput
          v-model="signupForm.name"
          label="닉네임"
          type="text"
          placeholder="닉네임을 입력해주세요"
          :icon="User"
          :error="signupInputError.name.errorMessage"
          @blur="nicknameRules"
        />

        <AuthBaseInput
          v-model="signupForm.password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호 입력"
          :icon="Lock"
          :error="signupInputError.password.errorMessage"
          @blur="passwordRules"
        />

        <AuthBaseInput
          v-model="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호 재입력"
          :icon="Check"
          :error="
            passwordConfirm && signupForm.password !== passwordConfirm
              ? '비밀번호가 일치하지 않습니다.'
              : null
          "
        />

        <button
          :disabled="!isFormValid"
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          <span>가입 완료</span>
          <Check class="w-5 h-5" />
        </button>
      </form>

      <template #footer>
        <p class="text-sm text-slate-500">
          이미 계정이 있으신가요?
          <RouterLink to="/login" class="text-indigo-600 font-bold hover:underline ml-1">
            로그인
          </RouterLink>
        </p>
      </template>
    </AuthLayout>
  </div>
</template>