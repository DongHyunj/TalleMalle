<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, Lock } from 'lucide-vue-next'
import AuthBaseInput from '@/components/user/AuthBaseInput.vue'
import AuthLayout from '@/components/user/AuthLayout.vue'
import SocialLogin from '@/components/login/SocialLogin.vue'
import api from '@/api/user'
import profileApi from '@/api/profile'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const router = useRouter()
const authStore = useAuthStore()

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 및 Computed)
 * ==============================================================================
 */
const loginForm = reactive({
  email: '',
  password: '',
})

// 입력 값 검증을 위한 변수 저장
const loginInputError = reactive({
  email: { errorMessage: null, isValid: false },
  password: { errorMessage: null, isValid: false },
})

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (UI 및 검증 로직)
 * ==============================================================================
 */
const emailRules = () => {
  if (loginForm.email.length === 0) {
    loginInputError.email.errorMessage = '이메일을 입력해주세요.'
    loginInputError.email.isValid = false
    return
  }
  loginInputError.email.errorMessage = ''
  loginInputError.email.isValid = true
}

const passwordRules = () => {
  const hasLowerLetter = /[a-z]/.test(loginForm.password)
  const hasNumber = /[0-9]/.test(loginForm.password)
  const hasSpecial = /[!@$]/.test(loginForm.password)

  if (loginForm.password.length < 8) {
    loginInputError.password.errorMessage = '비밀번호는 8글자 이상 입력해야합니다.'
    loginInputError.password.isValid = false
    return
  }

  if (!(hasLowerLetter && hasNumber && hasSpecial)) {
    loginInputError.password.errorMessage =
      '비밀번호는 영문 소문자, 숫자, 특수문자를 모두 포함해야합니다.'
    loginInputError.password.isValid = false
    return
  }

  loginInputError.password.errorMessage = ''
  loginInputError.password.isValid = true
}

/**
 * ==============================================================================
 * 5. METHODS - API SERVICE METHODS (인증 API 서비스)
 * ==============================================================================
 */
// 로그인 처리
const handleLogin = async () => {
  // 1. 사전 유효성 검사 실행
  emailRules()
  passwordRules()

  if (!loginInputError.email.isValid || !loginInputError.password.isValid) {
    return
  }

  // 2. 로그인 시도
  try {
    const res = await api.login(loginForm)

    // 성공 시 처리 (200 OK)
    authStore.login(res.data)
    // console.log('로그인 시 authStore 유저 정보', authStore.user)

    const profileRes = await profileApi.profile()
    authStore.updateUser(profileRes.data.result)

    alert('로그인되었습니다.')
    router.push('/main')
  } catch (error) {
    // 실패 시 처리 (401 등 모든 에러)
    // console.error('로그인 실패:', error)

    // 아이디/비번 불일치 또는 서버 에러 처리
    const message =
      error.response?.status === 401
        ? '아이디와 비밀번호를 확인해보세요.'
        : '로그인 중 오류가 발생했습니다.'

    alert(message)
  }
}
</script>

<template>
  <AuthLayout no-footer-background>
    <template #header>
      <h2 class="text-2xl font-bold text-slate-900">다시 오셨군요!</h2>
      <p class="text-slate-500 mt-2 text-sm">함께 탈 파트너가 기다리고 있어요.</p>
    </template>

    <form @submit.prevent="handleLogin" class="px-8 py-4 space-y-4">
      <AuthBaseInput
        v-model="loginForm.email"
        type="email"
        placeholder="이메일 주소"
        :icon="Mail"
        :error="loginInputError.email.errorMessage"
        @blur="emailRules"
      />

      <div>
        <AuthBaseInput
          v-model="loginForm.password"
          type="password"
          placeholder="비밀번호"
          :icon="Lock"
          :error="loginInputError.password.errorMessage"
          @blur="passwordRules"
        />
        <div class="flex justify-end mt-1">
          <router-link
            to="/findpassword"
            class="text-xs text-slate-400 hover:text-indigo-600 font-medium py-1"
          >
            비밀번호를 잊으셨나요?
          </router-link>
        </div>
      </div>

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all mt-2 active:scale-[0.98]"
      >
        로그인하기
      </button>

      <SocialLogin />
    </form>

    <template #footer>
      <p class="text-sm text-slate-500">
        아직 회원이 아니신가요?
        <router-link to="/signup" class="text-indigo-600 font-bold hover:underline ml-1">
          회원가입
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template>