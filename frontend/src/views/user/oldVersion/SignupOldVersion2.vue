<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */

import { ref, computed, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  CarFront,
  User,
  ArrowRight,
  Lock,
  CheckCircle2,
  Check,
  Info,
  Send,
  AlertCircle,
} from 'lucide-vue-next'
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
// 현재 회원가입 진행 단계 (1: 본인인증 및 실명확인, 2: 계정 정보 설정)
const step = ref(1)

// 회원가입 폼 데이터
const form = ref({
  name: '',
  phoneNumber: '',
  birth: '',
  gender: '',
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  termCheck: false,
  isStudent: false,
})

// 인증 관련 상태
const verification = ref({
  isPhoneVerified: false, // 휴대폰 인증 성공 여부

  isEmailVerified: false, // 이메일 인증 성공 여부
  phoneCode: '',
  emailCode: '',
  timer: 180,
  timerInterval: null,
  isTimerRunning: false,
  currentType: '',
})

// 에러 메세지 관련
const errors = ref({
  phoneNumber: '',
  email: '',
  password: '',
  passwordMatch: false,
})

const authCodeInput = ref('')

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (기능 및 UI 로직)
 * ==============================================================================
 */

// 전화번호 자동 하이픈
const autoHyphen = () => {
  form.value.phoneNumber = form.value.phoneNumber
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
    .replace(/(\-{1,2})$/g, '')
}

// 생년월일 자동 마침표 (.) 포맷팅
const handleBirthInput = (e) => {
  let val = e.target.value.replace(/\D/g, '') // 숫자만 남김
  let result = ''

  if (val.length <= 4) {
    result = val
  } else if (val.length <= 6) {
    result = val.slice(0, 4) + '-' + val.slice(4)
  } else {
    result = val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8)
  }
  form.value.birth = result
}

// 인증번호 요청
const requestAuth = (type) => {
  verification.value.currentType = type

  if (type === 'phoneNumber' && form.value.phoneNumber.length < 12) {
    alert('휴대폰 번호를 올바르게 입력해주세요.')
    return
  }
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      alert('올바른 이메일 형식이 아닙니다.')
      return
    }
  }

  verification.value.isTimerRunning = true
  verification.value.timer = 180
  if (verification.value.timerInterval) clearInterval(verification.value.timerInterval)

  verification.value.timerInterval = setInterval(() => {
    verification.value.timer--
    if (verification.value.timer <= 0) {
      clearInterval(verification.value.timerInterval)
      verification.value.isTimerRunning = false
      alert('인증 시간이 만료되었습니다.')
    }
  }, 1000)
}

const formattedTimer = computed(() => {
  const m = Math.floor(verification.value.timer / 60)
    .toString()
    .padStart(2, '0')
  const s = (verification.value.timer % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const confirmAuth = (inputCode) => {
  if (inputCode === '1234') {
    clearInterval(verification.value.timerInterval)
    verification.value.isTimerRunning = false

    if (verification.value.currentType === 'phoneNumber') {
      verification.value.isPhoneVerified = true
    } else {
      verification.value.isEmailVerified = true
    }
    alert('인증되었습니다.')
    authCodeInput.value = ''
  } else {
    alert('인증번호가 일치하지 않습니다. (테스트: 1234)')
  }
}

// 단계 이동 (유효성 검증 수정)
const goToStep2 = () => {
  if (!form.value.name || !form.value.phoneNumber || !form.value.birth || !form.value.gender) {
    alert('모든 정보를 입력해주세요.')
    return
  }
  if (form.value.birth.length < 10) {
    alert('생년월일을 올바르게 입력해주세요.')
    return
  }
  if (!verification.value.isPhoneVerified) {
    alert('휴대폰 인증을 완료해주세요.')
    return
  }
  step.value = 2
}

/**
 * ==============================================================================
 * 5. METHODS - API & NETWORK (서버 연동)
 * ==============================================================================
 */
// --- 회원가입 처리 ---
const handleSignup = async () => {
  if (!verification.value.isEmailVerified) {
    alert('이메일 인증을 완료해주세요.')
    return
  }
  if (form.value.password.length < 8) {
    errors.value.password = '비밀번호는 8자 이상이어야 합니다.'
    return
  }
  if (form.value.password !== form.value.passwordConfirm) {
    errors.value.passwordMatch = true
    return
  }
  if (!form.value.termCheck) {
    alert('약관에 동의해주세요.')
    return
  }

  try {
    const res = await api.signup(form.value)

    // 성공 시 처리 (HTTP 200, 201 등 2xx 응답)
    // console.log('Signup Response:', res)
    alert('회원가입이 완료되었습니다. 로그인해주세요.')
    router.push('/login')

    // console.log('가입 데이터:', res.data)
  } catch (error) {
    // API 서버에서 오는 400, 500번대 에러는 모두 이쪽으로 들어옵니다.
    // console.error('회원가입 실패:', error)
    const message = error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
    alert(message)
  }

  // alert('회원가입이 완료되었습니다!')
  // router.push('/login')
}

onUnmounted(() => {
  if (verification.value.timerInterval) clearInterval(verification.value.timerInterval)
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 font-sans"
  >
    <div
      class="signup-card bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden relative border border-white/50"
    >
      <div class="p-8 pb-0 flex flex-col items-center text-center">
        <div class="flex items-center gap-2 mb-6 cursor-default">
          <div class="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <CarFront class="text-white w-7 h-7" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-indigo-900">탈래말래</h1>
        </div>
        <h2 class="text-xl font-bold text-slate-800">
          {{ step === 1 ? '본인 확인' : '계정 정보 설정' }}
        </h2>
        <p class="text-slate-500 mt-2 text-sm">
          {{
            step === 1
              ? '안전한 서비스 이용을 위해 실명을 인증해주세요.'
              : '로그인에 사용할 정보를 입력해주세요.'
          }}
        </p>
      </div>

      <div class="p-8 space-y-5">
        <div v-if="step === 1" class="space-y-5">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">이름</label>
            <div class="relative">
              <input
                v-model="form.name"
                type="text"
                placeholder="실명을 입력해주세요"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <User class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">휴대폰 번호</label>
            <div class="flex gap-2">
              <input
                v-model="form.phoneNumber"
                @input="autoHyphen"
                type="tel"
                placeholder="010-0000-0000"
                maxlength="13"
                :disabled="verification.isPhoneVerified"
                class="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100"
              />
              <button
                type="button"
                @click="requestAuth('phoneNumber')"
                :disabled="verification.isPhoneVerified"
                class="px-4 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap min-w-[80px] disabled:bg-emerald-500 disabled:cursor-default"
              >
                {{ verification.isPhoneVerified ? '인증 완료' : '인증번호' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 uppercase ml-1">생년월일</label>
              <input
                v-model="form.birth"
                @input="handleBirthInput"
                type="text"
                placeholder="YYYY-MM-DD"
                maxlength="10"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 uppercase ml-1">성별</label>
              <div class="flex gap-1 h-[54px]">
                <button
                  type="button"
                  @click="form.gender = 'MALE'"
                  :class="
                    form.gender === 'MALE'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  "
                  class="flex-1 border rounded-xl font-bold transition-all text-sm"
                >
                  남
                </button>
                <button
                  type="button"
                  @click="form.gender = 'FEMALE'"
                  :class="
                    form.gender === 'FEMALE'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  "
                  class="flex-1 border rounded-xl font-bold transition-all text-sm"
                >
                  여
                </button>
              </div>
            </div>
          </div>

          <button
            @click="goToStep2"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <span>다음 단계로</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>

        <div v-if="step === 2" class="space-y-5">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">이메일 계정</label>
            <div class="flex gap-2">
              <input
                v-model="form.email"
                type="email"
                placeholder="example@tallemalle.com"
                :disabled="verification.isEmailVerified"
                class="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100"
              />
              <button
                type="button"
                @click="requestAuth('email')"
                :disabled="verification.isEmailVerified"
                class="px-4 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap min-w-[80px] disabled:bg-emerald-500 disabled:cursor-default"
              >
                {{ verification.isEmailVerified ? '인증 완료' : '인증번호' }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">비밀번호</label>
            <div class="relative">
              <input
                v-model="form.password"
                type="password"
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                :class="{ 'border-rose-500 bg-rose-50': errors.password }"
              />
              <Lock class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
            </div>
            <p v-if="errors.password" class="text-xs text-rose-500 ml-1">{{ errors.password }}</p>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1"
              >비밀번호 확인</label
            >
            <div class="relative">
              <input
                v-model="form.passwordConfirm"
                type="password"
                placeholder="비밀번호를 한 번 더 입력해주세요"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                :class="{ 'border-rose-500 bg-rose-50': errors.passwordMatch }"
              />
              <CheckCircle2 class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
            </div>
            <p v-if="errors.passwordMatch" class="text-xs text-rose-500 ml-1">
              비밀번호가 일치하지 않습니다.
            </p>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">닉네임</label>
            <div class="relative">
              <input
                v-model="form.nickname"
                type=""
                placeholder="사용할 닉네임을 입력해주세요"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                :class="{ 'border-rose-500 bg-rose-50': errors.passwordMatch }"
              />
              <CheckCircle2 class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
            </div>
          </div>

          <div class="pt-2 space-y-3 border-t border-slate-50 mt-2 mb-6">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                v-model="form.termCheck"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span class="text-sm text-slate-600 group-hover:text-slate-900 transition-colors"
                >이용약관 및 개인정보 처리방침 동의 (필수)</span
              >
            </label>
          </div>

          <div class="flex gap-3">
            <button
              @click="step = 1"
              class="px-5 py-4 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
            >
              이전
            </button>
            <button
              @click="handleSignup"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>가입 완료</span>
              <Check class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 bg-slate-50 text-center border-t border-slate-100">
        <p class="text-sm text-slate-500">
          이미 계정이 있으신가요?
          <router-link to="/login" class="text-indigo-600 font-bold hover:underline"
            >로그인</router-link
          >
        </p>
      </div>
    </div>

    <div
      v-if="verification.isTimerRunning"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center">
        <div
          class="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Send class="w-6 h-6 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">인증번호 발송 완료</h3>
        <p class="text-sm text-slate-500 mt-1">입력하신 정보로 인증번호가 전송되었습니다.</p>
        <div class="mt-6 mb-2">
          <input
            v-model="authCodeInput"
            type="text"
            placeholder="인증번호 6자리를 입력해주세요"
            maxlength="4"
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="text-sm font-bold text-rose-500 mb-6">{{ formattedTimer }}</div>
        <div class="flex gap-3">
          <button
            @click="verification.isTimerRunning = false"
            class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50"
          >
            취소
          </button>
          <button
            @click="confirmAuth(authCodeInput)"
            class="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg"
          >
            인증하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>