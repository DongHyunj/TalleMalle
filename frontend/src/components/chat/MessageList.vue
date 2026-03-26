<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { ref, nextTick, watch, onMounted } from 'vue'
import MessageItem from './MessageItem.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  isLoadingMore: {
    type: Boolean,
    default: false,
  },
})

// Emits 정의
const emit = defineEmits(['load-more'])

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
// 스크롤 컨테이너 참조 (Template Ref)
const chatContainer = ref(null)
const pendingRestore = ref(null)
const pendingLength = ref(null)

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
// 스크롤을 맨 아래로 이동시키는 함수
const scrollToBottom = async () => {
  // 화면 렌더링이 끝날 때까지 대기
  await nextTick()

  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleScroll = () => {
  if (!chatContainer.value) return
  if (!props.hasMore || props.isLoadingMore) return

  if (chatContainer.value.scrollTop <= 0) {
    pendingRestore.value = {
      scrollHeight: chatContainer.value.scrollHeight,
      scrollTop: chatContainer.value.scrollTop,
    }
    pendingLength.value = props.messages.length
    emit('load-more')
  }
}


/**
 * ==============================================================================
 * 5. WATCH & EFFECT (감시자 및 부수 효과)
 * ==============================================================================
 */
// 새 메시지가 올 때마다 스크롤 아래로 이동
watch(
  () => props.messages,
  () => {
    if (pendingRestore.value && chatContainer.value) {
      const prev = pendingRestore.value
      pendingRestore.value = null
      pendingLength.value = null
      nextTick(() => {
        if (!chatContainer.value) return
        const newHeight = chatContainer.value.scrollHeight
        chatContainer.value.scrollTop = newHeight - prev.scrollHeight + prev.scrollTop
      })
      return
    }
    scrollToBottom()
  },
  { deep: true, flush: 'post' },
)

watch(
  () => props.isLoadingMore,
  (loading) => {
    if (!loading && pendingRestore.value && pendingLength.value === props.messages.length) {
      pendingRestore.value = null
      pendingLength.value = null
    }
  },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <!-- 
      스크롤 컨테이너 영역
      - ref="chatContainer": 스크립트 제어용
      - custom-scroll: 커스텀 스크롤바 CSS 클래스
    -->
  <div
    ref="chatContainer"
    class="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll pb-24 md:pb-6"
    @scroll="handleScroll"
  >
    <div v-if="isLoadingMore" class="text-center text-xs text-slate-400">
      이전 메시지 불러오는 중...
    </div>
    <!-- 메시지 반복 렌더링 -->
    <MessageItem
      v-for="msg in messages"
      :key="msg.id"
      :msg="msg"
    />
  </div>
</template>

<style scoped>
/* 커스텀 스크롤바 스타일링 (Webkit 브라우저용) */
.custom-scroll::-webkit-scrollbar {
  width: 4px; /* 스크롤바 너비를 얇게 */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0; /* 스크롤바 막대 색상 */
  border-radius: 10px; /* 둥글게 처리 */
}
</style>
