<script setup>
/**

 * ==============================================================================

 * 1. IMPORTS

 * ==============================================================================

 */

import { reactive } from 'vue'

import { useRouter } from 'vue-router'

import { useDriverStore } from '@/stores/driver'

import { Mail, Lock, CarFront } from 'lucide-vue-next'

import api from '@/api/driver'

/**

 * ==============================================================================

 * 2. CONFIG & STORES

 * ==============================================================================

 */

const router = useRouter()

const driverStore = useDriverStore()

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

    const payload = res.data?.user ?? res.data
    if (payload?.role !== 'DRIVER') {
      alert('드라이버 계정만 로그인할 수 있습니다.')
      return
    }

    driverStore.login(res.data)

    alert('로그인되었습니다.')

    router.push('/driverpage')
  } catch (error) {
    const serverMessage = error.response?.data?.message
    const message =
      serverMessage ||
      (error.response?.status === 401
        ? '아이디와 비밀번호를 확인해보세요.'
        : '로그인 중 오류가 발생했습니다.')

    alert(message)
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 font-sans driver-bg"
  >
    <div class="w-full max-w-md">
      <!-- 드라이버 전용 뱃지 -->
      <div class="flex justify-center mb-5">
        <span
          class="bg-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full border border-violet-500/30 uppercase tracking-widest"
        >
          드라이버 전용
        </span>
      </div>

      <div
        class="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/60"
      >
        <!-- 헤더 -->
        <div class="p-8 pb-4 flex flex-col items-center text-center">
          <div class="flex items-center gap-2 mb-6">
            <div class="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-500/30">
              <CarFront class="text-slate-900 w-6 h-6" />
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-white">탈래말래</h1>
          </div>
          <h2 class="text-2xl font-bold text-white">파트너님! 환영합니다</h2>
          <p class="text-slate-400 mt-2 text-sm">함께 탈 승객들이 기다리고 있어요.</p>
        </div>

        <!-- 폼 -->
        <form @submit.prevent="handleLogin" class="px-8 py-4 space-y-4">
          <!-- 이메일 -->
          <div class="space-y-1">
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="이메일 주소"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                :class="{ 'border-rose-500': loginInputError.email.errorMessage }"
                @blur="emailRules"
              />
            </div>
            <p v-if="loginInputError.email.errorMessage" class="text-xs text-rose-400 ml-1">
              {{ loginInputError.email.errorMessage }}
            </p>
          </div>

          <!-- 비밀번호 -->
          <div class="space-y-1">
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="비밀번호"
                class="w-full pl-12 pr-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                :class="{ 'border-rose-500': loginInputError.password.errorMessage }"
                @blur="passwordRules"
              />
            </div>
            <p v-if="loginInputError.password.errorMessage" class="text-xs text-rose-400 ml-1">
              {{ loginInputError.password.errorMessage }}
            </p>
            <div class="flex justify-end">
              <router-link
                to="/findpassword"
                class="text-xs text-slate-400 hover:text-violet-400 font-medium py-1 transition-colors"
              >
                비밀번호를 잊으셨나요?
              </router-link>
            </div>
          </div>

          <button
            type="submit"
            class="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all mt-2 active:scale-[0.98]"
          >
            로그인하기
          </button>

        </form>

        <!-- 푸터 -->
        <div class="p-6 text-center border-t border-slate-700">
          <p class="text-sm text-slate-400">
            아직 파트너가 아니신가요?

            <router-link to="/driversignup" class="text-violet-400 font-bold hover:underline ml-1">
              회원가입
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.driver-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>
