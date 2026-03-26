/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * ==============================================================================
 * 2. AUTH STORE (통합 관리)
 * ==============================================================================
 */

// 다른 페이지에서 const authStore = useAuthStore() 변수 선언해주고
// authStore.user, authStore.user.id, authStore.user.email 이런식으로 사용하면 됨
  
export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)         // 프로필 정보 (idx, nickname, imageUrl 등)

    function login(userInfo) {
      user.value = userInfo
    }

    // 유저 정보 갱신 (프로필 수정 등)
    function updateUser(newInfo) {
      if (user.value) {
        user.value = { ...user.value, ...newInfo }
      } else {
        user.value = newInfo
      }
    }

    function logout() {
        user.value = null
        window.location.href = '/login'
    }

    return { user, login, logout, updateUser }
})
