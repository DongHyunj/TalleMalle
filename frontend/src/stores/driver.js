/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * ==============================================================================
 * 2. CONFIG & STORES (드라이버 세션 — localStorage 키 DRIVERINFO)
 * ==============================================================================
 */

// 다른 페이지에서 const driverStore = useDriverStore() 후
// driverStore.driver, driverStore.driver.id, driverStore.driver.email 등 사용

export const useDriverStore = defineStore('driver', () => {
  const raw = JSON.parse(localStorage.getItem('DRIVERINFO') || localStorage.getItem('driverInfo') || 'null')
  const driver = ref(raw?.user ?? raw)

  function login(driverInfo) {
    const driverData = driverInfo?.user ?? driverInfo
    driver.value = driverData
    localStorage.setItem('DRIVERINFO', JSON.stringify(driverData))
    localStorage.setItem('driverInfo', JSON.stringify(driverData))
  }

  function logout() {
    driver.value = null
    // 드라이버/토큰 관련 저장값 정리
    localStorage.removeItem('DRIVERINFO')
    localStorage.removeItem('driverInfo')
    localStorage.removeItem('ATOKEN')
    sessionStorage.removeItem('ATOKEN')
    // 환경별 쿠키 제거 (localhost/실서비스 도메인 모두 대비)
    document.cookie = 'ATOKEN=; Max-Age=0; path=/'
    document.cookie = `ATOKEN=; Max-Age=0; path=/; domain=${window.location.hostname}`
    window.location.href = '/driverlogin' // 확실한 리셋을 위해
  }

  return { driver, login, logout }
})
