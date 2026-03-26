<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { CheckCircle2 } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */

const props = defineProps({
  billing: {
    type: Object,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['modal'])

/**
 * ==============================================================================
 * 3. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 카드 클릭 핸들러 (모달 오픈)
const handleClick = () => {
  emits('modal', 'manage-payment')
}
</script>

<template>
  <div
    class="flex items-center justify-between p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all group"
    @click="handleClick"
  >
    <div class="flex items-center gap-4">
      <div class="text-left">
        <p class="text-xs font-bold">
          {{ billing.alias }}
        </p>
        <p class="text-[10px] text-slate-400">
          {{ isDefault ? '기본 결제 수단' : '결제 수단' }}
        </p>
      </div>
    </div>
    <CheckCircle2 v-if="isDefault" class="w-5 h-5 text-indigo-400 flex-none" />
  </div>
</template>

<style scoped></style>
