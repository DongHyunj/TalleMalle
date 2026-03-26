<script setup>
/**
 * ==============================================================================
 * 1. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
defineProps({
  // 박스 내부 여백을 조절하고 싶을 때 사용
  padding: {
    type: String,
    default: '30px',
  },
})
</script>

<template>
  <div class="round-box" :style="{ padding: padding }">
    <slot></slot>
  </div>
</template>

<style scoped>
.round-box {
  background-color: #ffffff;
  /* 이미지와 유사한 부드럽고 큰 라운드 값 */
  border-radius: 40px;
  /* 필요 시 얇은 테두리 추가 (두 번째 이미지 참고) */
  border: 1px solid #f0f0f0;
  /* 부드러운 그림자 효과 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* 내부 요소가 라운드를 벗어나지 않게 함 */
}
</style>
