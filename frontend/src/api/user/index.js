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
  return await api.post('/user/login', req, {
    withCredentials: true
  })
}

const getMe = async () => {
  return await api.get('/user/me')
}

const logout = async (req) => {
  return await api.post('/user/logout', req)
}

const signup = async (req) => {
  return await api.post('/user/signup', req)
}

const extraSignup = async (req) => {
  return await api.patch('/user/signup/extra', req)
}

const verifyIdentity = async (identityVerificationId) => {
  return await api.post('/user/verify-identity', { identityVerificationId })
}

const emailDoubleCheck = async (email) => {
  return await api.get('/user/signup/check-email', { params: { email: email } })
}

const nicknameDoubleCheck = async (nickname) => {
  return await api.get('/user/signup/check-nickname', { params: { nickname: nickname } })
}

const resendVerify = async (email) => {
  const params = new URLSearchParams()
  params.append('email', email) // 백엔드의 @RequestParam("email")과 일치

  return await api.post('/user/resend-verify', params)
}

export default {
  login,
  getMe,
  logout,
  signup,
  extraSignup,
  verifyIdentity,
  emailDoubleCheck,
  nicknameDoubleCheck,
  resendVerify,
}