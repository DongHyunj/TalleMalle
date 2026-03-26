<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 컴포넌트)
 * ==============================================================================
 */
import { inject, computed } from 'vue'
import MemberListItem from './MemberListItem.vue'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
const props = defineProps({
  userProfiles: {
    type: Object,
    default: () => ({}),
  },
})


// Inject (데이터 주입)
const myUserName = inject('myUserName', '익명')
const myUserImg = inject('myUserImg', '')

const myProfileImg = computed(() => {
  return myUserImg?.value || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
})

/**
 * ==============================================================================
 * 3. STATE & COMPUTED (상태 및 계산된 속성)
 * ==============================================================================
 */
// 실시간 멤버 수 계산
const currentMemberCount = computed(() => {
  // Unknown 유저는 카운트에서 제외
  const othersCount = Object.keys(props.userProfiles).filter((id) => id !== 'Unknown').length
  return 1 + othersCount
})

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 이벤트 처리)
 * ==============================================================================
 */
</script>

<template>
  <!-- 
      멤버 리스트 컨테이너
      - flex-1: 남은 세로 공간 채움
      - custom-scroll: 스크롤바 스타일 적용
    -->
  <div
    class="bg-white/90 backdrop-blur p-6 rounded-[2.5rem] flex-1 overflow-y-auto custom-scroll border border-white/50 shadow-sm"
  >
    <!-- 멤버 수 표시 -->
    <h3 class="font-bold text-slate-900 mb-4 text-sm">
      참여 멤버 <span class="text-indigo-600">({{ currentMemberCount }}명)</span>
    </h3>

    <div class="space-y-4">
      <!-- 1. 내 프로필 (최상단 고정) -->
      <MemberListItem
        :name="myUserName"
        :img="myProfileImg"
        :is-me="true"
        :clickable="false"
      />

      <!-- 2. 다른 멤버 리스트 -->
      <template v-for="(profile, id) in userProfiles" :key="id">
        <MemberListItem
          v-if="id !== 'Unknown'"
          :name="profile.name"
          :img="profile.img"
          :clickable="false"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 스크롤바 디자인 */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
