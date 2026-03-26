<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/payment'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const { customerKey, authKey } = route.query
  try {
    await api.enroll(customerKey, authKey)
    await router.push('/mypage')
  } catch (err) {
    // console.error('등록 실패', err)
  }
})
</script>

<template></template>

<style scoped></style>
