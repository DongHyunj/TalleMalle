<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, Eye, Pencil, Trash2 } from 'lucide-vue-next' // 아이콘 추가
import { useAuthStore } from '@/stores/auth.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import api from '@/api/notice/index.js'
import PageHeader from '@/components/layout/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notice = ref(null)
const isLoading = ref(true)

/**
 * 태그별 스타일 매핑
 */
const tagStyles = {
  공지: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
  업데이트: 'bg-blue-50 text-blue-600 border border-blue-100',
  이벤트: 'bg-purple-50 text-purple-600 border border-purple-100',
  점검: 'bg-orange-50 text-orange-600 border border-orange-100',
  긴급: 'bg-red-50 text-red-600 border border-red-100',
}

const getTagClass = computed(() => {
  if (!notice.value) return 'bg-indigo-50 text-indigo-600 border border-indigo-100'
  return tagStyles[notice.value.tag] || 'bg-indigo-50 text-indigo-600 border border-indigo-100'
})

/**
 * 권한 체크: ADMIN 전용 버튼 노출 여부
 */
const isAdmin = computed(() => {
  return authStore.user?.role === 'ROLE_ADMIN'
})

const goToEdit = () => {
  router.push({ name: 'noticeEdit', params: { idx: route.params.idx } })
}

/**
 * 공지사항 삭제 핸들러
 */
const deleteNotice = async () => {
  if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return

  try {
    const response = await api.deleteNotice(route.params.idx)
    alert('삭제되었습니다.')
    router.push('/notice')
  } catch (error) {
    // console.error('삭제 실패:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const fetchNoticeDetail = async () => {
  try {
    const noticeId = route.params.idx
    const response = await api.getNoticeDetail(noticeId)
    notice.value = response
  } catch (error) {
    // console.error('상세 내용을 불러오는데 실패했습니다.', error)
  } finally {
    isLoading.value = false
  }
}

dayjs.extend(utc)
dayjs.extend(timezone)

const formatDate = (date) => {
  return dayjs(date).tz('Asia/Seoul').format('YYYY.MM.DD')
}

onMounted(() => {
  fetchNoticeDetail()
})
</script>

<template>
  <div class="flex h-screen p-4 gap-4 bg-[#f8fafc] font-['Pretendard'] overflow-hidden text-left">
    <div id="navbar-container" class="w-20 h-full shrink-0 rounded-[2.5rem]"></div>

    <div class="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col">
      <PageHeader title="공지사항 상세" description="탈래말래의 새로운 소식을 확인하세요." />

      <div class="bg-white flex-1 overflow-y-auto custom-scroll p-8">
        <div class="max-w-5xl mx-auto">
          <div v-if="isLoading" class="text-center py-20">
            <p class="text-slate-400 animate-pulse">내용을 읽어오는 중입니다...</p>
          </div>

          <div
            v-else-if="notice"
            class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8 text-left"
          >
            <div class="space-y-4 border-b border-slate-50 pb-8">
              <div class="flex items-center justify-between">
                <div class="flex gap-2">
                  <span
                    :class="[
                      getTagClass,
                      'text-[12px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm',
                    ]"
                  >
                    {{ notice.tag || '공지' }}
                  </span>

                  <span
                    v-if="notice.isPinned"
                    class="bg-slate-100 text-slate-500 text-[12px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider"
                  >
                    필독
                  </span>
                </div>

                <div v-if="isAdmin" class="flex gap-2">
                  <button
                    @click="goToEdit"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <Pencil class="w-3.5 h-3.5" /> 수정
                  </button>
                  <button
                    @click="deleteNotice"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <Trash2 class="w-3.5 h-3.5" /> 삭제
                  </button>
                </div>
              </div>

              <h2 class="text-3xl font-extrabold text-slate-900 leading-tight">
                {{ notice.title }}
              </h2>
              <div class="flex items-center text-slate-400 text-sm gap-4">
                <span class="flex items-center gap-1.5">
                  <Calendar class="w-4 h-4" /> {{ formatDate(notice.createdAt) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <Eye class="w-4 h-4" /> 조회수 {{ notice.views.toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="text-slate-600 leading-[1.8] text-base space-y-6">
              <p class="font-bold text-slate-800 text-lg">안녕하세요, 탈래말래 팀입니다.</p>
              <p>{{ notice.contents }}</p>
              <p>감사합니다.</p>
            </div>

            <div class="pt-10 flex justify-center gap-3">
              <button
                @click="$router.push('/notice')"
                class="px-8 py-4 bg-slate-800 text-white rounded-[1.25rem] text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
