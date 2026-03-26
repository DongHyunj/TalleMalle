import api from '@/plugins/axiosinterceptor'

/**
 * 알림 리스트 데이터 요청 (로그인한 유저의 데이터만 가져옴)
 * 백엔드에서 @AuthenticationPrincipal로 유저를 식별하므로 idx를 보낼 필요 없음
 */
const authHeader = () => {
  const token = localStorage.getItem('ATOKEN')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const getNotificationList = (page = 0, size = 10) => {
  return api.get('/notification/list', {
    params: {
      page: page,
      size: size,
    },
    headers: authHeader(),
  })
}

/**
 * 최신 알림 요약 데이터 요청
 */
const getNotificationSummary = () => {
  return api.get('/notification/summary', { headers: authHeader() })
}

/**
 * 단일 알림 읽음 처리
 * @param {number} idx - 알림 자체의 PK (notification 테이블의 idx)
 */
const readNotification = (idx) => {
  return api.patch(`/notification/readonly/${idx}`, {}, { headers: authHeader() })
}

/**
 * 모든 알림 읽음 처리
 */
const readAllNotifications = () => {
  return api.patch('/notification/readall', {}, { headers: authHeader() })
}

export default {
  getNotificationList,
  getNotificationSummary,
  readNotification,
  readAllNotifications,
}
