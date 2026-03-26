<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Stores
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useRecruitStore } from '@/stores/recruit'
import { useChatStore } from '@/stores/chat'

// APIs
import notificationApi from '@/api/notification'
import chatApi from '@/api/chat'
import userApi from '@/api/user'

// Icons
import {
  CarFront,
  Home,
  MessageCircle,
  Bell,
  Megaphone,
  Settings,
  LogOut,
  UserPlus,
  CreditCard,
  Gift,
  Users,
  PlayCircle,
  Flag,
} from 'lucide-vue-next'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const recruitStore = useRecruitStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
const { notifications } = storeToRefs(notificationStore) // Store 상태 구독
const { hasUnread } = storeToRefs(chatStore)

const showNotifications = ref(false)
const notificationRef = ref(null)
const toggleBtnRef = ref(null)
const swMessageHandler = (event) => {
  if (event.data?.type === 'chat-unread') {
    chatStore.markUnread(event.data.recruitId)
  }
}

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL & UI
 * ==============================================================================
 */
const isActive = (path) => {
  if (path === '/chat') return route.path.startsWith('/chat')
  return route.path === path
}

const toggleNotification = () => {
  showNotifications.value = !showNotifications.value
}

// 외부 클릭 감지 (알림창 닫기)
const handleClickOutside = (event) => {
  if (
    showNotifications.value &&
    notificationRef.value &&
    !notificationRef.value.contains(event.target) &&
    toggleBtnRef.value &&
    !toggleBtnRef.value.contains(event.target)
  ) {
    showNotifications.value = false
  }
}

// 채팅 아이콘 클릭 핸들러
const handleChatClick = () => {
  router.push('/chat')
}

// 알림 전체보기 페이지 이동
const goToNotifications = () => {
  showNotifications.value = false
  router.push('/notification')
}

// 알림 클릭 핸들러 (읽음 처리) - id 대신 idx 사용
const handleNotificationClick = async (idx) => {
  try {
    await notificationApi.readNotification(idx)
    notificationStore.markAsRead(idx)
  } catch (error) {
    // console.error(error)
  }
}

// 알림 아이콘/스타일 매핑 (백엔드 type 문자열과 동기화)
const getNotificationStyle = (rawType) => {
  const type = String(rawType ?? '').toLowerCase()
  switch (type) {
    case 'recruit_full':
      return {
        icon: Users,
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'text-emerald-500',
        name: '모집 확정',
      }
    case 'driver_assigned':
      return {
        icon: CarFront,
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        label: 'text-indigo-500',
        name: '기사 배정',
      }
    case 'ride_started':
      return {
        icon: PlayCircle,
        bg: 'bg-sky-50',
        text: 'text-sky-600',
        label: 'text-sky-500',
        name: '운행 시작',
      }
    case 'ride_completed':
      return {
        icon: Flag,
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        label: 'text-violet-500',
        name: '운행 종료',
      }
    case 'matching':
      return {
        icon: UserPlus,
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        label: 'text-indigo-500',
        name: '매칭',
      }
    case 'event':
      return {
        icon: Gift,
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        label: 'text-pink-500',
        name: '이벤트',
      }
    case 'payment':
      return {
        icon: CreditCard,
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        label: 'text-amber-500',
        name: '결제',
      }
    default:
      return {
        icon: Bell,
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        label: 'text-slate-500',
        name: '알림',
      }
  }
}

const isNotificationRead = (n) => !!(n?.isRead ?? n?.read)

// [Computed] 최신 알림 5개 정렬 및 추출
const recentNotifications = computed(() => {
  const safeList = Array.isArray(notifications.value) ? notifications.value : []

  const sorted = [...safeList].sort((a, b) => {
    const ra = isNotificationRead(a)
    const rb = isNotificationRead(b)
    if (ra === rb) return 0
    return ra ? 1 : -1
  })
  return sorted.slice(0, 5)
})

// [Computed] 읽지 않은 알림 개수
const unreadCount = computed(() => {
  const safeList = Array.isArray(notifications.value) ? notifications.value : []
  return safeList.filter((n) => !isNotificationRead(n)).length
})

const formatNavNotificationTime = (item) => {
  const raw = item?.createdAt ?? item?.created_at
  if (!raw) return ''
  try {
    return new Date(raw).toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

// 초기 알림 데이터 로드 (API 호출 -> Store 저장)
const loadInitialNotifications = async () => {
  try {
    const safeList = notifications.value || []

    if (safeList.length === 0) {
      const res = await notificationApi.getNotificationList(0, 10)
      const body = res?.data?.result ?? res?.data
      const list = body?.boardList ?? body?.content ?? []
      if (Array.isArray(list) && list.length > 0) {
        notificationStore.setNotifications(list)
      }
    }
  } catch (error) {
    // console.error('네비게이션 초기 알림 로드 실패:', error)
  }
}

/**
 * ==============================================================================
 * 5. METHODS - API & NETWORK
 * ==============================================================================
 */
const logout = async () => {
  try {
    const res = await userApi.logout()
    // console.log(res.data)
    authStore.logout()
  } catch (error) {
    // console.error(error)
  }
}

/**
 * ==============================================================================
 * 6. LIFECYCLE
 * ==============================================================================
 */
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  // 앱 시작 시 데이터 로드
  await loadInitialNotifications()

  try {
    const res = await chatApi.getUnreadChatRooms()
    const unreadRooms = res?.result ?? res ?? []
    if (Array.isArray(unreadRooms)) {
      chatStore.setUnreadFromServer(unreadRooms)
    }
  } catch (error) {
    // console.error('채팅 읽지 않은 목록 로드 실패:', error)
  }

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', swMessageHandler)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (navigator.serviceWorker) {
    navigator.serviceWorker.removeEventListener('message', swMessageHandler)
  }
})
</script>

<template>
  <div class="relative h-full z-50">
    <div
      class="glass-panel w-20 h-full rounded-[2.5rem] flex flex-col items-center py-8 pointer-events-auto shrink-0 bg-white border border-slate-200 shadow-xl relative z-40"
    >
      <div class="mb-12">
        <div class="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
          <CarFront class="text-white w-6 h-6" />
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-4">
        <RouterLink
          to="/"
          class="nav-item p-3 rounded-2xl transition-all"
          :class="
            isActive('/')
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          "
        >
          <Home class="w-6 h-6" />
        </RouterLink>

        <a
          @click.prevent="handleChatClick"
          class="nav-item p-3 rounded-2xl transition-all relative cursor-pointer"
          :class="
            isActive('/chat')
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          "
        >
          <MessageCircle class="w-6 h-6" />
          <span
            v-if="hasUnread"
            class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"
          ></span>
        </a>

        <button
          ref="toggleBtnRef"
          @click="toggleNotification"
          class="nav-item p-3 rounded-2xl transition-all relative"
          :class="
            showNotifications || route.path === '/notification'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          "
        >
          <Bell class="w-6 h-6" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"
          ></span>
        </button>

        <RouterLink
          to="/notice"
          class="nav-item p-3 rounded-2xl transition-all"
          :class="
            isActive('/notice')
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          "
        >
          <Megaphone class="w-6 h-6" />
        </RouterLink>
      </div>

      <div class="flex flex-col gap-4 items-center">
        <RouterLink
          to="/setting"
          class="nav-item p-3 rounded-2xl transition-all"
          :class="
            isActive('/setting')
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          "
        >
          <Settings class="w-6 h-6" />
        </RouterLink>

        <RouterLink
          to="/mypage"
          class="w-10 h-10 rounded-full bg-slate-200 border-2 shadow-sm overflow-hidden cursor-pointer hover:border-indigo-400 transition-all"
          :class="isActive('/mypage') ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-white'"
        >
          <img
            :src="authStore.user?.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'"
            alt="profile"
            class="w-full h-full object-cover"
          />
        </RouterLink>

        <button
          @click="logout"
          class="nav-item p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all mt-2"
        >
          <LogOut class="w-6 h-6" />
        </button>
      </div>
    </div>

    <div
      v-if="showNotifications"
      ref="notificationRef"
      class="absolute left-[100px] top-[220px] w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-50 flex flex-col gap-4 origin-top-left transition-all"
    >
      <div class="flex justify-between items-center border-b border-slate-50 pb-4">
        <h3 class="font-bold text-slate-900 text-lg">실시간 알림</h3>
        <span
          v-if="unreadCount > 0"
          class="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full"
        >
          {{ unreadCount }} new
        </span>
      </div>

      <div class="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scroll">
        <div
          v-if="recentNotifications.length === 0"
          class="text-center py-8 text-slate-400 text-xs"
        >
          새로운 알림이 없습니다.
        </div>

        <div
          v-for="item in recentNotifications"
          :key="item.idx"
          @click="handleNotificationClick(item.idx)"
          class="flex gap-4 items-start group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors relative"
          :class="{ 'opacity-50': isNotificationRead(item) }"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
            :class="[getNotificationStyle(item.type).bg, getNotificationStyle(item.type).text]"
          >
            <component :is="getNotificationStyle(item.type).icon" class="w-5 h-5" />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold" :class="getNotificationStyle(item.type).label">
                {{ getNotificationStyle(item.type).name }}
              </span>
              <span v-if="!isNotificationRead(item)" class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </div>

            <p v-if="item.title" class="text-xs font-semibold text-slate-800 line-clamp-1">
              {{ item.title }}
            </p>
            <p class="text-sm text-slate-600 leading-snug line-clamp-2">
              {{ item.contents ?? item.content }}
            </p>
            <span class="text-[10px] text-slate-400">{{ formatNavNotificationTime(item) }}</span>
          </div>
        </div>
      </div>

      <button
        @click="goToNotifications"
        class="w-full py-3 mt-2 text-xs font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"
      >
        전체보기
      </button>
    </div>
  </div>
</template>
