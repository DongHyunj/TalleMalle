/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import api from '@/plugins/axiosinterceptor'

/**
 * ==============================================================================
 * 2. METHODS - API SERVICE METHODS
 * ==============================================================================
 */

/**
 * 로그인 유저 Bearer 토큰 (JWT)
 */
const authHeader = () => {
  const token = localStorage.getItem('ATOKEN')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * 모집·콜(매칭) 웹푸시 수신 동의 조회
 * GET /push/preferences
 */
const getPreferences = () => {
  return api.get('/push/preferences', { headers: authHeader() })
}

/**
 * 모집·콜(매칭) 웹푸시 수신 동의 저장
 * PATCH /push/preferences
 * @param {boolean} recruitPromotionPushEnabled
 */
const patchRecruitPromotionPush = (recruitPromotionPushEnabled) => {
  return api.patch(
    '/push/preferences',
    { recruitPromotionPushEnabled },
    { headers: authHeader() },
  )
}

export default {
  getPreferences,
  patchRecruitPromotionPush,
}
