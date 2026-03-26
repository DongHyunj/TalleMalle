<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  // URL 쿼리 파라미터에서 데이터 추출 (LoginRes DTO와 동일한 구조)
  const userInfo = {
    idx: route.query.idx,
    email: route.query.email,
    name: route.query.name,
    nickname: route.query.nickname,
    role: route.query.role,
    status: route.query.status,
  }

  // [예외 처리] 데이터가 아예 없으면 로그인 페이지로 바로 튕겨냄
  if (!userInfo.email) {
    // console.error('소셜 로그인 정보가 유실되었습니다.')
    router.push('/login')
    return
  }

  // [메인 로직] 이제 email이 있다는 것이 보장됨
  // 1. 권한이 GUEST(최초 가입자)인 경우
  if (userInfo.role === 'ROLE_GUEST') {
    // 최초 가입자: localStorage 저장 없이 추가 정보 페이지로 (login() 호출하지 않음)
    alert('반갑습니다! 원활한 서비스 이용을 위해 추가 정보를 입력해주세요.')
    router.push('/signup/extra')
  }
  // 2. 권한이 USER(기존 회원)인 경우
  else if (userInfo.role === 'ROLE_USER') {
    // 기존 회원: 로그인 처리 후 메인으로
    // 이때만 login()을 호출하여 localStorage와 Store를 세팅함
    authStore.login(userInfo)
    router.push('/')
  }
})
</script>
<template><div>로그인 처리 중..</div></template>
