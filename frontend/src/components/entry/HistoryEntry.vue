<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MapPin, ArrowRight, CheckCircle2, Clock } from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const props = defineProps({
  start: String,
  dest: String,
  departure: String, // ISO 8601 문자열 (예: "2026-01-08T18:30:00")
  arrival: String,
  cost: String,
  people: Number,
  isDone: Boolean,
})

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언) - [변수]
 * ==============================================================================
 */
// 실시간 계산을 위한 현재 시각 상태
const now = ref(new Date())
let timer = null

/**
 * ==============================================================================
 * 4. COMPUTED (계산된 속성)
 * ==============================================================================
 */
const timeLabel = computed(() => {
  if (!props.departure) return ''

  const departureDate = new Date(props.departure)
  const diffInMs = now.value - departureDate
  const diffInSeconds = Math.floor(diffInMs / 1000)

  // --- 1. 미래 시점 (예약/운행 예정) ---
  if (diffInSeconds < 0) {
    const absSeconds = Math.abs(diffInSeconds)
    const diffInDays = Math.floor(absSeconds / (60 * 60 * 24))
    if (diffInDays === 0) return '오늘 예정'
    if (diffInDays === 1) return '내일 예정'
    return `${diffInDays}일 후`
  }

  // --- 2. 과거 시점 (상대 시간) ---
  const totalMonths =
    (now.value.getFullYear() - departureDate.getFullYear()) * 12 +
    (now.value.getMonth() - departureDate.getMonth())

  let adjustedMonths = totalMonths
  if (now.value.getDate() < departureDate.getDate()) {
    adjustedMonths--
  }

  if (adjustedMonths >= 12) {
    const years = Math.floor(adjustedMonths / 12)
    return `${years}년 전`
  }

  if (adjustedMonths >= 1) {
    return `${adjustedMonths}개월 전`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays >= 1) return `${diffInDays}일 전`
  if (diffInHours >= 1) return `${diffInHours}시간 전`
  if (diffInMinutes >= 1) return `${diffInMinutes}분 전`

  return '방금 전'
})

/**
 * ==============================================================================
 * 7. LIFECYCLE (생명주기 훅) - [마운트 관련]
 * ==============================================================================
 */
onMounted(() => {
  // 1분마다 현재 시각을 갱신
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="flex items-center justify-between p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all group overflow-hidden relative"
  >
    <!-- 배경 장식 아이콘 -->
    <MapPin class="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />

    <div class="flex items-center gap-4 relative z-10 w-full">
      <!-- 상태 아이콘 -->
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all bg-white/10 group-hover:bg-indigo-500/20"
      >
        <MapPin class="w-5 h-5 text-indigo-400" />
      </div>

      <!-- 텍스트 정보 -->
      <div class="flex-1 min-w-0 text-left">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-bold truncate">
            {{ start }} → {{ dest }}
          </p>
          <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Clock class="w-3 h-3" /> {{ timeLabel }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <p class="text-[10px] text-slate-400 font-medium">
            {{ cost }} 결제 · {{ people }}명 동승
          </p>
          <div class="flex items-center gap-1">
            <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
            <p
              class="text-[10px] font-bold"
              :class="isDone ? 'text-indigo-400' : 'text-emerald-400'"
            >
              {{ isDone ? '정산 완료' : '결제 완료' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 화살표 -->
      <div class="ml-2 bg-white/5 p-2 rounded-xl group-hover:bg-indigo-500/30 transition-all">
        <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
