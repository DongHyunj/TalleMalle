<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Mail, MailCheck } from 'lucide-vue-next'
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
 * 3. STATE & REFS (상태 변수)
 * ==============================================================================
 */
const email = ref('')
const emailError = ref('')
const isModalOpen = ref(false)

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (UI 및 기능 로직)
 * ==============================================================================
 */
// 비밀번호 찾기 처리
const handleFindPassword = () => {
  emailError.value = ''

  if (!email.value) {
    emailError.value = '가입한 이메일을 입력해주세요.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = '유효한 이메일 형식이 아닙니다.'
    return
  }

  // 성공 모달 띄우기
  isModalOpen.value = true
}

// 고객센터 알림창
const showAlert = () => {
  window.alert('고객센터(02-1234-5678)로 문의해주세요.')
}
</script>

<template>
  <PasswordLayout
    title="비밀번호 찾기"
    description="가입하신 이메일 주소를 입력해 주시면
    비밀번호 재설정 링크를 보내드립니다."
    :show-back="true"
    :icon="Lock"
  >
    <form @submit.prevent="handleFindPassword" class="space-y-4">
      <AuthBaseInput
        v-model="email"
        label="이메일 주소"
        label-class="text-xs text-slate-400 uppercase"
        type="email"
        placeholder="example@email.com"
        :icon="Mail"
        :error="emailError"
      />

      <button
        type="submit"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
      >
        재설정 메일 보내기
      </button>
    </form>

    <template #footer>
      <p class="text-sm text-slate-500">
        이메일이 기억나지 않나요?
        <button @click="showAlert" class="text-indigo-600 font-bold hover:underline ml-1">
          고객센터 문의
        </button>
      </p>
    </template>
  </PasswordLayout>

  <PasswordModal
    :is-open="isModalOpen"
    title="메일 발송 완료!"
    button-text="로그인으로 돌아가기"
    :icon="MailCheck"
    @confirm="router.push('/login')"
  >
    <template #description>
      <span class="font-bold text-indigo-600">{{ email }}</span>으로<br />
      비밀번호 재설정 링크를 보냈습니다.<br />메일함을 확인해주세요.
    </template>
  </PasswordModal>
</template>