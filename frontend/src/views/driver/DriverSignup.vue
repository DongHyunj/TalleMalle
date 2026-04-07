<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */

import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CarFront,
  User,
  ArrowRight,
  Lock,
  CheckCircle2,
  Check,
  ShieldCheck,
  Smartphone,
  Send,
} from 'lucide-vue-next'
import api from '@/api/driver'
import * as PortOne from '@portone/browser-sdk/v2'

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
  identityVerificationId: '',
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  termCheck: false,
  isStudent: false,
})

// 인증 관련 상태
const verification = ref({
  isIdentityVerified: false, // 본인 인증 성공 여부
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
  nickname: '',
  password: '',
  passwordMatch: false,
})

const authCodeInput = ref('')

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return ''
  return phoneNumber
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3')
}

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
      verification.value.isIdentityVerified = true
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
const goToStep2 = async () => {
  if (!form.value.name || !form.value.phoneNumber || !form.value.birth || !form.value.gender) {
    alert('모든 정보를 입력해주세요.')
    return
  }
  if (form.value.birth.length < 10) {
    alert('생년월일을 올바르게 입력해주세요.')
    return
  }
  if (!form.value.identityVerificationId) {
    alert('휴대폰 본인 인증을 먼저 진행해주세요.')
    return
  }
  if (!verification.value.isIdentityVerified) {
    alert('본인 인증을 완료해주세요.')
    return
  }
  step.value = 2
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // HTTP(non-secure context) 환경 폴리필
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const verifyIdentity = async () => {
  try {
    const identityVerificationId = `identity-verification-${generateUUID()}`
    const portoneResponse = await PortOne.requestIdentityVerification({
      storeId: import.meta.env.VITE_PORTONE_STORE_ID,
      channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
      identityVerificationId,
    })
    if (portoneResponse.code != null) {
      alert(`인증 실패: ${portoneResponse.message}`)
      return
    }

    const response = await api.verifyIdentity(identityVerificationId)
    const userInfo = response.data?.userInfo
    if (!userInfo) {
      alert('본인 인증 정보가 올바르지 않습니다.')
      return
    }

    form.value.identityVerificationId = identityVerificationId
    form.value.name = userInfo.name ?? form.value.name
    form.value.birth = userInfo.birthDate ?? userInfo.birth ?? form.value.birth
    form.value.gender =
      userInfo.gender === 'MALE' ? 'male' : userInfo.gender === 'FEMALE' ? 'female' : form.value.gender
    form.value.phoneNumber = formatPhoneNumber(
      userInfo.phoneNumber ?? userInfo.phone_number ?? userInfo.phone ?? form.value.phoneNumber
    )

    verification.value.isIdentityVerified = true
    alert('본인 인증이 완료되었습니다. 인증 정보를 확인해주세요.')
  } catch (error) {
    verification.value.isIdentityVerified = false
    const message = error.response?.data?.message || '본인 인증에 실패했습니다.'
    alert(message)
  }
}

const checkEmailAvailability = async () => {
  if (!form.value.email) return
  try {
    const res = await api.checkEmail(form.value.email)
    if (!res.data) {
      alert('이미 사용 중인 이메일입니다.')
    }
  } catch (error) {
    const message = error.response?.data?.message || '이메일 중복 확인에 실패했습니다.'
    alert(message)
  }
}

const checkNicknameAvailability = async () => {
  if (!form.value.nickname) return
  try {
    const res = await api.checkNickname(form.value.nickname)
    if (!res.data) {
      errors.value.nickname = '이미 사용 중인 닉네임입니다.'
      return
    }
    errors.value.nickname = ''
  } catch (error) {
    errors.value.nickname = ''
    const message = error.response?.data?.message || '닉네임 중복 확인에 실패했습니다.'
    alert(message)
  }
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
    const payload = {
      name: form.value.name,
      phoneNumber: form.value.phoneNumber,
      birth: form.value.birth,
      gender: form.value.gender,
      identityVerificationId: form.value.identityVerificationId,
      email: form.value.email,
      password: form.value.password,
      nickname: form.value.nickname,
    }
    const res = await api.signup(payload)

    // 성공 시 처리 (HTTP 200, 201 등 2xx 응답)
    // console.log('Signup Response:', res)
    alert('회원가입이 완료되었습니다. 로그인해주세요.')
    router.push('/driverlogin')

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
    class="min-h-screen flex flex-col items-center justify-center driver-signup-bg p-4 font-sans"
  >
    <div class="w-full max-w-lg">
      <!-- 드라이버 전용 뱃지 -->
      <div class="flex justify-center mb-5">
        <span
          class="bg-violet-500/20 text-violet-400 text-xs font-bold px-4 py-1.5 rounded-full border border-violet-500/30 uppercase tracking-widest"
        >
          드라이버 전용
        </span>
      </div>

    <div
      class="signup-card bg-slate-800 w-full rounded-3xl shadow-2xl shadow-black/60 overflow-hidden relative border border-slate-700/60"
    >
      <div class="p-8 pb-0 flex flex-col items-center text-center">
        <div class="flex items-center gap-2 mb-6 cursor-default">
          <div class="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-500/30">
            <CarFront class="text-white w-7 h-7" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-white">탈래말래</h1>
        </div>
        <h2 class="text-xl font-bold text-white">
          {{ step === 1 ? '본인 확인' : '계정 정보 설정' }}
        </h2>
        <p class="text-slate-400 mt-2 text-sm">
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
            <button
              type="button"
              @click="verifyIdentity"
              class="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShieldCheck class="w-5 h-5" />
              <span>{{ verification.isIdentityVerified ? '본인인증 완료' : '휴대폰 본인인증 시작' }}</span>
              <Smartphone class="w-5 h-5" />
            </button>
            <p v-if="verification.isIdentityVerified" class="text-xs text-emerald-400 ml-1 font-medium">
              본인인증 완료 (ID: {{ form.identityVerificationId }})
            </p>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">이름</label>
            <div class="relative">
              <input
                v-model="form.name"
                type="text"
                placeholder="실명을 입력해주세요"
                class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
              <User class="absolute right-4 top-3.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">휴대폰 번호</label>
            <input
              v-model="form.phoneNumber"
              @input="autoHyphen"
              type="tel"
              placeholder="010-0000-0000"
              maxlength="13"
              class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
            />
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
                class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-center placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 uppercase ml-1">성별</label>
              <div class="flex gap-1 h-[54px]">
                <button
                  type="button"
                  @click="form.gender = 'male'"
                  :class="
                    form.gender === 'male'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  "
                  class="flex-1 border rounded-xl font-bold transition-all text-sm"
                >
                  남
                </button>
                <button
                  type="button"
                  @click="form.gender = 'female'"
                  :class="
                    form.gender === 'female'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
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
            class="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
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
                @blur="checkEmailAvailability"
                class="flex-1 px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                @click="requestAuth('email')"
                :disabled="verification.isEmailVerified"
                class="px-4 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-500 transition-colors whitespace-nowrap min-w-[80px] disabled:bg-emerald-500 disabled:text-white disabled:cursor-default"
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
                class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                :class="{ 'border-rose-500': errors.password }"
              />
              <Lock class="absolute right-4 top-3.5 w-5 h-5 text-slate-500" />
            </div>
            <p v-if="errors.password" class="text-xs text-rose-400 ml-1">{{ errors.password }}</p>
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
                class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                :class="{ 'border-rose-500': errors.passwordMatch }"
              />
              <CheckCircle2 class="absolute right-4 top-3.5 w-5 h-5 text-slate-500" />
            </div>
            <p v-if="errors.passwordMatch" class="text-xs text-rose-400 ml-1">
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
                @blur="checkNicknameAvailability"
                class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
              <CheckCircle2 class="absolute right-4 top-3.5 w-5 h-5 text-slate-500" />
            </div>
            <p v-if="errors.nickname" class="text-xs text-rose-400 ml-1">{{ errors.nickname }}</p>
          </div>

          <div class="pt-2 space-y-3 border-t border-slate-700 mt-2 mb-6">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                v-model="form.termCheck"
                type="checkbox"
                class="w-5 h-5 rounded border-slate-600 text-violet-500 focus:ring-violet-500 cursor-pointer accent-violet-500"
              />
              <span class="text-sm text-slate-400 group-hover:text-slate-200 transition-colors"
                >이용약관 및 개인정보 처리방침 동의 (필수)</span
              >
            </label>
          </div>

          <div class="flex gap-3">
            <button
              @click="step = 1"
              class="px-5 py-4 rounded-xl border border-slate-600 text-slate-400 font-bold hover:bg-slate-700 transition-colors"
            >
              이전
            </button>
            <button
              @click="handleSignup"
              class="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>가입 완료</span>
              <Check class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 text-center border-t border-slate-700">
        <p class="text-sm text-slate-400">
          이미 계정이 있으신가요?
          <router-link to="/driverlogin" class="text-violet-400 font-bold hover:underline"
            >로그인</router-link
          >
        </p>
      </div>
    </div>
    </div>

    <div
      v-if="verification.isTimerRunning"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center">
        <div
          class="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Send class="w-6 h-6 text-violet-400" />
        </div>
        <h3 class="text-lg font-bold text-white">인증번호 발송 완료</h3>
        <p class="text-sm text-slate-400 mt-1">입력하신 정보로 인증번호가 전송되었습니다.</p>
        <div class="mt-6 mb-2">
          <input
            v-model="authCodeInput"
            type="text"
            placeholder="인증번호 6자리를 입력해주세요"
            maxlength="4"
            class="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-center font-bold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-500"
          />
        </div>
        <div class="text-sm font-bold text-rose-400 mb-6">{{ formattedTimer }}</div>
        <div class="flex gap-3">
          <button
            @click="verification.isTimerRunning = false"
            class="flex-1 py-3.5 rounded-xl border border-slate-600 text-slate-400 font-bold hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            @click="confirmAuth(authCodeInput)"
            class="flex-1 py-3.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500 shadow-lg transition-colors"
          >
            인증하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.driver-signup-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>
