<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, RefreshCcw, Home, Car } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
const router = useRouter()

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
const hasError = ref(false)
const errorMessage = ref('')
const showErrorDetails = ref(false) // 에러 상세 내용을 접었다 폈다 할 변수

/**
 * ==============================================================================
 * 4. METHODS - UI & LOGIC
 * ==============================================================================
 */
// 에러 초기화 및 새로고침 핸들러
const handleResetError = () => {
    hasError.value = false
    errorMessage.value = ''
    showErrorDetails.value = false
    window.location.reload()
}

// 홈으로 이동 핸들러
const handleGoHome = () => {
    // 에러 상태를 끄고 홈으로 이동
    hasError.value = false
    errorMessage.value = ''
    window.location.href = '/' // 가장 확실하게 초기화하며 이동
}

// 상세 내용 토글 핸들러
const handleToggleDetails = () => {
    showErrorDetails.value = !showErrorDetails.value
}

/**
 * ==============================================================================
 * 5. LIFECYCLE
 * ==============================================================================
 */
// 자식 컴포넌트에서 에러가 발생하면 이 함수가 실행됨
onErrorCaptured((err, instance, info) => {
    // console.log('에러 캐치:', err)
    hasError.value = true
    errorMessage.value = err.message || '알 수 없는 오류가 발생했습니다.'
    return false // 에러 전파 중단
})
</script>

<template>
    <div v-if="hasError" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 px-4">

        <div class="max-w-md w-full text-center space-y-6">

            <div class="relative w-32 h-32 mx-auto">
                <div class="absolute inset-0 bg-indigo-100 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <Car class="w-16 h-16 text-indigo-500" />
                </div>
                <div class="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full border-4 border-slate-50">
                    <AlertTriangle class="w-6 h-6" />
                </div>
            </div>

            <div class="space-y-2">
                <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">
                    앗! 길을 잃었어요
                </h1>
                <p class="text-slate-500 text-lg">
                    서비스 이용 중 예기치 않은 문제가 발생했습니다.<br>
                    잠시 후 다시 시도해 주세요.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button @click="handleResetError"
                    class="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                    <RefreshCcw class="w-5 h-5" />
                    다시 시도하기
                </button>

                <button @click="handleGoHome"
                    class="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
                    <Home class="w-5 h-5" />
                    홈으로 가기
                </button>
            </div>

            <div class="pt-8">
                <button @click="handleToggleDetails"
                    class="text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4">
                    {{ showErrorDetails ? '에러 내용 숨기기' : '상세 에러 내용 보기' }}
                </button>

                <div v-if="showErrorDetails"
                    class="mt-4 p-4 bg-slate-100 rounded-lg text-left border border-slate-200 overflow-hidden">
                    <p class="font-mono text-xs text-red-500 break-all">
                        {{ errorMessage }}
                    </p>
                </div>
            </div>

        </div>
    </div>

    <slot v-else></slot>
</template>