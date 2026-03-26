<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Radio, List, ClipboardList, MapPin, LogOut } from 'lucide-vue-next'
import driverApi from '@/api/driver'
import { useWebSocket } from '@/composables/useWebSocket'
import { useDriverStore } from '@/stores/driver'
import taxiImg from '@/assets/images/taxi.png'

// Components
import DriverLogoHeader from '@/components/driver/DriverLogoHeader.vue'
import DriverIncomeWidget from '@/components/driver/DriverIncomeWidget.vue'
import DriverMapControls from '@/components/driver/DriverMapControls.vue'
import DriverNavHeader from '@/components/driver/DriverNavHeader.vue'
import DriverPickupSheet from '@/components/driver/DriverPickupSheet.vue'
import DriverCallModal from '@/components/driver/DriverCallModal.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
const router = useRouter()
const driverStore = useDriverStore()
const { connect, sendMessage, isConnected, disconnect } = useWebSocket()

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
// UI 상태
const isDriving = ref(false)
const isTrafficOn = ref(false)
const showCallModal = ref(false)
const showPickupSheet = ref(false)
const errorMessage = ref('')

// 운행 데이터
const currentFare = ref(4800)
const todayIncome = ref(0)
const naviTitle = ref('운행 대기 중')
const naviSub = ref('주변의 콜을 기다리세요')
const etaText = ref('--분')
const passengerName = ref('손님')
const callInfo = ref({ departure: '', destination: '', path: [] })
const currentCallIdx = ref(null)
const currentRecruitIdx = ref(null)
const myCallInfo = ref(null)
const isArrived = ref(false)

// 지도 관련 비반응형 변수 (퍼포먼스 고려)
let map = null
let driverMarker = null
let polyline = null
let driveInterval = null

/** GPS 실패·거부 시 카카오 기본 중심(강남 일대) */
const DEFAULT_LAT = 37.499935
const DEFAULT_LNG = 126.927324
let myLat = DEFAULT_LAT
let myLng = DEFAULT_LNG

/**
 * 브라우저 GPS로 myLat/myLng 갱신. 지도·마커가 있고 운행 시뮬레이션 중이 아니면 화면도 맞춤.
 * @returns {Promise<boolean>} 위치를 받았으면 true
 */
const refreshMyLocationFromGps = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        myLat = pos.coords.latitude
        myLng = pos.coords.longitude
        if (map && driverMarker && !driveInterval) {
          const latlng = new window.kakao.maps.LatLng(myLat, myLng)
          driverMarker.setPosition(latlng)
          map.setCenter(latlng)
        }
        resolve(true)
      },
      () => resolve(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30_000 },
    )
  })

/**
 * ==============================================================================
 * 4. METHODS - FUNCTIONAL (지도 로직 및 UI 핸들러)
 * ==============================================================================
 */
// 지도 초기화
const initMap = () => {
  const container = document.getElementById('map')
  map = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(myLat, myLng), level: 4 })

  driverMarker = new window.kakao.maps.CustomOverlay({
    position: new window.kakao.maps.LatLng(myLat, myLng),
    content: `
      <div class="car-marker-container">
        <img id="car-body" src="${taxiImg}" class="car-image" alt="Taxi Marker" />
      </div>
    `,
    map: null, // 택시를 처음에는 지도에 표시하지 않음 
  })
}

const unwrapApi = (res) => res?.data?.result ?? res?.data

const extractCallList = (body) => {
  if (!body) return []
  if (Array.isArray(body)) return body
  if (Array.isArray(body.content)) return body.content
  return []
}

const pathFromCoords = (slat, slng, elat, elng) => {
  if (slat == null || slng == null || elat == null || elng == null) return []
  return [
    { lat: Number(slat), lng: Number(slng) },
    { lat: Number(elat), lng: Number(elng) },
  ]
}

const applyRecruitPayload = (p) => {
  if (!p || typeof p !== 'object') return
  const departure = p.startPointName || p.start || p.departure || ''
  const destination = p.destPointName || p.dest || p.destination || ''
  callInfo.value = {
    departure: departure || callInfo.value.departure,
    destination: destination || callInfo.value.destination,
    path: pathFromCoords(p.startLat, p.startLng, p.destLat, p.destLng),
  }
}

const applyCallDetail = (d) => {
  if (!d || typeof d !== 'object') return
  currentCallIdx.value = d.callIdx ?? currentCallIdx.value
  currentRecruitIdx.value = d.recruitIdx ?? currentRecruitIdx.value
  callInfo.value = {
    departure: d.startLocation || '',
    destination: d.endLocation || '',
    path: pathFromCoords(d.startLat, d.startLng, d.endLat, d.endLng),
  }
  if (typeof d.estimatedFare === 'number') currentFare.value = d.estimatedFare
}

/** 대기 콜 1건을 불러와 모달에 표시 (소켓: 모집 채움 등 — 자동 배차 알림용) */
const loadLatestWaitingCallAndShowModal = async () => {
  errorMessage.value = ''
  try {
    const res = await driverApi.getCallList({ page: 0, size: 30 })
    const list = extractCallList(unwrapApi(res))
    const waiting = list.filter((c) => (c.status || '').toString().toUpperCase() === 'WAITING')
    if (!waiting.length) {
      showToastError('대기 중인 콜이 없습니다.')
      return
    }
    waiting.sort((a, b) => (b.callIdx || 0) - (a.callIdx || 0))
    const top = waiting[0]
    currentCallIdx.value = top.callIdx

    const detailRes = await driverApi.getCallDetail(top.callIdx)
    const d = unwrapApi(detailRes)
    applyCallDetail(d)
    showCallModal.value = true
  } catch (_) {
    showToastError('콜 정보를 불러오지 못했습니다.')
  }
}

// 콜 받기: 최신 대기 콜이 아니라 내가 수락한 콜(readmycall) 기준으로 상세 로드 → 픽업 시트(또는 이미 운행 중이면 주행 UI)
const beginAcceptedCallFlow = async () => {
  errorMessage.value = ''
  let accepted = null
  try {
    const res = await driverApi.getMyCall()
    accepted = unwrapApi(res)
  } catch (_) {
    accepted = null
  }
  if (!accepted?.callIdx) {
    showToastError('수락한 콜이 없습니다. 콜 목록에서 콜을 수락해 주세요.')
    router.push('/driver/calls')
    return
  }
  try {
    const detailRes = await driverApi.getCallDetail(accepted.callIdx)
    const d = unwrapApi(detailRes)
    applyCallDetail(d)
    myCallInfo.value = {
      callIdx: d.callIdx,
      startLocation: d.startLocation,
      endLocation: d.endLocation,
      recruitIdx: d.recruitIdx,
    }
    showCallModal.value = false
    const st = (d.status || '').toString().toUpperCase()
    if (st === 'DRIVING') {
      showPickupSheet.value = false
      isArrived.value = false
      isDriving.value = true
      naviTitle.value = '목적지로 이동 중'
      naviSub.value = '안전 운전 하세요'
      if (callInfo.value.path?.length > 0) {
        if (isConnected.value && currentRecruitIdx.value) {
          sendMessage(
            `/app/chat/send/${currentRecruitIdx.value}`,
            JSON.stringify({
              type: 'drivingPath',
              contents: JSON.stringify(callInfo.value.path),
            }),
          )
        }
        runDriveSimulation(callInfo.value.path)
      }
    } else {
      showPickupSheet.value = true
    }
  } catch (_) {
    showToastError('콜 정보를 불러오지 못했습니다.')
  }
}

// 콜 수락 처리 (서버 반영 후 픽업 시트)
const acceptCall = async () => {
  if (!currentCallIdx.value) {
    showCallModal.value = false
    return
  }
  try {
    await driverApi.acceptCall(currentCallIdx.value)
    showCallModal.value = false
    showPickupSheet.value = true
    myCallInfo.value = {
      callIdx: currentCallIdx.value,
      startLocation: callInfo.value.departure,
      endLocation: callInfo.value.destination,
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.result || '콜 수락에 실패했습니다.'
    showToastError(typeof msg === 'string' ? msg : '콜 수락에 실패했습니다.')
  }
}

// 운행 종료 처리
const completeRide = async () => {
  if (!currentCallIdx.value) return
  try {
    await driverApi.completeCall(currentCallIdx.value)
    router.push(`/driver/settlement/${currentCallIdx.value}`)
  } catch (error) {
    showToastError('운행 종료에 실패했습니다.')
  }
}

// 운행 시작 (네비게이션)
const startNavigation = async () => {
  if (currentCallIdx.value) {
    try {
      await driverApi.startDriving(currentCallIdx.value)
    } catch (error) {
      showToastError('운행 시작 처리에 실패했습니다.')
      return
    }
  }

  showPickupSheet.value = false
  isDriving.value = true
  naviTitle.value = '목적지로 이동 중'
  naviSub.value = '안전 운전 하세요'

  if (callInfo.value.path?.length > 0) {
    if (isConnected.value && currentRecruitIdx.value) {
      sendMessage(
        `/app/chat/send/${currentRecruitIdx.value}`,
        JSON.stringify({
          type: 'drivingPath',
          contents: JSON.stringify(callInfo.value.path),
        }),
      )
    }
    runDriveSimulation(callInfo.value.path)
  }
}

// 주행 시뮬레이션 로직
const runDriveSimulation = (pathData) => {
  if (driverMarker) driverMarker.setMap(map)

  etaText.value = '15분'
  const linePath = pathData.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))

  if (polyline) polyline.setMap(null)
  polyline = new window.kakao.maps.Polyline({
    path: linePath, strokeWeight: 6, strokeColor: '#6366f1', strokeOpacity: 0.8, strokeStyle: 'solid'
  })
  polyline.setMap(map)

  const bounds = new window.kakao.maps.LatLngBounds()
  linePath.forEach(p => bounds.extend(p))
  map.setBounds(bounds)

  const splitCount = 200
  const smoothPath = subdividePath(pathData, splitCount)

  let index = 0
  if (driveInterval) clearInterval(driveInterval)

  driveInterval = setInterval(() => {
    if (index >= smoothPath.length) {
      clearInterval(driveInterval)
      naviTitle.value = '목적지 도착'
      naviSub.value = '운행을 종료해주세요'
      isDriving.value = false
      isArrived.value = true
      return
    }

    const currentPoint = smoothPath[index]
    const pos = new window.kakao.maps.LatLng(currentPoint.lat, currentPoint.lng)

    driverMarker.setPosition(pos)

    // 이미지 회전 (id="car-body"를 찾아 회전시킴)
    const carEl = document.getElementById('car-body')
    if (carEl) carEl.style.transform = `rotate(${currentPoint.bearing || 0}deg)`

    if (index % 20 === 0) map.panTo(pos)

    // 위치 전송 (API/Socket 연동이 섞여있지만 시뮬레이션 루프의 일부라 여기에 배치)
    if (index % 20 === 0 && isConnected.value && currentRecruitIdx.value) {
      sendMessage(
        `/app/chat/send/${currentRecruitIdx.value}`,
        JSON.stringify({
          type: 'driverLocation',
          contents: JSON.stringify({
            lat: currentPoint.lat,
            lng: currentPoint.lng,
            bearing: currentPoint.bearing || 0,
          }),
        }),
      )
    }
    index++
  }, 20)
}

// 수학/계산 헬퍼 함수들
const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const startLatRad = startLat * (Math.PI / 180)
  const startLngRad = startLng * (Math.PI / 180)
  const endLatRad = endLat * (Math.PI / 180)
  const endLngRad = endLng * (Math.PI / 180)
  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad)
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad)
  const brng = Math.atan2(y, x)
  return (brng * 180 / Math.PI + 360) % 360
}

const subdividePath = (pathData, splitCount) => {
  const smoothPath = []
  for (let i = 0; i < pathData.length - 1; i++) {
    const start = pathData[i]
    const end = pathData[i + 1]
    const bearing = calculateBearing(start.lat, start.lng, end.lat, end.lng)
    for (let j = 0; j < splitCount; j++) {
      const lat = start.lat + (end.lat - start.lat) * (j / splitCount)
      const lng = start.lng + (end.lng - start.lng) * (j / splitCount)
      smoothPath.push({ lat, lng, bearing })
    }
  }
  return smoothPath
}

// UI 제어 헬퍼
const toggleTraffic = () => {
  isTrafficOn.value = !isTrafficOn.value
  isTrafficOn.value
    ? map.addOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC)
    : map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC)
}

const recenterMap = async () => {
  if (!map) return
  if (driveInterval) {
    if (driverMarker) map.panTo(driverMarker.getPosition())
    return
  }
  await refreshMyLocationFromGps()
  if (driverMarker) map.panTo(driverMarker.getPosition())
}

const showToastError = (msg) => {
  errorMessage.value = msg
  setTimeout(() => { errorMessage.value = '' }, 3000)
}

/**
 * ==============================================================================
 * 5. METHODS - API & NETWORK (서버 연동 및 소켓)
 * ==============================================================================
 */
// 하단 「콜 받기」: 내가 수락한 콜(readmycall) 기준으로 픽업·주행 흐름
const triggerCall = () => beginAcceptedCallFlow()

const handleDriverLogout = () => {
  if (!window.confirm('로그아웃 하시겠습니까?')) return
  disconnect()
  driverStore.logout()
}

// 소켓 메시지 핸들러 (/topic/all-calls, /topic/complete)
const handleSocketMessage = (e) => {
  try {
    if (!e?.data) return
    let data = JSON.parse(e.data)

    if (data.payload && typeof data.payload === 'string') {
      try {
        const inner = JSON.parse(data.payload)
        if (inner && typeof inner === 'object') {
          data = { ...data, payload: inner }
        }
      } catch {
        /* payload가 "EW_CALL_ADDED" 같은 문자열 */
      }
    }

    // 새 모집글 (출발/도착만 프리필 — 실제 콜은 스케줄러 이후 생김)
    if (data.type === 'newRecruit' || data.type === 'createRecruit') {
      if (data.payload && typeof data.payload === 'object') {
        applyRecruitPayload(data.payload)
      }
    }

    // 스케줄러가 콜 생성 후 송신 (CallService.notifyNewCall → /topic/complete)
    if (data.type === 'recruitFull') {
      loadLatestWaitingCallAndShowModal()
      return
    }

    // 모집 상태가 CALLING으로 바뀐 직후 콜이 생긴 경우
    if (data.type === 'updateRecruit' && data.payload?.status === 'CALLING') {
      loadLatestWaitingCallAndShowModal()
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * ==============================================================================
 * 6. LIFECYCLE
 * ==============================================================================
 */
onMounted(async () => {
  // 1. 진행 중인 콜 조회 + 오늘 수익 계산
  try {
    const res = await driverApi.getMyCall()
    const body = unwrapApi(res)
    if (body?.callIdx) {
      currentCallIdx.value = body.callIdx
      currentRecruitIdx.value = body.recruitIdx ?? currentRecruitIdx.value
      myCallInfo.value = body
    }
  } catch (_) { /* 진행 중인 콜 없음 */ }

  try {
    const historyRes = await driverApi.getCallHistory()
    const hBody = unwrapApi(historyRes)
    const rows = Array.isArray(hBody) ? hBody : hBody?.content ?? []
    todayIncome.value = rows.reduce((sum, c) => sum + (c.estimatedFare || 0), 0)
  } catch (_) { /* 내역 없음 */ }

  // 2. 소켓 연결
  const baseUrl = import.meta.env.VITE_WS_URL
  const socketUrl = `${baseUrl}`
  connect(socketUrl, handleSocketMessage)

  // 3. 카카오맵 SDK 로드
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY
  const script = document.createElement('script')
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_KEY}&libraries=services`
  script.onload = () =>
    window.kakao.maps.load(async () => {
      await refreshMyLocationFromGps()
      initMap()
    })
  document.head.appendChild(script)
})

onUnmounted(() => {
  if (driveInterval) clearInterval(driveInterval)
})
</script>

<template>
  <div class="h-full w-full relative bg-slate-900 overflow-hidden font-pretendard">
    <div id="map" class="w-full h-full kakao-dark-mode absolute inset-0 z-0"></div>

    <DriverNavHeader :is-driving="isDriving" :title="naviTitle" :sub-title="naviSub" :eta="etaText"
      :fare="currentFare" />

    <DriverLogoHeader v-if="!isDriving" />

    <div v-if="!isDriving" class="absolute top-6 right-4 z-20">
      <DriverIncomeWidget :income="todayIncome" />
    </div>

    <!-- 수락한 콜 카드 -->
    <div
      v-if="!isDriving && !showPickupSheet && !isArrived && myCallInfo"
      class="absolute top-20 left-4 z-20 cursor-pointer active:scale-95 transition-transform"
      @click="showPickupSheet = true"
    >
      <div class="bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl max-w-[200px]">
        <p class="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block"></span>
          수락한 콜
        </p>
        <p class="text-white text-xs font-bold truncate">{{ myCallInfo.startLocation }}</p>
        <p class="text-slate-400 text-[11px] truncate mt-0.5">→ {{ myCallInfo.endLocation }}</p>
      </div>
    </div>

    <div class="absolute right-4 top-28 z-20">
      <DriverMapControls :is-traffic-on="isTrafficOn" @toggle-traffic="toggleTraffic" @recenter="recenterMap" />
    </div>

    <!-- 대기 중 하단 네비게이션 -->
    <div v-if="!isDriving && !showPickupSheet && !isArrived"
      class="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-safe mb-5">
      <div class="bg-slate-950/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex items-center gap-2 px-5 py-3">

        <button @click="router.push('/driver/calls')"
          class="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-400 active:scale-90 transition-all px-4 py-1">
          <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <List class="w-4 h-4" />
          </div>
          <span class="text-[10px] font-bold tracking-wide">콜 목록</span>
        </button>

        <!-- 중앙 콜 버튼 -->
        <button @click="triggerCall"
          class="relative flex flex-col items-center gap-1 active:scale-90 transition-all mx-3 -mt-5">
          <div class="absolute -inset-2 rounded-full bg-indigo-500/20 animate-ping"></div>
          <div class="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 border-4 border-slate-950/80">
            <Radio class="w-6 h-6 text-white" />
          </div>
          <span class="text-[10px] font-bold text-indigo-400 tracking-wide">콜 주행</span>
        </button>

        <button @click="router.push('/driver/history')"
          class="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-400 active:scale-90 transition-all px-4 py-1">
          <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <ClipboardList class="w-4 h-4" />
          </div>
          <span class="text-[10px] font-bold tracking-wide">운행 내역</span>
        </button>

        <button @click="handleDriverLogout"
          class="flex flex-col items-center gap-1 text-slate-500 hover:text-rose-400 active:scale-90 transition-all px-2 py-1">
          <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <LogOut class="w-4 h-4" />
          </div>
          <span class="text-[10px] font-bold tracking-wide">로그아웃</span>
        </button>
      </div>
    </div>

    <!-- 운행 종료 버튼 (운행 중 또는 도착 시) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="isDriving || isArrived"
        class="absolute inset-x-0 bottom-0 z-20 pb-safe px-4 mb-5">
        <button @click="completeRide"
          class="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.98] text-white text-base font-black rounded-2xl shadow-2xl shadow-rose-500/30 transition-all flex items-center justify-center gap-2 border border-rose-500/30"
          :class="isArrived ? 'animate-pulse' : ''"
        >
          <span class="text-lg">🏁</span>
          {{ isArrived ? '도착 완료 · 운행 종료' : '운행 종료' }}
        </button>
      </div>
    </Transition>

    <DriverPickupSheet :show="showPickupSheet" :passenger-name="passengerName"
      :location="callInfo.departure || '위치 정보 확인 중'" @start-drive="startNavigation" />

    <DriverCallModal :show="showCallModal" :departure="callInfo.departure" :destination="callInfo.destination"
      @accept="acceptCall" @reject="showCallModal = false" />
  </div>
</template>

<style scoped>
.kakao-dark-mode {
  filter: invert(92%) hue-rotate(180deg) brightness(95%) contrast(90%) saturate(80%);
}

:deep(.car-marker-container) {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

:deep(.car-image) {
  width: 50px;
  height: auto;
  transition: transform 0.1s linear;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>