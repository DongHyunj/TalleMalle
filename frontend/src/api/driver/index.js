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
const login = async (req) => {
  return await api.post('/driver/login', req)
}

const signup = async (req) => {
  return await api.post('/driver/signup', req)
}

const verifyIdentity = async (identityVerificationId) => {
  return await api.post('/driver/verify-identity', { identityVerificationId })
}

const checkEmail = async (email) => {
  return await api.get('/driver/check-email', { params: { email } })
}

const checkNickname = async (nickname) => {
  return await api.get('/driver/check-nickname', { params: { nickname } })
}

const getCallList = async (params = {}) => {
  return await api.get('/call/list', {
    params: { page: 0, size: 20, ...params },
  })
}


const getCallDetail = async (callIdx) => {
  return await api.get(`/call/read/${callIdx}`)
}

const getMyCall = async () => {
  return await api.get('/call/readmycall')
}

/**
 * 콜 수락
 * method: PATCH
 * url: /driver/accept/{callIdx}
 * @param {Number} callIdx
 */
const acceptCall = async (callIdx) => {
  return await api.patch(`/call/accept/${callIdx}`)
}


/**
 * 콜 취소
 * method: PATCH
 * url: /driver/cancel/{callIdx}
 * @param {Number} callIdx
 */
const cancelCall = async (callIdx) => {
  return await api.patch(`/call/cancel/${callIdx}`)
}

const startDriving = async (callIdx) => {
  return await api.patch(`/call/driving/${callIdx}`)
}

const completeCall = async (callIdx) => {
  return await api.patch(`/call/complete/${callIdx}`)
}

const getCallHistory = async (params = {}) => {
  return await api.get('/call/history', {
    params: { page: 0, size: 20, ...params },
  })
}

const getSettlement = async (callIdx) => {
  return await api.get(`/call/settlement/${callIdx}`)
}

/**
 * 탑승객별 등록 결제수단으로 정산 금액 청구 (드라이버 세션 쿠키)
 * @param {{ recruitIdx: number, commission: number, serviceFee: number }} body
 */
const chargePayment = async (body) => {
  return await api.post('/payment/charge', body)
}

export default {
  getCallList,
  getCallDetail,
  getMyCall,
  acceptCall,
  cancelCall,
  startDriving,
  completeCall,
  getCallHistory,
  getSettlement,
  chargePayment,
  login,
  signup,
  verifyIdentity,
  checkEmail,
  checkNickname,
}
