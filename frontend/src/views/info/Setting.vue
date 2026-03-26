<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onMounted } from 'vue'
import { Bell, ShieldCheck, ExternalLink, Loader2 } from 'lucide-vue-next'
import SettingPageLayout from '@/components/setting/SettingPageLayout.vue'
import SettingSection from '@/components/setting/SettingSection.vue'
import SettingGoToPageItem from '@/components/setting/SettingGoToPageItem.vue'
import pushApi from '@/api/push'

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수)
 * ==============================================================================
 */
/** 모집 확정·콜(매칭) 등 서비스 알림 웹푸시 수신 동의 (채팅 메시지 푸시와 별개) */
const recruitPushConsent = ref(true)
const pushPrefBusy = ref(false)

const loadPushPreferences = async () => {
  try {
    const res = await pushApi.getPreferences()
    const enabled = res?.data?.result?.recruitPromotionPushEnabled
    recruitPushConsent.value = enabled !== false
  } catch {
    recruitPushConsent.value = true
  }
}

const handleRecruitPushToggle = async (event) => {
  const wantOn = event.target.checked
  if (pushPrefBusy.value) {
    event.target.checked = !wantOn
    return
  }
  pushPrefBusy.value = true
  try {
    await pushApi.patchRecruitPromotionPush(wantOn)
    recruitPushConsent.value = wantOn
  } catch (e) {
    // console.error(e)
    event.target.checked = recruitPushConsent.value
    alert('설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
  } finally {
    pushPrefBusy.value = false
  }
}

onMounted(() => {
  loadPushPreferences()
})
</script>

<template>
  <SettingPageLayout title="환경 설정" description="앱 알림, 보안 및 고객 지원 설정을 관리합니다.">
    
    <div class="max-w-4xl mx-auto space-y-8 w-full">
      
      <SettingSection title="알림 설정" :icon="Bell">
        <div class="space-y-6">
          <div class="flex items-center justify-between gap-4 px-2">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900">모집·콜 알림</p>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                모집 확정, 기사 배정, 운행 시작·종료 등 알림을 푸시로 받습니다. 채팅 메시지 알림은 채팅방 입장 시 별도로 등록됩니다.
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <label
                class="relative inline-flex items-center"
                :class="pushPrefBusy ? 'cursor-wait opacity-70' : 'cursor-pointer'"
              >
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :checked="recruitPushConsent"
                  :disabled="pushPrefBusy"
                  @change="handleRecruitPushToggle"
                />
                <div
                  class="w-11 h-6 bg-slate-200 peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 peer-disabled:opacity-50"
                ></div>
              </label>
              <Loader2
                v-if="pushPrefBusy"
                class="w-4 h-4 animate-spin text-violet-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="계정 및 보안" :icon="ShieldCheck">
        <div class="divide-y divide-slate-50">
          <SettingGoToPageItem 
            label="비밀번호 변경" 
            to="/changepassword" 
          />
          
          <SettingGoToPageItem 
            label="차단한 사용자 관리" 
            to="/blocklist" 
          />

          <SettingGoToPageItem 
            label="안심번호 사용 설정" 
            to="/safenumber"
          >
            <template #right>
              <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                사용 중
              </span>
            </template>
          </SettingGoToPageItem>
        </div>
      </SettingSection>

      <div class="pb-12">
        <div class="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h3 class="text-sm font-bold text-slate-900 mb-4">앱 정보</h3>
          <div class="space-y-3 text-sm text-slate-500">
            <div class="flex justify-between">
              <span>현재 버전</span>
              <span class="font-bold text-slate-800">v1.2.4</span>
            </div>
            <router-link
              to="/terms"
              class="flex justify-between cursor-pointer hover:text-indigo-600 group transition-colors"
            >
              <span class="group-hover:font-semibold">이용약관</span>
              <ExternalLink class="w-4 h-4" />
            </router-link>
            <router-link
              to="/privacy"
              class="flex justify-between cursor-pointer hover:text-indigo-600 group transition-colors"
            >
              <span class="group-hover:font-semibold">개인정보 처리방침</span>
              <ExternalLink class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </SettingPageLayout>
</template>