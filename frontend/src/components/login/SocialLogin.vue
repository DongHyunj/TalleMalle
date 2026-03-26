<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { MessageCircle } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. METHODS - FUNCTIONAL (백엔드 OAuth2 입구로 연결)
 * ==============================================================================
 */
const backendUrl = import.meta.env.VITE_API_BASE_URL

// 카카오 로그인 실행
const loginWithKakao = () => {
  // 백엔드의 OAuth2 입구로 브라우저를 이동시킵니다.
  // 이 주소로 접속해야 Spring Security가 가로채서 카카오 로그인 페이지를 띄워줍니다.
  window.location.href = `${backendUrl}/oauth2/authorization/kakao`
}

// 구글 로그인 실행
const loginWithGoogle = () => {
  window.location.href = `${backendUrl}/oauth2/authorization/google`
}
</script>

<template>
  <div class="mt-8 space-y-4">
    <div class="relative flex justify-center text-xs uppercase">
      <span class="bg-white px-3 text-slate-400 font-medium relative z-10">또는 간편 로그인</span>
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-100"></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        @click="loginWithGoogle"
        class="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
      >
        <img
          src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
          class="w-4 h-4"
          alt="Google"
        />
        <span class="text-sm font-semibold text-slate-600">Google</span>
      </button>

      <button
        type="button"
        @click="loginWithKakao"
        class="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-[#FEE500] hover:border-[#FEE500] transition-all active:scale-95 group"
      >
        <MessageCircle class="w-4 h-4 text-[#3C1E1E] fill-current" />
        <span class="text-sm font-semibold text-slate-600 group-hover:text-[#3C1E1E]">Kakao</span>
      </button>
    </div>
  </div>
</template>