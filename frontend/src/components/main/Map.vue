<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, shallowRef, onMounted, watch, nextTick } from 'vue'
import taxiImg from '@/assets/images/taxi.png'

/**
 * ==============================================================================
 * 2. CONFIG & PROPS
 * ==============================================================================
 */
// 부모(Main.vue)에게 받는 데이터
const props = defineProps({
  recruitList: { type: Array, default: () => [] },
  // 중심 이동 오프셋 (px 단위)
  centerOffset: { type: Number, default: 0 },
})

const emit = defineEmits(['update-location', 'marker-click', 'update-visible-list', 'bounds-changed'])

/**
 * ==============================================================================
 * 3. STATE & REFS
 * ==============================================================================
 */
const mapContainer = ref(null)
const mapInstance = shallowRef(null)
const myMarker = shallowRef(null)
const driverMarker = shallowRef(null)
const recruitMarkers = shallowRef(new Map())
let polyline = null // 경로 선 객체

// 초기 위치 (강남역 부근)
const lat = ref(37.498095)
const lng = ref(127.02761)

/**
 * ==============================================================================
 * 4. METHODS - UI & LOGIC (기능 처리 및 이벤트 핸들러)
 * ==============================================================================
 */
// 카카오 장소 검색
const searchPlace = (keyword) => {
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
    alert('카카오맵 서비스 라이브러리가 로드되지 않았습니다. (index.html 확인 필요)')
    return
  }

  // 장소 검색 객체를 생성합니다
  const ps = new window.kakao.maps.services.Places()

  // 키워드로 장소를 검색합니다
  ps.keywordSearch(keyword, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      // 검색된 첫 번째 결과의 좌표
      const targetLat = data[0].y
      const targetLng = data[0].x

      // 동네가 잘 보이도록 줌 레벨 살짝 당겨주기 (선택 사항)
      if (mapInstance.value) {
        mapInstance.value.setLevel(4)
      }

      // 지도 중심을 부드럽게 이동 (오프셋 적용)
      handleMoveWithOffset(targetLat, targetLng)
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.')
    } else if (status === window.kakao.maps.services.Status.ERROR) {
      alert('검색 중 오류가 발생했습니다.')
    }
  })
}

// 오프셋을 적용한 좌표 이동 핸들러
// 지도 중심 이동 (오프셋 적용)
const handleMoveWithOffset = (targetLat, targetLng) => {
  if (!mapInstance.value || !targetLat || !targetLng) return

  const map = mapInstance.value
  const targetPosition = new window.kakao.maps.LatLng(targetLat, targetLng)

  // 오프셋이 없으면 그냥 이동
  if (props.centerOffset === 0) {
    map.panTo(targetPosition)
    return
  }

  // [카카오 지도 Projection 사용]
  // 위도/경도를 화면상의 픽셀 좌표(Point)로 변환
  const projection = map.getProjection()
  const targetPoint = projection.pointFromCoords(targetPosition)

  // 오프셋만큼 중심점을 왼쪽(-)으로 이동
  // (지도의 중심을 왼쪽으로 옮겨야, 우리가 원하는 타겟 마커가 화면 오른쪽에 옴)
  const newCenterPoint = new window.kakao.maps.Point(targetPoint.x - props.centerOffset, targetPoint.y)

  // 다시 픽셀 좌표를 위도/경도로 변환
  const newCenterPosition = projection.coordsFromPoint(newCenterPoint)

  // 이동
  map.panTo(newCenterPosition)
}

// 화면에 보이는 마커만 표시 핸들러
const handleUpdateVisibleMarkers = () => {
  // Map size 체크
  if (!mapInstance.value || recruitMarkers.value.size === 0) return

  // 현재 지도의 영역(Bounds) 가져오기
  const bounds = mapInstance.value.getBounds()
  // 화면에 보이는 모집글 ID들을 담을 배열
  const visibleIds = []

  // Map.forEach는 (value, key) 순서로 들어옴 value가 마커 객체
  recruitMarkers.value.forEach((marker) => {
    // 마커의 위치가 현재 영역 안에 있는지 확인 (카카오 API 제공)
    if (bounds.contain(marker.getPosition())) {
      // 영역 안이면 보이기
      if (!marker.getMap()) marker.setMap(mapInstance.value)
      // 보이는 마커의 ID를 배열에 추가
      if (marker.recruitId) visibleIds.push(marker.recruitId)
    } else {
      // 영역 밖이면 숨기기
      if (marker.getMap()) marker.setMap(null)
    }
  })
  emit('update-visible-list', visibleIds)
}

// --- 모집글 마커 업데이트 핸들러 (Diffing 로직 적용) ---
// 모집글 마커 업데이트
const handleUpdateRecruitMarkers = () => {
  if (!mapInstance.value) return

  const newRecruitIds = new Set(props.recruitList.map((r) => r.id))

  // 리스트에 없는 마커 지도에서 제거
  for (const [id, marker] of recruitMarkers.value) {
    if (!newRecruitIds.has(id)) {
      marker.setMap(null)
      recruitMarkers.value.delete(id)
    }
  }

  // 마커 생성 및 갱신 (직접 DOM 조작 방식)
  props.recruitList.forEach((recruit) => {
    if (!recruit.startLat || !recruit.startLng) return

    //  HTML 내용을 그려주는 헬퍼 함수
    const updateNodeContent = (node, r) => {
      const isFull = r.cur >= r.max
      const bgColor = isFull ? '#64748b' : '#f43f5e'
      node.innerHTML = `
                <div class="pin-head" style="background-color: ${bgColor}; border-color: white;">
                    <span class="text-xs font-bold">${r.cur}/${r.max}</span>
                </div>
                <div class="pin-tail" style="border-top-color: ${bgColor};"></div>
            `
    }

    // 이미 지도에 있는 마커라면
    if (recruitMarkers.value.has(recruit.id)) {
      const existingOverlay = recruitMarkers.value.get(recruit.id)
      // 클릭 시 옛날 데이터가 안 뜨도록 최신 데이터 갱신
      existingOverlay.recruitData = recruit
      // 카카오맵 렌더링 무시하고 브라우저 HTML 노드에 직접 새 숫자 덮어쓰기! (깜빡임 절대 없음)
      updateNodeContent(existingOverlay.contentNode, recruit)
      return // 새로 만들지 않고 여기서 종료
    }

    // 지도에 없는 새 마커라면 새로 만들기
    const contentNode = document.createElement('div')
    contentNode.className = 'marker-pin'
    updateNodeContent(contentNode, recruit)

    const loc = new window.kakao.maps.LatLng(recruit.startLat, recruit.startLng)
    const overlay = new window.kakao.maps.CustomOverlay({
      position: loc,
      content: contentNode,
      yAnchor: 1,
      zIndex: 50,
    })

    // 오버레이 객체에 중요한 정보들을 다 저장해둡니다.
    overlay.recruitId = recruit.id
    overlay.recruitData = recruit // 클릭 이벤트를 위한 최신 데이터
    overlay.contentNode = contentNode

    // 클릭 이벤트 (항상 overlay 안에 저장된 최신 데이터를 부모로 올리게 세팅)
    contentNode.addEventListener('click', () => {
      emit('marker-click', overlay.recruitData)
    })

    overlay.setMap(mapInstance.value)
    recruitMarkers.value.set(recruit.id, overlay)
  })

  // 보이는 목록 갱신
  handleUpdateVisibleMarkers()
}

// 내 위치 마커 업데이트 핸들러
const handleUpdateMyMarker = () => {
  if (!mapInstance.value || !window.kakao) return
  const loc = new window.kakao.maps.LatLng(lat.value, lng.value)

  if (!myMarker.value) {
    const content = '<div class="w-6 h-6 bg-indigo-600 rounded-full border-[3px] border-white shadow-lg pulse-animation"></div>'
    myMarker.value = new window.kakao.maps.CustomOverlay({
      map: mapInstance.value,
      position: loc,
      content: content,
      yAnchor: 0.5,
      zIndex: 100,
    })
    handleMoveWithOffset(lat.value, lng.value)
  } else {
    myMarker.value.setPosition(loc)
  }
}

// 기사님 차량 마커 업데이트 핸들러
const handleUpdateDriverMarker = ({ lat, lng, bearing }) => {
  if (!mapInstance.value || !window.kakao) return

  const loc = new window.kakao.maps.LatLng(lat, lng)

  if (!driverMarker.value) {
    const wrapper = document.createElement('div')
    wrapper.className = 'driver-marker-wrapper'

    const carImg = document.createElement('img')
    carImg.src = taxiImg
    carImg.className = 'driver-car-img'

    wrapper.appendChild(carImg)

    const overlay = new window.kakao.maps.CustomOverlay({
      map: mapInstance.value,
      position: loc,
      content: wrapper,
      yAnchor: 0.5,
      zIndex: 200,
    })
    overlay.carElement = carImg
    driverMarker.value = overlay
  } else {
    driverMarker.value.setPosition(loc)
    if (driverMarker.value.carElement) {
      driverMarker.value.carElement.style.transform = `rotate(${bearing}deg)`
    }
  }
}

// 경로 선 그리기 핸들러
const handleDrawPath = (pathData) => {
  if (!mapInstance.value || !pathData) return

  if (polyline) polyline.setMap(null)

  const linePath = pathData.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng))

  polyline = new window.kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 6,
    strokeColor: '#6366f1',
    strokeOpacity: 0.8,
    strokeStyle: 'solid',
  })
  polyline.setMap(mapInstance.value)
}

// 줌 인 핸들러
const handleZoomIn = () => mapInstance.value?.setLevel(mapInstance.value.getLevel() - 1)
// 줌 아웃 핸들러
const handleZoomOut = () => mapInstance.value?.setLevel(mapInstance.value.getLevel() + 1)
// 내 위치로 이동 핸들러
const handlePanToCurrent = () => handleMoveWithOffset(lat.value, lng.value)
// 특정 위치로 이동 핸들러
const handleMoveToLocation = (tLat, tLng) => handleMoveWithOffset(tLat, tLng)

/**
 * ==============================================================================
 * 5. METHODS - DATA & NETWORK (데이터 초기화)
 * ==============================================================================
 */
const initializeGeolocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (pos) => {
        lat.value = pos.coords.latitude
        lng.value = pos.coords.longitude
        handleUpdateMyMarker()
        emit('update-location', { lat: lat.value, lng: lng.value })
      },
      (err) => {
        // console.warn(err)
      },
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }
}

// recruitList가 변하면(글이 추가되면) 마커를 다시 그립니다.
watch(
  () => props.recruitList,
  (newList) => {
    // console.log('👀 [Map.vue] 데이터 변경 감지! 마커 내용 덮어쓰기 실행!', newList)
    handleUpdateRecruitMarkers()
  },
  { deep: true },
)

/**
 * ==============================================================================
 * 6. LIFECYCLE
 * ==============================================================================
 */
onMounted(() => {
  // console.log("🚀 onMounted 실행! 지도 그리기 시작!")

  const initMap = () => {
    if (!mapContainer.value) return

    const options = {
      center: new window.kakao.maps.LatLng(lat.value, lng.value),
      level: 3,
    }

    mapInstance.value = new window.kakao.maps.Map(mapContainer.value, options)

    initializeGeolocation()

    window.kakao.maps.event.addListener(mapInstance.value, 'idle', () => {
      handleUpdateVisibleMarkers()

      // 현재 지도의 경계 영역 좌표 구하기
      const bounds = mapInstance.value.getBounds()
      const swLatLng = bounds.getSouthWest()
      const neLatLng = bounds.getNorthEast()

      // 부모(Main.vue)에게 좌표 보내기
      emit('bounds-changed', {
        swLat: swLatLng.getLat(),
        swLng: swLatLng.getLng(),
        neLat: neLatLng.getLat(),
        neLng: neLatLng.getLng(),
      })
    })

    if (props.recruitList.length > 0) {
      handleUpdateRecruitMarkers()
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.value && mapContainer.value && mapContainer.value.clientWidth > 0) {
        mapInstance.value.relayout()
      }
    })

    if (mapContainer.value) {
      resizeObserver.observe(mapContainer.value)
    }
  }

  nextTick(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap)
    } else {
      // console.error("Kakao Maps script not loaded");
    }
  })
})

defineExpose({
  zoomIn: handleZoomIn,
  zoomOut: handleZoomOut,
  panToCurrent: handlePanToCurrent,
  moveToLocation: handleMoveToLocation,
  updateDriverMarker: handleUpdateDriverMarker,
  drawPath: handleDrawPath,
  searchPlace,
})
</script>

<template>
  <div ref="mapContainer" class="absolute inset-0 w-full h-full z-0"></div>
</template>

<style>
/* 전역 스타일 */
.pulse-animation {
  animation: pulse 2s infinite;
}

/* 모집글 마커 스타일 */
.marker-pin {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s;
}

.marker-pin:hover {
  transform: scale(1.1) translateY(-5px);
  z-index: 100;
}

.pin-head {
  width: 40px;
  height: 40px;
  background-color: #f43f5e;
  /* Rose-500 */
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.pin-tail {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid #f43f5e;
  margin-top: -2px;
}

.driver-marker-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.driver-car-body {
  width: 22px;
  height: 42px;
  background-color: #4f46e5;
  border: 2px solid white;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  position: relative;
  transition: transform 0.1s linear;
}

.driver-car-body::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 2px;
  right: 2px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}
</style>