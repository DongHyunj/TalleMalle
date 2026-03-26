<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CarFront, Check, Smile, Smartphone } from 'lucide-vue-next'
import api from '@/api/user'

const router = useRouter()

const form = ref({
  nickname: '',
  phoneNumber: '',
  birth: '',
  gender: '',
})

// 닉네임 중복 확인 상태
const isNicknameChecked = ref(false)

/**
 * 1. 포맷팅 및 입력 로직
 */
const autoHyphen = () => {
  form.value.phoneNumber = form.value.phoneNumber
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
    .replace(/(\-{1,2})$/g, '')
}

const handleBirthInput = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  let result = ''
  if (val.length <= 4) result = val
  else if (val.length <= 6) result = val.slice(0, 4) + '-' + val.slice(4)
  else result = val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8)
  form.value.birth = result
}

/**
 * 2. 닉네임 중복 확인 로직
 */
const checkNickname = async () => {
  if (!form.value.nickname) {
    alert('닉네임을 입력해주세요.')
    return
  }

  try {
    // UserController의 nicknameCheck API 호출 (GET /user/signup/check-nickname)
    const available = await api.nicknameDoubleCheck(form.value.nickname)
    // console.log(available)
    if (available.data) {
      alert('사용 가능한 닉네임입니다.')
      isNicknameChecked.value = true
    } else {
      alert('이미 사용 중인 닉네임입니다.')
      isNicknameChecked.value = false
    }
  } catch (error) {
    alert('중복 확인 중 오류가 발생했습니다.')
  }
}

// 닉네임 변경 시 중복 확인 초기화
const onNicknameChange = () => {
  isNicknameChecked.value = false
}

/**
 * 3. 최종 제출
 */
const handleExtraSignup = async () => {
  if (!form.value.nickname || !form.value.birth || !form.value.gender || !form.value.phoneNumber) {
    alert('모든 필수 정보를 입력해주세요.')
    return
  }

  if (!isNicknameChecked.value) {
    alert('닉네임 중복 확인이 필요합니다.')
    return
  }

  try {
    const res = await api.extraSignup(form.value)
    alert('회원가입이 완료되었습니다!')
    // 성공 시 로그인 페이지로 이동 (쿠키 삭제는 서버 응답 전략에 따라 선택)
    document.cookie = 'ATOKEN=; max-age=0; path=/;'
    router.push('/login')
  } catch (error) {
    // console.error('업데이트 실패:', error)
    alert(error.response?.data?.message || '정보 업데이트에 실패했습니다.')
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 font-sans"
  >
    <div
      class="signup-card bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-white/50"
    >
      <div class="p-8 pb-0 flex flex-col items-center text-center">
        <div class="flex items-center gap-2 mb-6 cursor-default">
          <div class="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
            <CarFront class="text-white w-7 h-7" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-indigo-900">탈래말래</h1>
        </div>
        <h2 class="text-xl font-bold text-slate-800">추가 정보 입력</h2>
        <p class="text-slate-500 mt-2 text-sm">반가워요! 몇 가지 정보만 더 입력해주세요.</p>
      </div>

      <div class="p-8 space-y-5">
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-400 uppercase ml-1">닉네임</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="form.nickname"
                @input="onNicknameChange"
                type="text"
                placeholder="닉네임을 입력해주세요"
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Smile class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
            </div>
            <button
              type="button"
              @click="checkNickname"
              :class="isNicknameChecked ? 'bg-emerald-500' : 'bg-slate-800'"
              class="px-4 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors whitespace-nowrap min-w-[80px]"
            >
              {{ isNicknameChecked ? '확인됨' : '중복 확인' }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-400 uppercase ml-1">휴대폰 번호</label>
          <div class="relative">
            <input
              v-model="form.phoneNumber"
              @input="autoHyphen"
              type="tel"
              placeholder="010-0000-0000"
              maxlength="13"
              class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <Smartphone class="absolute right-4 top-3.5 w-5 h-5 text-slate-300" />
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
              class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 uppercase ml-1">성별</label>
            <div class="flex gap-1 h-[54px]">
              <button
                type="button"
                @click="form.gender = 'MALE'"
                :class="
                  form.gender === 'MALE' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                "
                class="flex-1 border border-slate-200 rounded-xl font-bold text-sm"
              >
                남
              </button>
              <button
                type="button"
                @click="form.gender = 'FEMALE'"
                :class="
                  form.gender === 'FEMALE'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-400'
                "
                class="flex-1 border border-slate-200 rounded-xl font-bold text-sm"
              >
                여
              </button>
            </div>
          </div>
        </div>

        <button
          @click="handleExtraSignup"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
        >
          <span>가입 완료하기</span>
          <Check class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
