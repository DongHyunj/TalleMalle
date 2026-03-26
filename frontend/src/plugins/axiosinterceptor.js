import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  withCredentials: true // 쿠키 httpOnly일때 필수
})

api.interceptors.request.use(
  (config) => {
    // console.log('요청 보내기 전에 실행')
    return config
  },
  (error) => {
    // console.log('요청 보낼 때 에러 발생')
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (config) => {
    // console.log('응답 받아서 화면에 띄우기 전에 실행')
    return config
  },
  (error) => {
    // console.log('응답 받을 때 에러 발생')
    return Promise.reject(error)
  },
)

export default api
