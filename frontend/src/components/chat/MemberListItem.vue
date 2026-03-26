<script setup>
/**
 * ==============================================================================
 * 1. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
defineProps({
  img: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subText: {
    type: String,
    default: '',
  },
  clickable: {
    type: Boolean,
    default: true,
  },
  isMe: {
    type: Boolean,
    default: false,
  },
})

// Emits 정의
const emit = defineEmits(['item-click'])

/**
 * ==============================================================================
 * 2. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 아이템 클릭 핸들러
const handleItemClick = () => {
  emit('item-click')
}
</script>

<template>
  <!-- 
      리스트 아이템 컨테이너
      - flex items-center: 가로 배치
      - :class 조건부 스타일링: '나'가 아닐 때만 클릭 가능 표시(cursor-pointer) 및 배경 효과
      - @click: '나'가 아닐 때만 핸들러 실행
    -->
  <div
    class="flex items-center gap-3 p-2 rounded-xl -mx-2 transition-colors"
    :class="!isMe && clickable ? 'cursor-pointer hover:bg-slate-50' : ''"
    @click="!isMe && clickable && handleItemClick()"
  >
    <!-- 1. 프로필 이미지 -->
    <div
      class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm"
      :class="isMe ? 'border-2 border-indigo-600' : ''"
    >
      <img :src="img" alt="user" class="w-full h-full object-cover" />
    </div>

    <!-- 2. 텍스트 정보 영역 -->
    <div>
      <p class="text-sm font-bold text-slate-900 flex items-center gap-1">
        {{ name }}

        <!-- '나' 뱃지 -->
        <span v-if="isMe" class="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md"
          >나</span
        >
      </p>

      <!-- 서브 텍스트 -->
      <p
        v-if="subText"
        class="text-xs"
        :class="isMe ? 'text-slate-400' : 'text-indigo-500 font-medium italic'"
      >
        {{ subText }}
      </p>
    </div>
  </div>
</template>
