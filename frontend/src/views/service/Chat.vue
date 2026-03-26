<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS (라이브러리 -> 스토어/API -> 컴포넌트)
 * ==============================================================================
 */
import { ref, reactive, onMounted, onUnmounted, provide, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Client } from '@stomp/stompjs'
import { useRoute, useRouter } from 'vue-router'

// Stores & API
import { useAuthStore } from '@/stores/auth'
import { useRecruitStore } from '@/stores/recruit'
import { useChatStore } from '@/stores/chat'
import api from '@/api/chat'
import mainApi from '@/api/main'

// Components
import ChatPanel from '@/components/chat/ChatPanel.vue'
import RideSidebar from '@/components/chat/RideSidebar.vue'
import ChatAccessModal from '@/components/chat/ChatAccessModal.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (설정 및 스토어 초기화)
 * ==============================================================================
 */
const authStore = useAuthStore()
const recruitStore = useRecruitStore()
const chatStore = useChatStore()
const { user } = storeToRefs(authStore)
const { recruitId } = storeToRefs(recruitStore)
const route = useRoute()
const router = useRouter()

// 하위 컴포넌트(Header, MemberList)에서 내 이름/이미지를 쓸 수 있도록 전달
const myUserName = ref('익명')
const myUserImg = ref('')
provide('myUserName', myUserName)
provide('myUserImg', myUserImg)

/**
 * ==============================================================================
 * 3. STATE & REFS (상태 변수 선언)
 * ==============================================================================
 */
// WebSocket 관련
const isConnected = ref(false)
let stompClient = null
const roomId = ref(null)

// 사용자 정보
const myUserId = ref(`user_${Math.floor(Math.random() * 1000)}`)

// 데이터 관련
const messages = ref([]) // 채팅 메시지 목록
const usersData = ref({}) // 참여자 정보 (User Map)
const rideInfo = ref(null) // 여정 정보
const isLoadingMore = ref(false)
const hasMore = ref(true)
const oldestCursor = ref(null)
const PAGE_SIZE = 30

// UI 상태
const isLoading = ref(false)
const accessModal = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: '확인',
  onConfirm: null,
})
const hasShownWsError = ref(false)
const accessBlocked = ref(false)


const showAccessModal = (title, message, confirmText, onConfirm) => {
  accessModal.open = true
  accessModal.title = title
  accessModal.message = message
  accessModal.confirmText = confirmText
  accessModal.onConfirm = onConfirm
  accessBlocked.value = true
}

const handleAccessConfirm = () => {
  if (typeof accessModal.onConfirm === 'function') {
    accessModal.onConfirm()
  }
  accessModal.open = false
}

const formatTime = (date) => {
  const now = date instanceof Date ? date : new Date(date)
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

const resolveProfileImage = (raw) =>
  raw?.imageUrl ||
  raw?.profileImageUrl ||
  raw?.profileImage ||
  raw?.userImg ||
  raw?.img ||
  ''

const getDefaultAvatar = (userId) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || 'Unknown'}`

const buildUserDisplay = (userId, userName, userImg) => {
  const fallback = usersData.value?.[userId] || usersData.value?.['Unknown'] || {}
  return {
    name: userName || fallback.name || '알수없음',
    img: userImg || fallback.img || getDefaultAvatar(userId),
  }
}

const normalizeHistoryMessage = (item) => {
  if (!item || typeof item !== 'object') return null

  // 이미 UI 포맷이면 그대로 사용
  if (item.text && ['me', 'other', 'system', 'date', 'image'].includes(item.type)) {
    return item
  }

  const senderId = item.senderId || item.writerIdx || item.userId
  const senderName = item.senderName || item.writer || item.userName
  const contents = item.contents || item.text || item.message || item.content

  if (!contents) return null

  const isMe = String(senderId) === String(myUserId.value)
  const timeSource = item.timestamp || item.createdAt || new Date()
  const messageType = item.type || 'message'
  const isImageMessage = messageType === 'image'
  let senderImg =
    item.senderImg ||
    item.senderImageUrl ||
    item.profileImage ||
    item.profileImageUrl ||
    item.userImg ||
    item.img ||
    item.imageUrl ||
    item.image_url
  if (isImageMessage && senderImg && senderImg === contents) {
    senderImg = null
  }
  const displayUser = buildUserDisplay(senderId || 'Unknown', senderName, senderImg)

  if (messageType === 'image') {
    return {
      id: item.idx || item.id || Date.now() + Math.random(),
      type: 'image',
      isMe,
      userId: senderId || 'Unknown',
      text: contents,
      time: formatTime(timeSource),
      user: displayUser,
    }
  }

  return {
    id: item.idx || item.id || Date.now() + Math.random(),
    type: isMe ? 'me' : 'other',
    userId: senderId || 'Unknown',
    text: contents,
    time: formatTime(timeSource),
    user: displayUser,
  }
}

const normalizeParticipants = (payload) => {
  const data = payload?.result ?? payload ?? []
  if (!Array.isArray(data)) return {}

  return data.reduce((acc, item) => {
    const userId = item.userIdx || item.userId || item.id
    const userName = item.userName || item.name
    const userImg = item.imageUrl || item.image_url || item.img || item.userImg
    if (!userId || !userName) return acc
    if (String(userId) === String(myUserId.value)) return acc

    acc[userId] = {
      name: userName,
      img: userImg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      lv: 'LV. 1',
      meta: '참여 중',
      bio: '',
      score: 50,
      rank: '-',
      stats: { time: 0, silent: 0 },
      reviews: [],
    }
    return acc
  }, {})
}

const getRecruitStatus = (data) => {
  const raw =
    data?.status ||
    data?.recruitStatus ||
    data?.recruit?.status ||
    data?.recruit?.recruitStatus ||
    null
  return raw ? String(raw).toUpperCase() : null
}

const getDriverName = (data) => {
  return (
    data?.call?.driver?.name ||
    data?.call?.driverName ||
    data?.call?.driver?.nickname ||
    data?.call?.driver?.userName ||
    data?.driver?.name ||
    data?.driverName ||
    data?.driver?.nickname ||
    null
  )
}

const mapRecruitToRideInfo = (payload) => {
  if (!payload) return null

  const data = payload.result ?? payload
  if (!data) return null

  const startTime =
    data.departureTime || data.startTime
      ? formatTime(data.departureTime || data.startTime)
      : '--:--'

  const status = getRecruitStatus(data)
  const driverName = getDriverName(data)
  const totalFare = Number(data.estimatedFare ?? data.estimated_fare ?? 0)
  const myFare = Number(data.myFare ?? data.my_fare ?? 0)
  const isMatching = ['RECRUITING', 'FULL', 'CALLING'].includes(status)
  const isDriven = ['DRIVING', 'END'].includes(status)

  return {
    driver: {
      type: '택시',
      name: isMatching ? '매칭 대기중' : isDriven ? driverName || '알 수 없음' : driverName || '매칭 대기중',
      car: '-',
      plate: '-',
    },
    route: {
      start: data.startPointName || data.startPoint || data.startLocation || '...',
      dest: data.destPointName || data.destPoint || data.endLocation || '...',
      startTime,
      endTime: startTime,
    },
    payment: {
      status: '예상',
      total: Number.isFinite(totalFare) ? totalFare : 0,
      mine: Number.isFinite(myFare) ? myFare : 0,
    },
    status,
  }
}

const mergeRideInfo = (primary, fallback) => {
  if (!primary && !fallback) return null
  if (!primary) return fallback
  if (!fallback) return primary
  return {
    driver: { ...fallback.driver, ...primary.driver },
    route: { ...fallback.route, ...primary.route },
    payment: { ...fallback.payment, ...primary.payment },
    status: primary.status || fallback.status,
  }
}

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const registerPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const registration = await navigator.serviceWorker.register('/sw.js')
  const existing = await registration.pushManager.getSubscription()

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) return

  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    }))

  await api.subscribePush(subscription.toJSON())
}

/**
 * ==============================================================================
 * 4. METHODS - UI INTERACTION (화면 조작 및 기능 처리)
 * ==============================================================================
 */
// 메시지 전송 처리
const handleSendMessage = (textToSend) => {
  const now = new Date()
  const timeStr = formatTime(now)

  // Optimistic Update (낙관적 업데이트)
  messages.value.push({
    id: Date.now(),
    type: 'me',
    text: textToSend,
    time: timeStr,
  })

  // 실제 서버 전송
  if (stompClient && isConnected.value && roomId.value) {
    const payload = {
      contents: textToSend,
      timestamp: now.toISOString(),
    }
    stompClient.publish({
      destination: `/app/chat/send/${roomId.value}`,
      body: JSON.stringify(payload),
    })
  } else {
    messages.value.push({
      id: Date.now() + 1,
      type: 'system',
      text: '⚠️ 메시지를 전송할 수 없습니다 (연결 끊김)',
    })
  }
}

// 이미지 전송 처리
const handleSendImage = async (file) => {
  if (!file) return
  const now = new Date()
  const timeStr = formatTime(now)

  try {
    const presignRes = await api.getChatImagePresign(file.name, file.type)
    const presignData = presignRes?.result ?? presignRes
    const uploadUrl = presignData?.uploadUrl
    const publicUrl = presignData?.publicUrl

    if (!uploadUrl || !publicUrl) {
      throw new Error('업로드 URL을 가져오지 못했습니다.')
    }

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    // 1. 내 화면에 이미지 표시
    messages.value.push({
      id: Date.now(),
      type: 'image',
      isMe: true,
      text: publicUrl,
      time: timeStr,
    })

    // 2. 소켓 전송 (이미지 URL 저장)
    if (stompClient && isConnected.value && roomId.value) {
      const payload = {
        type: 'image',
        contents: publicUrl,
        timestamp: now.toISOString(),
      }
      stompClient.publish({
        destination: `/app/chat/send/${roomId.value}`,
        body: JSON.stringify(payload),
      })
    }
  } catch (error) {
    messages.value.push({
      id: Date.now() + 1,
      type: 'system',
      text: '⚠️ 이미지 전송에 실패했습니다.',
    })
  }
}


const handleExitRecruit = async () => {
  if (!roomId.value) return
  try {
    await mainApi.leaveRecruit(roomId.value)
    recruitStore.clear()
    chatStore.clearUnread(roomId.value)
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
    }
    router.push('/chat')
  } catch (error) {
    messages.value.push({
      id: Date.now() + 1,
      type: 'system',
      text: '⚠️ 모집 나가기에 실패했습니다.',
    })
  }
}

/**
 * ==============================================================================
 * 5. METHODS - DATA & NETWORK (데이터 통신 및 소켓)
 * ==============================================================================
 */
// 초기 데이터 조회 (API)
const fetchInitialData = async () => {
  isLoading.value = true
  try {
    // 스토어에 여정 정보가 있는지 확인
    const storeRideInfo = recruitStore.currentRideInfo

    // API 병렬 호출 (부분 실패 허용)
    const [historyResult, participantsResult, rideDetailResult] = await Promise.allSettled([
      roomId.value ? api.getChatHistory(roomId.value, { size: PAGE_SIZE }) : Promise.resolve([]),
      roomId.value ? api.getChatParticipants(roomId.value) : Promise.resolve([]),
      roomId.value ? api.getRideDetail(roomId.value) : Promise.resolve(null),
    ])

    if (historyResult.status === 'fulfilled') {
      const historyData = historyResult.value
      if (historyData?.success === false) {
        showAccessModal(
          '채팅방 접근 불가',
          '참여 중인 채팅방이 아니거나 접근 권한이 없습니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      }
      const historyList = historyData?.result ?? historyData ?? []
      messages.value = historyList.map(normalizeHistoryMessage).filter(Boolean)
      oldestCursor.value = historyList.length ? historyList[0]?.idx ?? null : null
      hasMore.value = historyList.length === PAGE_SIZE
    } else {
      const status = historyResult.reason?.response?.status
      if (status === 404) {
        showAccessModal(
          '채팅방을 찾을 수 없습니다',
          '존재하지 않는 채팅방입니다.\n목록으로 이동합니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      } else if (status === 401) {
        showAccessModal(
          '로그인이 필요합니다',
          '채팅방 접근을 위해 로그인해 주세요.',
          '로그인',
          () => router.push('/login'),
        )
        return
      } else {
        showAccessModal(
          '채팅방 접근 불가',
          '참여 중인 채팅방이 아니거나 접근 권한이 없습니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      }
    }

    if (participantsResult.status === 'rejected') {
      const status = participantsResult.reason?.response?.status
      if (status === 404) {
        showAccessModal(
          '채팅방을 찾을 수 없습니다',
          '존재하지 않는 채팅방입니다.\n목록으로 이동합니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      } else if (status === 403) {
        showAccessModal(
          '채팅방 접근 불가',
          '참여 중인 채팅방이 아니거나 접근 권한이 없습니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      }
    }

    if (participantsResult.status === 'fulfilled' && participantsResult.value?.success === false) {
      showAccessModal(
        '채팅방 접근 불가',
        '참여 중인 채팅방이 아니거나 접근 권한이 없습니다.',
        '목록으로',
        () => router.push('/chat'),
      )
      return
    }

    usersData.value =
      participantsResult.status === 'fulfilled' ? normalizeParticipants(participantsResult.value) : {}

    const apiRideDetail = rideDetailResult.status === 'fulfilled' ? rideDetailResult.value : null

    if (rideDetailResult.status === 'rejected') {
      const status = rideDetailResult.reason?.response?.status
      if (status === 404) {
        showAccessModal(
          '채팅방을 찾을 수 없습니다',
          '존재하지 않는 채팅방입니다.\n목록으로 이동합니다.',
          '목록으로',
          () => router.push('/chat'),
        )
        return
      }
    }

    // API 기반 여정 정보 우선 적용, 스토어 데이터는 누락값 보정용으로 병합
    const apiRideInfo = mapRecruitToRideInfo(apiRideDetail)
    rideInfo.value = mergeRideInfo(apiRideInfo, storeRideInfo)

    // Unknown 유저 안전장치
    if (!usersData.value['Unknown']) {
      usersData.value['Unknown'] = {
        name: '알수없음',
        lv: 'LV. 1',
        img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
        meta: '정보 없음',
        bio: '',
        score: 50,
        rank: '-',
        stats: { time: 0, silent: 0 },
        reviews: [],
      }
    }
  } finally {
    isLoading.value = false
  }
}

const loadOlderMessages = async () => {
  if (!roomId.value || isLoadingMore.value || !hasMore.value || !oldestCursor.value) return
  isLoadingMore.value = true
  try {
    const res = await api.getChatHistory(roomId.value, {
      before: oldestCursor.value,
      size: PAGE_SIZE,
    })
    const historyList = res?.result ?? res ?? []
    if (!Array.isArray(historyList) || historyList.length === 0) {
      hasMore.value = false
      return
    }
    const normalized = historyList.map(normalizeHistoryMessage).filter(Boolean)
    messages.value = [...normalized, ...messages.value]
    oldestCursor.value = historyList[0]?.idx ?? oldestCursor.value
    if (historyList.length < PAGE_SIZE) {
      hasMore.value = false
    }
  } finally {
    isLoadingMore.value = false
  }
}

// WebSocket 연결 설정
const connectWebSocket = () => {
  if (stompClient && stompClient.active) return
  if (!roomId.value) return
  if (accessBlocked.value) return

  const wsUri = import.meta.env.VITE_WS_URL
  stompClient = new Client({
    brokerURL: wsUri,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      isConnected.value = true
      stompClient.subscribe(`/topic/chat/${roomId.value}`, (message) => {
        try {
          const parsedData = JSON.parse(message.body)
          const payload = parsedData.payload !== undefined ? parsedData.payload : parsedData
          handleSocketMessage(payload)
        } catch (err) {
          handleSocketMessage(message.body)
        }
      })
    },
  })

  stompClient.onWebSocketClose = () => {
    isConnected.value = false
    if (!hasShownWsError.value && !accessBlocked.value) {
      hasShownWsError.value = true
      showAccessModal(
        '연결 오류',
        '웹소켓 연결이 끊어졌습니다.\n잠시 후 다시 시도해주세요.',
        '다시 시도',
        () => {
          hasShownWsError.value = false
          connectWebSocket()
        },
      )
    }
  }

  stompClient.onStompError = () => {
    isConnected.value = false
    if (!hasShownWsError.value && !accessBlocked.value) {
      hasShownWsError.value = true
      showAccessModal(
        '연결 오류',
        '웹소켓 연결에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
        '다시 시도',
        () => {
          hasShownWsError.value = false
          connectWebSocket()
        },
      )
    }
  }

  stompClient.activate()
}

// 수신된 메시지 처리 핸들러
const handleSocketMessage = (data) => {
  // 이중 인코딩 처리
  if (typeof data === 'string') {
    try {
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        const doubleParsed = JSON.parse(data)
        if (typeof doubleParsed === 'object' && doubleParsed !== null) {
          data = doubleParsed
        }
      }
    } catch (e) {}
  }
  // 1. [내용물 검사] 지도 데이터 특유의 속성(Key)이 있으면 즉시 차단
  // 스크린샷의 데이터 구조: { lat, lng } 또는 { startLat, destLat, nickname }
  if (data.lat !== undefined || data.lng !== undefined || data.startLat !== undefined || data.bearing !== undefined) {
    return
  }

  // 2. [타입 검사] DriverPage에서 사용하는 타입명이 있다면 차단
  const ignoreTypes = ['driverLocation', 'drivingPath', 'newRecruit', 'createRecruit']
  if (data.type && ignoreTypes.includes(data.type)) return

  // 3. [방 번호 검사] recruitId가 있는데 내 방과 다르면 차단
  if (data.recruitId && String(data.recruitId) !== String(roomId.value)) return

  // 4. [필수 데이터 검사] 채팅 메시지의 자격 요건 확인
  // 텍스트(contents)도 없고, 이미지(image) 타입도 아니면 채팅으로 인정하지 않음
  // (이 부분이 없으면 {lat:37...} 같은 객체가 강제로 채팅창에 뜸)
  const hasText = data.contents || data.text || data.msg || data.message || data.content
  const isSpecialType = ['image', 'enter', 'leave', 'system'].includes(data.type)

  if (!hasText && !isSpecialType) return
  // ============================================================

  const now = new Date()
  const timeStr = formatTime(now)

  let textContent = ''
  let userId = 'Unknown'
  let userName = null
  let userImg = null
  let msgType = data.type || 'message'

  if (typeof data === 'object' && data !== null) {
    textContent = data.contents || data.text || data.msg || data.message || data.content
    // [중요 수정] 텍스트가 없다고해서 JSON.stringify(data)를 하는 코드를 삭제했습니다.
    // 위 필터링을 통과했더라도 텍스트가 없으면 빈 문자열로 둡니다.
    if (!textContent && msgType !== 'image') {
       return // 텍스트도 없고 이미지도 아니면 그리지 않음
    }

    userId = data.senderId || data.userId || data.writerIdx || data.sender || 'Unknown'
    userName = data.senderName || data.userName || data.writer || data.name
    userImg =
      data.senderImg ||
      data.senderImageUrl ||
      data.profileImage ||
      data.profileImageUrl ||
      data.userImg ||
      data.img ||
      data.imageUrl ||
      data.image_url
  } else {
    textContent = String(data)
  }

  // 1. 퇴장 처리
  if (msgType === 'leave') {
    if (usersData.value[userId]) {
      delete usersData.value[userId]
      // console.log(`[ChatView] 유저 퇴장: ${userName} (${userId})`)
    }
    messages.value.push({
      id: Date.now() + Math.random(),
      type: 'system',
      text: textContent || '누군가 채팅방을 나갔습니다.',
      time: timeStr,
    })
    return
  }

  // 2. 내가 보낸 메시지 무시
  if (String(userId) === String(myUserId.value)) return

  // 3. 유저 정보 갱신/등록
  if (msgType === 'image' && userImg && userImg === textContent) {
    userImg = null
  }

  if (userId !== 'Unknown' && !usersData.value[userId]) {
    const newUserData = data.user || {}
    usersData.value[userId] = {
      name: userName || '이름 없음',
      img: userImg || getDefaultAvatar(userId),
      lv: newUserData.lv || 'LV. 1',
      meta: newUserData.meta || '정보 없음',
      bio: newUserData.bio || '안녕하세요!',
      score: newUserData.score || 50,
      rank: newUserData.rank || '-',
      stats: newUserData.stats || { time: 0, silent: 0 },
      reviews: newUserData.reviews || [],
    }
  }

  // 4. 입장(enter) 시 Handshake
  if (msgType === 'enter') return

  // 6. 메시지 목록 추가
  const displayUser = buildUserDisplay(userId, userName, userImg)

  messages.value.push({
    id: Date.now() + Math.random(),
    type: msgType === 'message' ? 'other' : msgType,
    userId: userId,
    text: textContent,
    time: timeStr,
    user: displayUser,
  })

  if (document.hidden) {
    chatStore.markUnread(roomId.value)
  }
}

// 퇴장 메시지 전송 (내부용)
/**
 * ==============================================================================
 * 6. LIFECYCLE (생명주기 훅)
 * ==============================================================================
 */
onMounted(async () => {
  const paramId = Number(route.params.id)
  roomId.value = Number.isFinite(paramId) ? paramId : null
  if (roomId.value && recruitId.value !== roomId.value) {
    recruitId.value = roomId.value
  }
  if (roomId.value) {
    chatStore.clearUnread(roomId.value)
  }
  // 1. 내 정보 설정
  if (user.value) {
    myUserId.value = user.value.idx || user.value.id || user.value.userId
    myUserName.value = user.value.nickname || user.value.name || user.value.userName || '익명'
    myUserImg.value = resolveProfileImage(user.value)
  } else {
    showAccessModal(
      '로그인이 필요합니다',
      '채팅방 접근을 위해 로그인해 주세요.',
      '로그인',
      () => router.push('/login'),
    )
    return
  }

  // 2. 초기 데이터 로드
  await fetchInitialData()

  // 3. 웹소켓 연결
  connectWebSocket()

  // 4. 푸시 구독 등록
  registerPushSubscription()
})

watch(
  () => user.value,
  (nextUser) => {
    if (!nextUser) return
    myUserName.value = nextUser.nickname || nextUser.name || nextUser.userName || '익명'
    myUserImg.value = resolveProfileImage(nextUser)
  },
  { immediate: true },
)

watch(
  () => route.params.id,
  async (nextId) => {
    const paramId = Number(nextId)
    roomId.value = Number.isFinite(paramId) ? paramId : null
    if (roomId.value && recruitId.value !== roomId.value) {
      recruitId.value = roomId.value
    }
    if (roomId.value) {
      chatStore.clearUnread(roomId.value)
    }

    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
      isConnected.value = false
    }

    messages.value = []
    hasMore.value = true
    oldestCursor.value = null
    isLoadingMore.value = false
    await fetchInitialData()
    connectWebSocket()
  },
)

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
})
</script>

<template>
  <div class="h-full flex gap-4 p-4 overflow-hidden relative">
    <div class="hidden md:block w-20 shrink-0"></div>

    <main class="flex-1 flex gap-6 overflow-hidden h-[calc(100vh-2rem)]">
      <div
        v-if="isLoading"
        class="flex-1 flex items-center justify-center bg-white/50 rounded-[2.5rem]"
      >
        <p class="text-slate-500 font-bold animate-pulse">대화 내용을 불러오는 중...</p>
      </div>

      <ChatPanel
        v-else
        :messages="messages"
        :has-more="hasMore"
        :is-loading-more="isLoadingMore"
        :ride-info="rideInfo"
        :is-connected="isConnected"
        @send-message="handleSendMessage"
        @send-image="handleSendImage"
        @exit="handleExitRecruit"
        @load-more="loadOlderMessages"
      />

      <RideSidebar :user-profiles="usersData" :ride-info="rideInfo" />
    </main>

    <ChatAccessModal
      :is-open="accessModal.open"
      :title="accessModal.title"
      :message="accessModal.message"
      :confirm-text="accessModal.confirmText"
      @confirm="handleAccessConfirm"
    />
  </div>
</template>
