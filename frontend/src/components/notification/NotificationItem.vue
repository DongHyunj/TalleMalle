<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { computed } from 'vue'
import { Bell, UserPlus, Gift, CreditCard } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (Props & Emits)
 * ==============================================================================
 */
const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['read'])

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
/**
 * ==============================================================================
 * 3. STATE & REFS (Computed)
 * ==============================================================================
 */
// 아이콘 및 스타일 매핑
const styleConfig = computed(() => {
  // DB에서 온 값이 없을 경우를 대비한 방어 로직 및 소문자 변환
  const type = props.item.type ? props.item.type.toLowerCase() : ''

  switch (type) {
    case 'matching':
      return {
        icon: UserPlus,
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        label: 'text-indigo-500',
      }
    case 'event':
      return { icon: Gift, bg: 'bg-pink-50', text: 'text-pink-600', label: 'text-pink-500' }
    case 'payment':
      return {
        icon: CreditCard,
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        label: 'text-amber-500',
      }
    default:
      return { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-500', label: 'text-slate-500' }
  }
})
</script>

<template>
  <div
    @click="emit('read', item.idx ?? item.id)"
    class="notification-item relative bg-white p-6 pl-10 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer group"
    :class="{ read: item.isRead }"
  >
    <div v-if="!item.isRead" class="unread-dot"></div>

    <div class="flex items-start gap-4">
      <div
        class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        :class="[styleConfig.bg, styleConfig.text]"
      >
        <component :is="styleConfig.icon" class="w-5 h-5" />
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-tight" :class="styleConfig.label">
              {{ item.categoryLabel || item.type }}
            </span>
            <h3 class="font-bold text-slate-800 mt-0.5 text-[15px]">{{ item.title }}</h3>
          </div>
          <span class="text-[11px] text-slate-300 whitespace-nowrap ml-2">{{
            formatTime(item.created_at)
          }}</span>
        </div>
        <p class="text-sm text-slate-500 mt-1 leading-relaxed">{{ item.contents }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-item:not(.read):hover {
  background-color: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.notification-item.read {
  opacity: 0.6;
  background-color: #ffffff;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #4f46e5;
  border-radius: 50%;
  position: absolute;
  top: 28px;
  left: 12px;
  z-index: 10;
}
</style>