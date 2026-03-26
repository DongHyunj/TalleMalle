import api from '@/plugins/axiosinterceptor'

/**
 * ==============================================================================
 * API METHODS
 * ==============================================================================
 */

/**
 * 이전 채팅 내역 가져오기
 * @returns {Promise<Array>} 채팅 메시지 배열
 */
const getChatHistory = async (recruitId, options = {}) => {
  const params = {}
  if (options.before) params.before = options.before
  if (options.size) params.size = options.size
  const response = await api.get(`/chat/${recruitId}/messages`, { params })
  return response.data
}

/**
 * 채팅방 참여자 목록 가져오기
 * @returns {Promise<Object>} 사용자 ID를 키로 갖는 유저 정보 객체
 */
const getChatParticipants = async (recruitId) => {
  const response = await api.get(`/recruits/${recruitId}/participants`)
  return response.data
}

/**
 * 여정 상세 정보 가져오기
 * @returns {Promise<Object>} 여정 정보 객체
 */
const getRideDetail = async (recruitId) => {
  const response = await api.get(`/recruit/${recruitId}`)
  return response.data
}

export default {
  getChatHistory,
  getChatParticipants,
  getRideDetail,
  subscribePush: async (payload) => {
    const response = await api.post('/push/subscribe', payload)
    return response.data
  },
  getUnreadChatRooms: async () => {
    const response = await api.get('/chat/unread')
    return response.data
  },
  getChatImagePresign: async (fileName, contentType) => {
    const response = await api.post('/chat/image/presign', { fileName, contentType })
    return response.data
  },
  getChatRooms: async () => {
    const response = await api.get('/chat/rooms')
    return response.data
  },
}
