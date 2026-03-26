<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onMounted } from 'vue'
import { CheckCircle, Info } from 'lucide-vue-next'
import SettingPageLayout from '@/components/setting/SettingPageLayout.vue'
import BlockedUserItem from '@/components/setting/BlockedUserItem.vue'
import api from '@/api/block/index.js'

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 관리)
 * ==============================================================================
 */
const blockedUsers = ref([])

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (기능 및 UI 로직)
 * ==============================================================================
 */
// 차단 해제 핸들러: 리스트에서 즉시 제거 (UI 반응형 로직)
const unblockUser = (id) => {
  if (confirm("이 사용자의 차단을 해제하시겠습니까?")) {
    // 필터링을 통해 목록에서 제거하여 실시간 반영
    blockedUsers.value = blockedUsers.value.filter(user => user.id !== id)
  }
}

/**
 * ==============================================================================
 * 5. METHODS - API SERVICE METHODS (서버 연동)
 * ==============================================================================
 */
// 차단 목록 데이터 가져오기
const getBlockList = async () => {
  try {
    const res = await api.blockList()
    blockedUsers.value = res.data || res 
  } catch (error) {
    // console.error('차단된 사용자를 불러오는 중 오류 발생:', error)
  }
}

/**
 * ==============================================================================
 * 6. LIFECYCLE (생명주기 훅)
 * ==============================================================================
 */
onMounted(() => {
  getBlockList()
})
</script>

<template>
  <SettingPageLayout 
    title="차단한 사용자 관리" 
    description="차단된 사용자는 나와 매칭되지 않으며 메시지를 보낼 수 없습니다."
  >
    <div class="w-full max-w-3xl">
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[100px]">
        <TransitionGroup name="list" tag="div">
          <BlockedUserItem 
            v-for="user in blockedUsers" 
            :key="user.id" 
            :user="user"
            @unblock="unblockUser" 
          />
        </TransitionGroup>

        <div v-if="blockedUsers.length === 0"
          class="p-10 text-center text-slate-400 flex flex-col items-center">
          <CheckCircle class="w-8 h-8 mb-3 opacity-50" />
          <p class="text-sm">차단한 사용자가 없습니다.</p>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-xs text-slate-400 bg-slate-100/50 inline-flex items-center gap-1 px-4 py-2 rounded-full mx-auto">
          <Info class="w-3 h-3" /> 차단을 해제하면 즉시 매칭 대상에 포함됩니다.
        </p>
      </div>
    </div>
  </SettingPageLayout>
</template>

<style scoped>
/* 리스트 삭제 및 추가 시 슬라이드 애니메이션 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>