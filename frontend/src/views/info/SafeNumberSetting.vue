<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Phone, ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import SettingPageLayout from '@/components/setting/SettingPageLayout.vue'
import SettingSection from '@/components/setting/SettingSection.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어)
 * ==============================================================================
 */
const router = useRouter()

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수)
 * ==============================================================================
 */
// 안심번호 활성화 상태
const isSafeNumberEnabled = ref(true)

// 연결된 실제 번호 (예시 데이터)
const phoneNumber = ref('010-1234-5678')

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (기능 및 UI 로직)
 * ==============================================================================
 */
const toggleSafeNumber = () => {
  // 실제 API 연동 시 이곳에서 처리
  // console.log('안심번호 상태 변경:', isSafeNumberEnabled.value)
}
</script>

<template>
  <SettingPageLayout 
    title="안심번호 설정" 
    description="개인 연락처 노출 없이 가상 번호를 통해 안전하게 소통하세요."
  >
    <div class="max-w-3xl mx-auto space-y-6 w-full">
      
      <SettingSection title="서비스 활성화" :icon="ShieldCheck">
        <div class="p-2 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-700">안심번호 사용</p>
            <p class="text-xs text-slate-400 mt-1">
              활성화 시 상대방에게 나의 실제 번호 대신 가상 번호가 노출됩니다.
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="isSafeNumberEnabled" 
              @change="toggleSafeNumber"
              class="sr-only peer" 
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </SettingSection>

      <SettingSection title="연결 정보" :icon="Phone">
        <div class="p-2 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500 font-medium">실제 연락처</span>
            <span class="text-sm text-slate-800 font-bold">{{ phoneNumber }}</span>
          </div>
          
          <div v-if="isSafeNumberEnabled" class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
            <div class="flex items-start gap-3">
              <CheckCircle2 class="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-bold text-indigo-900">안심번호가 작동 중입니다</p>
                <p class="text-xs text-indigo-600/80 mt-1 leading-relaxed">
                  현재 매칭된 상대방에게는 050으로 시작하는 가상 번호가 표시되며, 해당 번호로 오는 연락은 등록하신 휴대폰으로 자동 연결됩니다.
                </p>
              </div>
            </div>
          </div>

          <div v-else class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div class="flex items-start gap-3 text-slate-400">
              <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-bold text-slate-500">안심번호가 비활성화됨</p>
                <p class="text-xs mt-1 leading-relaxed">
                  서비스 이용 시 실제 연락처가 상대방에게 노출될 수 있으니 주의해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      <div class="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <Info class="w-4 h-4 text-slate-400" />
          <h3 class="text-sm font-bold text-slate-900">이용 안내</h3>
        </div>
        <ul class="space-y-3">
          <li class="flex gap-2">
            <span class="text-indigo-600 font-bold">•</span>
            <p class="text-xs text-slate-500 leading-relaxed">가상 번호는 매칭이 종료된 후 일정 시간이 지나면 자동으로 회수됩니다.</p>
          </li>
          <li class="flex gap-2">
            <span class="text-indigo-600 font-bold">•</span>
            <p class="text-xs text-slate-500 leading-relaxed">수신자 부담 전화로 연결되며, 별도의 부가 서비스 이용료는 발생하지 않습니다.</p>
          </li>
          <li class="flex gap-2">
            <span class="text-indigo-600 font-bold">•</span>
            <p class="text-xs text-slate-500 leading-relaxed">연락처를 변경하시려면 '마이페이지 > 프로필 수정'에서 휴대폰 본인 인증을 다시 진행해 주세요.</p>
          </li>
        </ul>
      </div>

    </div>
  </SettingPageLayout>
</template>

<style scoped>
/* 필요한 경우 추가 스타일 작성 */
</style>