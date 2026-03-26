<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API/Composable -> 컴포넌트)
 * ==============================================================================
 */
import { ref, onMounted } from 'vue'
import { X, Camera, UserCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LabeledInput from '@/components/Input/LabeledInput.vue'
import RoundBox from '@/components/layout/RoundBox.vue'
import api from '@/api/profile'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const authStore = useAuthStore()
const emits = defineEmits(['modal'])

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언) - [변수]
 * ==============================================================================
 */
// 프로필 정보 로컬 복사본 (백엔드 필드명과 일치)
const localProfile = ref({
  nickname: '',
  phoneNumber: '',
  introduction: '',
  imageUrl: '',
  birth: '',
  gender: '',
})

// 업로드 중 상태 관리
const isUploading = ref(false)

/**
 * ==============================================================================
 * 5. METHODS - UI INTERACTION (화면 조작) - [기능 함수]
 * ==============================================================================
 */
// 이미지 업로드 (Presigned URL 방식)
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 1. 미리보기 생성 (사용자 경험 향상)
  const reader = new FileReader()
  reader.onload = (e) => (localProfile.value.imageUrl = e.target.result)
  reader.readAsDataURL(file)

  try {
    isUploading.value = true

    // 2. 백엔드에 Presigned URL 요청 (POST /profile/image/presign)
    const res = await api.getPresignedUrl({
      fileName: file.name,
      contentType: file.type
    })
    
    // 백엔드 BaseResponse 구조(res.data.result)에 따라 데이터 추출
    const result = res.data?.result
    if (!result || !result.uploadUrl || !result.publicUrl) {
      throw new Error('Presigned URL 발급 실패: 응답 데이터가 올바르지 않습니다.')
    }
    
    const { uploadUrl, publicUrl } = result

    // 3. S3/스토리지에 직접 파일 업로드 (PUT 요청)
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type // 백엔드 서명 시 사용한 contentType과 정확히 일치해야 함
      },
      mode: 'cors'
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      // console.error('S3 에러 상세:', errorText)
      throw new Error(`S3 업로드 실패: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    // 4. 업로드 완료된 최종 URL을 로컬 상태에 저장
    localProfile.value.imageUrl = publicUrl
    // console.log('이미지 업로드 성공:', publicUrl)
  } catch (error) {
    // console.error('이미지 업로드 중 오류 발생:', error)
    alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
    // 실패 시 기존 이미지로 복구
    localProfile.value.imageUrl = authStore.user?.imageUrl
  } finally {
    isUploading.value = false
  }
}

/**
 * ==============================================================================
 * 6. METHODS - DATA & NETWORK (데이터 통신 및 소켓) - [연동 API 함수]
 * ==============================================================================
 */
// 변경사항 저장
const handleSave = async () => {
  try {
    const updatePayload = {
      nickname: localProfile.value.nickname,
      introduction: localProfile.value.introduction,
      imageUrl: localProfile.value.imageUrl,
    }

    const res = await api.update(updatePayload)
    // console.log('프로필 업데이트 응답:', res.data)

    if (res.status === 200 || res.data?.result) {
      // 서버 응답 데이터가 있으면 사용하고, 없으면 요청했던 데이터 사용
      const updatedData = res.data?.result || updatePayload
      
      // 스토어 업데이트
      authStore.updateUser(updatedData)
      
      alert('프로필 정보가 저장되었습니다.')
      handleClose()
    }
  } catch (error) {
    // console.error('프로필 수정 중 오류 발생:', error)
    alert('저장에 실패했습니다. 다시 시도해주세요.')
  }
}

// 성별 표시 변환 함수
const formatGender = (gender) => {
  if (gender === 'M' || gender === 'MALE') return '남성'
  if (gender === 'W' || gender === 'F' || gender === 'FEMALE') return '여성'
  return gender || '미지정'
}

const handleClose = () => {
  emits('modal', 'none')
}

/**
 * ==============================================================================
 * 7. LIFECYCLE (생명주기 훅) - [마운트 관련]
 * ==============================================================================
 */
onMounted(() => {
  if (authStore.user) {
    Object.assign(localProfile.value, JSON.parse(JSON.stringify(authStore.user)))
  }
})
</script>

<template>
  <div
    class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
  >
    <RoundBox
      padding="0"
      class="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300"
      @click.stop
    >
      <!-- 모달 헤더 -->
      <div
        class="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-indigo-50 rounded-xl">
            <UserCircle class="w-5 h-5 text-indigo-600" />
          </div>
          <h2 class="text-xl font-bold text-slate-900">프로필 정보 수정</h2>
        </div>
        <button
          @click="handleClose"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- 모달 본문 -->
      <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scroll">
        <!-- 프로필 이미지 수정 -->
        <div class="flex flex-col items-center">
          <div class="relative group">
            <div
              class="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50 transition-transform group-hover:scale-[1.02]"
            >
              <img
                :src="localProfile.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'"
                class="w-full h-full object-cover"
              />
            </div>
            <label
              class="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xl border-4 border-white cursor-pointer hover:bg-indigo-700 transition-all"
            >
              <Camera class="w-4 h-4" />
              <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
            </label>
          </div>
          <p class="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            클릭하여 사진 변경
          </p>
        </div>

        <!-- 입력 폼 -->
        <div class="space-y-6">
          <h3
            class="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2"
          >
            기본 정보
          </h3>
          <div class="grid grid-cols-1 gap-6">
            <!-- 닉네임 -->
            <LabeledInput
              id="edit-nickname"
              v-model="localProfile.nickname"
              label="닉네임 *"
              placeholder="닉네임을 입력하세요"
              :length="{ max: 20 }"
            />

            <!-- 한 줄 소개 -->
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-2 ml-1">한 줄 소개</label>
              <textarea
                v-model="localProfile.introduction"
                placeholder="나를 소개해주세요."
                class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 h-24 resize-none transition-all"
              ></textarea>
            </div>

            <!-- 생년월일 / 성별 (읽기 전용) -->
            <div class="grid grid-cols-2 gap-4">
              <LabeledInput
                id="edit-birth"
                :modelValue="localProfile.birth"
                label="생년월일"
                readonly
                class="opacity-60"
              />
              <LabeledInput
                id="edit-gender"
                :modelValue="formatGender(localProfile.gender)"
                label="성별"
                readonly
                class="opacity-60"
              />
            </div>

            <!-- 휴대폰 번호 (수정 불가 처리) -->
            <LabeledInput
              id="edit-phone"
              :modelValue="localProfile.phoneNumber"
              label="휴대폰 번호"
              readonly
              class="opacity-60"
            />
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
        <button
          @click="handleClose"
          class="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
        >
          취소
        </button>
        <button
          @click="handleSave"
          class="flex-[2] py-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          변경사항 저장
        </button>
      </div>
    </RoundBox>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
