<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { computed } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Eye } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props 정의)
 * ==============================================================================
 */
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

/**
 * ==============================================================================
 * 3. METHODS - FUNCTIONAL
 * ==============================================================================
 */

// 날짜 포맷팅
dayjs.extend(utc)
dayjs.extend(timezone)

const formatDate = (date) => {
  return dayjs(date).tz('Asia/Seoul').format('YYYY.MM.DD')
}

// 태그별 스타일 및 텍스트 매핑 객체
const tagMap = {
  NOTICE: { label: '공지', class: 'bg-yellow-50 text-yellow-600 border border-yellow-100' },
  UPDATE: { label: '업데이트', class: 'bg-blue-50 text-blue-600 border border-blue-100' },
  EVENT: { label: '이벤트', class: 'bg-purple-50 text-purple-600 border border-purple-100' },
  SYSTEM: { label: '시스템', class: 'bg-orange-50 text-orange-600 border border-orange-100' },
  EMERGENCY: { label: '긴급', class: 'bg-red-50 text-red-600 border border-red-100' },
}

const getTagInfo = computed(() => {
  return tagMap[props.item.tag] || { label: props.item.tag || '공지', class: 'bg-indigo-50 text-indigo-600 border border-indigo-100' }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'noticedetail', params: { idx: item.idx } }"
    custom
    v-slot="{ navigate }"
  >
    <div
      @click="navigate"
      class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group"
    >
      <div class="flex justify-between items-center mb-5">
        <div class="flex gap-2">
          <span
            :class="[
              getTagInfo.class,
              'text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm',
            ]"
          >
            {{ getTagInfo.label }}
          </span>

          <span
            v-if="item.isPinned"
            class="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider"
          >
            필독
          </span>
        </div>
        <span class="text-[11px] font-medium text-slate-400">{{ formatDate(item.createdAt) }}</span>
      </div>

      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {{ item.title }}
        </h3>

        <span class="flex items-center gap-1.5 text-slate-400 text-[11px]"
          ><Eye class="w-3 h-3" />조회수 {{ item.views?.toLocaleString() || 0 }}</span
        >
      </div>
    </div>
  </RouterLink>
</template>