<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import ChatHeader from './ChatHeader.vue'
import MessageList from './MessageList.vue'
import ChatComposer from './ChatComposer.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의 (부모로부터 받는 데이터)
const props = defineProps({
  messages: {
    type: Array,
    default: () => [], // 데이터가 안 넘어오면 빈 배열로 초기화
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  isLoadingMore: {
    type: Boolean,
    default: false,
  },
  isConnected: {
    type: Boolean,
    default: false, // 기본값은 '연결 안 됨'
  },
  rideInfo: {
    type: Object,
    default: null,
  },
})

// Emits 정의 (부모에게 보낼 신호)
const emit = defineEmits(['send-message', 'send-image', 'exit', 'load-more'])

/**
 * ==============================================================================
 * 3. METHODS - UI INTERACTION (화면 조작 및 이벤트 전달)
 * ==============================================================================
 */
// 메시지 전송 핸들러 (ChatComposer -> ChatPanel -> ChatView)
const handleSendMessage = (text) => {
  emit('send-message', text)
}

// 이미지 전송 핸들러
const handleSendImage = (imageData) => {
  emit('send-image', imageData)
}

const handleExit = () => {
  emit('exit')
}

const handleLoadMore = () => {
  emit('load-more')
}
</script>

<template>
  <!-- 
      메인 컨테이너 스타일링
      - flex-1: 남은 공간을 꽉 채움
      - flex-col: 내부 요소들을 세로로 배치 (헤더 -> 리스트 -> 입력창)
      - glass-panel: 유리 같은 반투명 효과 (CSS 클래스)
      - relative: 내부 자식들의 위치 기준점
    -->
  <div
    class="flex-1 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden relative bg-white/90 backdrop-blur border border-white/50 shadow-xl"
  >
    <!-- 1. 상단 헤더 -->
    <ChatHeader :is-connected="isConnected" :ride-info="rideInfo" @exit="handleExit" />

    <!-- 2. 메시지 리스트 (스크롤 영역) -->
    <MessageList
      :messages="messages"
      :has-more="hasMore"
      :is-loading-more="isLoadingMore"
      @load-more="handleLoadMore"
    />

    <!-- 3. 하단 입력창 -->
    <ChatComposer @send-message="handleSendMessage" @send-image="handleSendImage" />
  </div>
</template>
