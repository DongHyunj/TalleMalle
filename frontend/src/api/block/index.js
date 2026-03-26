/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import api from '@/plugins/axiosinterceptor'

/**
 * ==============================================================================
 * 2. METHODS - API SERVICE METHODS (차단 관련 API 서비스)
 * ==============================================================================
 */
/**
 * 차단된 사용자 목록 조회
 * @param {Object} req - 요청 파라미터
 * @returns {Promise<Array>} 차단된 사용자 리스트 데이터
 */
const blockList = async (req) => {
  const res = await api.get('/json/block_list', req)

  return res.data
}

export default { blockList }