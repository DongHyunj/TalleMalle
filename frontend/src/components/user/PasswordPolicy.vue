<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { Info } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
    <h4 class="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1">
      <Info class="w-3 h-3" /> 비밀번호 설정 규칙
    </h4>

    <ul class="text-xs text-slate-500 space-y-1 list-disc list-inside ml-1">
      <li>영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.</li>
      <li>연속적인 숫자나 생년월일 등 쉬운 비밀번호는 피해주세요.</li>
    </ul>
  </div>
</template>