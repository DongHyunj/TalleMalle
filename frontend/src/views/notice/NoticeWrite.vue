<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/notice/index.js'
import PageHeader from '@/components/layout/PageHeader.vue'

/**
 * ==============================================================================
 * 2. STATE & REFS (상태 관리)
 * ==============================================================================
 */
const route = useRoute()
const router = useRouter()

// 1. 현재 모드 판별 (URL에 idx 파라미터가 있으면 수정 모드)
const isEditMode = computed(() => !!route.params.idx)

// DB 구조에 맞춘 데이터 모델
const notice = ref({
  title: '',
  contents: '',
  tag: '공지', // 기본값을 tagOptions와 스타일 키에 맞춰 '공지'로 변경
  isPinned: 0,
})

// 태그 옵션 (스타일 키와 일치시킴)
const tagOptions = ['공지', '업데이트', '이벤트', '점검', '긴급']

// 비활성 상태 스타일 (파스텔톤)
const tagStyles = {
  공지: 'bg-yellow-50 text-yellow-600',
  업데이트: 'bg-blue-50 text-blue-500',
  이벤트: 'bg-purple-50 text-purple-500',
  점검: 'bg-orange-50 text-orange-600',
  긴급: 'bg-red-50 text-red-600',
}

// 활성 상태 스타일 (선명한 톤)
const activeTagStyles = {
  공지: 'bg-yellow-400 text-white shadow-yellow-100',
  업데이트: 'bg-blue-600 text-white shadow-md',
  이벤트: 'bg-purple-600 text-white shadow-md',
  점검: 'bg-orange-500 text-white shadow-md',
  긴급: 'bg-red-600 text-white shadow-md',
}

/**
 * ==============================================================================
 * 3. METHODS (서버 연동 및 UI 핸들러)
 * ==============================================================================
 */

// 수정 모드일 경우 기존 데이터 불러오기
const fetchDetail = async () => {
  // 1. 수정 모드가 아니면 실행 안 함
  if (!isEditMode.value) return

  try {
    const res = await api.getNoticeDetail(route.params.idx)
    // 서버 응답 구조가 res.data일 경우를 대비해 처리
    const data = res.data || res
    notice.value = {
      title: data.title,
      contents: data.contents,
      tag: data.tag || '공지',
      isPinned: data.isPinned || 0,
    }
  } catch (error) {
    // console.error('데이터 로드 실패:', error)
    alert('기존 공지사항 정보를 불러오지 못했습니다.')
  }
}

const submitNotice = async () => {
  if (!notice.value.title.trim() || !notice.value.contents.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  try {
    if (isEditMode.value) {
      // 수정 API 호출
      await api.updateNotice(route.params.idx, notice.value)
      alert('공지사항이 수정되었습니다.')
    } else {
      // 등록 API 호출
      await api.createNotice(notice.value)
      alert('공지사항이 성공적으로 등록되었습니다.')
    }

    router.push('/notice')
  } catch (error) {
    // console.error(error)
    alert(isEditMode.value ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.')
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="flex h-screen p-4 gap-4 bg-[#f8fafc] font-['Pretendard'] overflow-hidden">
    <div
      id="navbar-container"
      class="w-20 h-full shrink-0 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
    ></div>

    <div class="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col">
      <PageHeader
        :title="isEditMode ? '공지사항 수정' : '공지사항 작성'"
        :description="
          isEditMode
            ? '기존 공지 내용을 수정하고 업데이트하세요.'
            : '새로운 소식을 작성하여 사용자들에게 알리세요.'
        "
      />

      <div class="flex-1 overflow-y-auto custom-scroll bg-white p-8">
        <div class="max-w-5xl mx-auto space-y-6">
          <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
            <div class="flex flex-wrap items-center gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-500 ml-1">카테고리</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in tagOptions"
                    :key="tag"
                    type="button"
                    @click="notice.tag = tag"
                    :class="[
                      'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border border-transparent',
                      notice.tag === tag
                        ? activeTagStyles[tag] + ' shadow-lg -translate-y-0.5'
                        : (tagStyles[tag] || 'bg-slate-50 text-slate-400') +
                          ' hover:border-slate-200',
                    ]"
                  >
                    <span v-if="notice.tag === tag" class="mr-1">✓</span>
                    {{ tag }}
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-2 ml-auto">
                <label class="text-sm font-semibold text-slate-500 ml-1">상단 고정</label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="notice.isPinned"
                    :true-value="1"
                    :false-value="0"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span class="ml-3 text-sm font-medium text-slate-600">중요 공지</span>
                </label>
              </div>
            </div>

            <hr class="border-slate-50" />

            <div class="space-y-2">
              <label for="title" class="text-sm font-semibold text-slate-500 ml-1">제목</label>
              <input
                id="title"
                v-model="notice.title"
                type="text"
                placeholder="공지사항 제목을 입력하세요"
                class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-200 transition-all"
              />
            </div>

            <div class="space-y-2">
              <label for="contents" class="text-sm font-semibold text-slate-500 ml-1"
                >상세 내용</label
              >
              <textarea
                id="contents"
                v-model="notice.contents"
                rows="12"
                placeholder="사용자들에게 전달할 내용을 자유롭게 작성하세요"
                class="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-slate-700 leading-relaxed placeholder:text-slate-300 focus:ring-2 focus:ring-slate-200 transition-all resize-none custom-scroll"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                @click="goBack"
                class="px-8 py-4 rounded-2xl font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                @click="submitNotice"
                class="px-10 py-4 rounded-2xl font-bold text-white bg-slate-900 shadow-lg shadow-slate-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {{ isEditMode ? '공지사항 수정 완료' : '공지사항 등록하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
