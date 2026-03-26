<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Mail } from 'lucide-vue-next'
import api from '@/api/user' // API 모듈 임포트

const route = useRoute()
const isSending = ref(false)

// 가입 시 넘겨받은 이메일 주소
const userEmail = computed(() => route.query.email || '사용자님의 이메일')

// 재전송 핸들러
const handleResend = async () => {
  if (isSending.value) return

  isSending.value = true
  try {
    await api.resendVerify(userEmail.value)
    alert('인증 메일이 재전송되었습니다. 메일함을 확인해주세요.')
  } catch (error) {
    // console.error('재전송 실패:', error)
    alert('메일 재발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100"
    >
      <div
        class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Mail class="w-10 h-10 text-indigo-600" />
      </div>

      <h1 class="text-2xl font-bold text-slate-900 mb-2">이메일 인증이 필요합니다</h1>
      <p class="text-slate-500 mb-10">
        회원가입을 완료하려면 아래 이메일로 발송된<br />
        인증 링크를 클릭해주세요.
      </p>

      <div class="bg-indigo-50 p-4 rounded-2xl mb-2">
        <span class="text-indigo-900 font-bold break-all">{{ userEmail }}</span>
      </div>

      <div class="pt-6 border-t border-slate-50">
        <p class="text-xs text-slate-400">
          메일을 받지 못하셨나요? 스팸 메일함을 확인하거나<br />
          <button
            @click="handleResend"
            :disabled="isSending"
            class="text-indigo-600 font-bold hover:underline disabled:text-slate-300"
          >
            {{ isSending ? '발송 중...' : '인증 메일 재전송' }}</button
          >을 눌러주세요.
        </p>
      </div>
    </div>
  </div>
</template>