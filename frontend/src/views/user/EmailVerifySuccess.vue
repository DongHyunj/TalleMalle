<script setup>
import { useRouter } from 'vue-router'
import { CheckCircle2, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const goToLogin = () => router.push('/login')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100"
    >
      <div
        class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 class="w-10 h-10 text-emerald-600" />
      </div>

      <h1 class="text-2xl font-bold text-slate-900 mb-2">인증이 완료되었습니다!</h1>
      <p class="text-slate-500 mb-8">
        이제 모든 서비스를 정상적으로 이용하실 수 있습니다.<br />
        로그인 후 탈래말래를 시작해보세요.
      </p>

      <button
        @click="goToLogin"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
      >
        로그인하러 가기
        <ArrowRight class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>