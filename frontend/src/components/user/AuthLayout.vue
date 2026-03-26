<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { CarFront } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props)
 * ==============================================================================
 */
defineProps({
  // 푸터 배경색을 없애고 싶을 때 true로 전달
  noFooterBackground: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="p-8 pb-4 flex flex-col items-center text-center">
        <div class="flex items-center gap-2 mb-6">
          <div class="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 logo-bounce">
            <CarFront class="text-white w-6 h-6" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-indigo-900">탈래말래</h1>
        </div>
        <slot name="header"></slot>
      </div>

      <slot></slot>

      <div 
        class="p-6 text-center"
        :class="[
          noFooterBackground 
            ? 'bg-transparent border-none' 
            : 'bg-slate-50 border-t border-slate-100'
        ]"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  font-family: 'Pretendard', sans-serif;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(30, 27, 75, 0.1);
  width: 100%;
  max-width: 448px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.logo-bounce:hover {
  transform: translateY(-3px) rotate(5deg);
  transition: transform 0.3s ease;
}
</style>